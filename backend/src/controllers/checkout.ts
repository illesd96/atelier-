import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';
import emailService from '../services/email';
import config from '../config';
import { CheckoutRequest, CartItem } from '../types';
import { validateCouponInternal } from './coupons';

const checkoutSchema = z.object({
  items: z.array(z.object({
    room_id: z.string(),
    room_name: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    price: z.number().min(0),
    special_event_id: z.string().optional(),
    special_event_name: z.string().optional(),
  })).min(1),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  invoice: z.object({
    required: z.boolean(),
    company: z.string().optional(),
    tax_number: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  language: z.enum(['hu', 'en']),
  terms_accepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
  coupon_code: z.string().optional(),
});

export const createCheckout = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const checkoutData: CheckoutRequest = checkoutSchema.parse(req.body);
    
    // VALIDATE AVAILABILITY BEFORE CREATING ORDER
    const unavailableItems: string[] = [];
    
    for (const item of checkoutData.items) {
      const itemWithEvent = item as any;
      
      // Check if this is a special event booking
      if (itemWithEvent.special_event_id) {
        // Validate special event availability
        const eventCheck = await client.query(
          `SELECT * FROM special_events WHERE id = $1 AND active = true`,
          [itemWithEvent.special_event_id]
        );
        
        if (eventCheck.rows.length === 0) {
          unavailableItems.push(
            `${item.room_name} on ${item.date} at ${item.start_time}`
          );
          continue;
        }
        
        // Check if this specific time slot has capacity remaining
        const eventData = eventCheck.rows[0];
        const bookedCheck = await client.query(
          `SELECT COUNT(*) as count
          FROM order_items oi
          JOIN special_event_bookings seb ON seb.order_item_id = oi.id
          JOIN orders o ON o.id = oi.order_id
          WHERE seb.special_event_id = $1
          AND oi.booking_date = $2
          AND oi.start_time = $3
          AND oi.status IN ('pending', 'booked')
          AND o.status IN ('pending', 'paid')`,
          [itemWithEvent.special_event_id, item.date, `${item.start_time}:00`]
        );
        
        let maxCapacity = eventData.max_capacity_per_slot || 1;
        if (eventData.use_custom_slots && eventData.custom_slots) {
          const slots = typeof eventData.custom_slots === 'string' ? JSON.parse(eventData.custom_slots) : eventData.custom_slots;
          const matchingSlot = slots.find((s: any) => s.start === item.start_time || s.start === `${item.start_time}:00`);
          if (matchingSlot?.max_capacity !== undefined) {
            maxCapacity = matchingSlot.max_capacity;
          }
        }
        
        if (parseInt(bookedCheck.rows[0].count) >= maxCapacity) {
          unavailableItems.push(
            `${item.room_name} on ${item.date} at ${item.start_time}`
          );
        }
      } else {
        // Normal booking validation
        const isAvailable = await bookingService.isSlotAvailable(
          item.room_id, 
          item.date, 
          item.start_time
        );
        
        if (!isAvailable) {
          unavailableItems.push(
            `${item.room_name} on ${item.date} at ${item.start_time}`
          );
        }
      }
    }
    
    if (unavailableItems.length > 0) {
      return res.status(409).json({
        error: 'Some time slots are no longer available',
        unavailable_items: unavailableItems,
        message: 'The following slots have been booked by someone else: ' + unavailableItems.join(', '),
      });
    }
    
    await client.query('BEGIN');
    
    // Calculate total
    const originalAmount = checkoutData.items.reduce((sum, item) => sum + item.price, 0);
    
    // Get user ID if logged in
    const userId = req.user?.userId || null;
    
    // Validate and apply coupon if provided
    let couponId: string | null = null;
    let discountAmount = 0;
    const couponCode = (req.body as any).coupon_code;
    
    if (couponCode) {
      const couponResult = await validateCouponInternal(couponCode, originalAmount, userId, client);
      if (!couponResult.valid) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Coupon validation failed',
          message: couponResult.error,
        });
      }
      couponId = couponResult.coupon.id;
      discountAmount = couponResult.discount_amount!;
    }
    
    const totalAmount = originalAmount - discountAmount;
    
    // Parse address components from the full address string
    // Format: "Street, PostalCode City, Country"
    let billingStreet = null;
    let billingCity = null;
    let billingZip = null;
    let billingCountry = null;
    
    if (checkoutData.invoice?.address) {
      const addressParts = checkoutData.invoice.address.split(',').map(part => part.trim());
      billingStreet = addressParts[0] || null;
      
      // Parse "PostalCode City" from second part
      if (addressParts[1]) {
        const zipCityParts = addressParts[1].trim().split(' ');
        billingZip = zipCityParts[0] || null;
        billingCity = zipCityParts.slice(1).join(' ') || null;
      }
      
      billingCountry = addressParts[2] || 'Hungary';
    }
    
    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id, status, language, customer_name, email, phone, 
        total_amount, currency, invoice_required, invoice_company, 
        invoice_tax_number, invoice_address, 
        billing_street, billing_city, billing_zip, billing_country,
        terms_accepted, privacy_accepted,
        coupon_id, discount_amount, original_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id
    `, [
      userId,
      'pending',
      checkoutData.language,
      checkoutData.customer.name,
      checkoutData.customer.email,
      checkoutData.customer.phone || null,
      totalAmount,
      config.business.currency,
      checkoutData.invoice?.required || false,
      checkoutData.invoice?.company || null,
      checkoutData.invoice?.tax_number || null,
      checkoutData.invoice?.address || null,
      billingStreet,
      billingCity,
      billingZip,
      billingCountry,
      checkoutData.terms_accepted,
      checkoutData.privacy_accepted,
      couponId,
      discountAmount,
      discountAmount > 0 ? originalAmount : null,
    ]);
    
    const orderId = orderResult.rows[0].id;
    
    // Create order items
    for (const item of checkoutData.items) {
      const orderItemResult = await client.query(`
        INSERT INTO order_items (
          order_id, room_id, booking_date, start_time, end_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        orderId,
        item.room_id,
        item.date,
        item.start_time,
        item.end_time,
        'pending',
      ]);
      
      // If this is a special event booking, link it
      if ((item as any).special_event_id) {
        const orderItemId = orderItemResult.rows[0].id;
        await client.query(`
          INSERT INTO special_event_bookings (special_event_id, order_item_id)
          VALUES ($1, $2)
        `, [(item as any).special_event_id, orderItemId]);
      }
    }
    
    // Record coupon usage and increment counter
    if (couponId) {
      await client.query(
        `INSERT INTO coupon_usages (coupon_id, order_id, user_id, discount_amount)
         VALUES ($1, $2, $3, $4)`,
        [couponId, orderId, userId, discountAmount]
      );
      await client.query(
        `UPDATE coupons SET current_uses = current_uses + 1 WHERE id = $1`,
        [couponId]
      );
    }
    
    if (totalAmount <= 0) {
      // Free order - skip payment, confirm directly
      const bookingResult = await bookingService.createBookings(orderId);
      if (!bookingResult.success) {
        throw new Error('Failed to create bookings for free order');
      }

      await client.query(
        `UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      // Send confirmation email (non-blocking)
      try {
        const orderForEmail = {
          id: orderId,
          status: 'paid' as const,
          language: checkoutData.language,
          customer_name: checkoutData.customer.name,
          email: checkoutData.customer.email,
          phone: checkoutData.customer.phone || undefined,
          total_amount: 0,
          currency: config.business.currency,
          invoice_required: checkoutData.invoice?.required || false,
          invoice_company: checkoutData.invoice?.company,
          invoice_tax_number: checkoutData.invoice?.tax_number,
          invoice_address: checkoutData.invoice?.address,
          terms_accepted: true,
          privacy_accepted: true,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const itemsForEmail = checkoutData.items.map(item => ({
          room_name: item.room_name,
          booking_date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          special_event_name: (item as any).special_event_name || null,
        })) as any[];

        const calendarFile = Buffer.from(
          emailService.generateCalendarFile(orderForEmail as any, itemsForEmail),
          'utf-8'
        );
        await emailService.sendBookingConfirmation(orderForEmail as any, itemsForEmail, calendarFile);
      } catch (emailError) {
        console.error('Error sending confirmation email for free order:', emailError);
      }

      return res.json({
        orderId,
        total: 0,
        currency: config.business.currency,
        free: true,
      });
    }

    // Paid order - create Barion payment
    const barionItems = checkoutData.items.map(item => {
      const itemWithEvent = item as any;
      const eventName = itemWithEvent.special_event_name ? ` - ${itemWithEvent.special_event_name}` : '';
      return {
        name: `${item.room_name}${eventName} - ${item.date} ${item.start_time}-${item.end_time}`,
        description: itemWithEvent.special_event_id ? 'Special event booking' : 'Photo studio booking',
        quantity: 1,
        unitPrice: item.price,
      };
    });
    
    if (discountAmount > 0) {
      barionItems.push({
        name: `Kupon kedvezmény (${couponCode})`,
        description: 'Coupon discount',
        quantity: 1,
        unitPrice: -discountAmount,
      });
    }
    
    const paymentRequest = barionService.createPaymentRequest(
      orderId,
      barionItems,
      totalAmount,
      config.business.currency,
      checkoutData.language === 'hu' ? 'hu-HU' : 'en-US',
      checkoutData.customer.email
    );
    
    const barionResponse = await barionService.createPayment(paymentRequest);
    
    if (!barionResponse.PaymentId) {
      throw new Error('Failed to create Barion payment');
    }
    
    // Save payment record
    await client.query(`
      INSERT INTO payments (order_id, provider, provider_ref, status, payload_json)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      orderId,
      'barion',
      barionResponse.PaymentId,
      'pending',
      JSON.stringify(barionResponse),
    ]);
    
    await client.query('COMMIT');
    
    res.json({
      orderId,
      paymentId: barionResponse.PaymentId,
      redirectUrl: barionResponse.GatewayUrl,
      total: totalAmount,
      original_total: discountAmount > 0 ? originalAmount : undefined,
      discount: discountAmount > 0 ? discountAmount : undefined,
      coupon_code: discountAmount > 0 ? couponCode : undefined,
      currency: config.business.currency,
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('Error in createCheckout:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    client.release();
  }
};


