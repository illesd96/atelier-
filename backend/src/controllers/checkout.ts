import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';
import config from '../config';
import { CheckoutRequest, CartItem } from '../types';

const checkoutSchema = z.object({
  items: z.array(z.object({
    room_id: z.string(),
    room_name: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    price: z.number().positive(),
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
        
        // Check if this specific time slot is already booked
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
        
        if (parseInt(bookedCheck.rows[0].count) > 0) {
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
    const totalAmount = checkoutData.items.reduce((sum, item) => sum + item.price, 0);
    
    // Get user ID if logged in
    const userId = req.user?.userId || null;
    
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
        terms_accepted, privacy_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
    
    // Create Barion payment
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
    
    const paymentRequest = barionService.createPaymentRequest(
      orderId,
      barionItems,
      totalAmount,
      config.business.currency,
      checkoutData.language === 'hu' ? 'hu-HU' : 'en-US',
      checkoutData.customer.email // Pass customer email for payment notifications
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


