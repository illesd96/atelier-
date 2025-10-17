import { Request, Response } from 'express';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';
import emailService from '../services/email';
import config from '../config';

export const handleBarionWebhook = async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log('📥 Barion webhook received:', {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    timestamp: new Date().toISOString()
  });

  // Quickly validate and respond to Barion to avoid timeout
  let { PaymentId, PaymentState } = req.body;
  
  if (!PaymentId) {
    console.error('❌ Missing PaymentId in webhook');
    return res.status(400).json({ error: 'Missing PaymentId' });
  }
  
  console.log('💳 Processing Barion webhook:', { PaymentId, PaymentState });

  // If PaymentState is not provided, fetch it from Barion
  if (!PaymentState) {
    console.log('⚠️  PaymentState not provided in webhook, fetching from Barion API...');
    try {
      const paymentStatus = await barionService.getPaymentState(PaymentId);
      PaymentState = paymentStatus.Status;
      console.log('✅ Fetched PaymentState from Barion:', PaymentState);
    } catch (error) {
      console.error('❌ Failed to fetch PaymentState from Barion:', error);
      // Return 200 to prevent Barion from retrying
      return res.status(200).json({ 
        success: false, 
        error: 'Could not fetch payment state',
        message: 'Webhook acknowledged'
      });
    }
  }

  const client = await pool.connect();
  
  try {
    
    await client.query('BEGIN');
    
    // Update payment status
    const payload = JSON.stringify(req.body);
    await client.query(`
      UPDATE payments 
      SET status = $1, payload_json = $2, updated_at = CURRENT_TIMESTAMP
      WHERE provider_ref = $3
    `, [PaymentState, payload, PaymentId]);
    
    console.log('✅ Payment status updated:', { PaymentId, PaymentState });
    
    // Get the order associated with this payment
    const orderResult = await client.query(`
      SELECT o.*, p.id as payment_id
      FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE p.provider_ref = $1
    `, [PaymentId]);
    
    if (orderResult.rows.length === 0) {
      console.error('❌ Order not found for PaymentId:', PaymentId);
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    console.log('📦 Order found:', { orderId: order.id, currentStatus: order.status });
    
    // Get order items (needed for both success and failure cases)
    const itemsResult = await client.query(`
      SELECT oi.*, r.name as room_name
      FROM order_items oi
      LEFT JOIN rooms r ON r.id = oi.room_id
      WHERE oi.order_id = $1
    `, [order.id]);
    
    const orderItems = itemsResult.rows;
    
    if (PaymentState === 'Succeeded') {
      try {
        // Create internal bookings using booking service
        const bookingResult = await bookingService.createBookings(order.id);
        
        if (!bookingResult.success) {
          throw new Error('Failed to create internal bookings');
        }
        
        // Update order status to paid
        await client.query(`
          UPDATE orders 
          SET status = 'paid', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [order.id]);
        
        console.log('✅ Successfully created bookings:', bookingResult.bookingIds);
        
        // Send confirmation email
        console.log('📧 Sending confirmation email to:', order.email);
        try {
          const calendarFile = Buffer.from(
            emailService.generateCalendarFile(order, orderItems),
            'utf-8'
          );
          
          await emailService.sendBookingConfirmation(order, orderItems, calendarFile);
          
          // Log the confirmation email
          const bookingDate = orderItems[0]?.booking_date;
          if (bookingDate) {
            await emailService.logEmail(order.id, 'confirmation', bookingDate);
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the booking process if email fails
        }
        
      } catch (bookingError) {
        console.error('Error creating internal bookings:', bookingError);
        
        // Mark order as failed
        await client.query(`
          UPDATE orders 
          SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [order.id]);
        
        // Send failure notification email
        try {
          await emailService.sendPaymentFailedNotification(order, orderItems);
        } catch (emailError) {
          console.error('Error sending payment failed email:', emailError);
        }
      }
    } else if (PaymentState === 'Failed' || PaymentState === 'Canceled') {
      // Update order status
      await client.query(`
        UPDATE orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [PaymentState.toLowerCase(), order.id]);
    }
    
    await client.query('COMMIT');
    
    const duration = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${duration}ms`);
    
    // Always return success to Barion (even if some operations fail)
    // This prevents the "Hello Rosti!" error
    res.status(200).json({ success: true, message: 'Webhook received' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    const duration = Date.now() - startTime;
    console.error(`❌ Error in Barion webhook after ${duration}ms:`, error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    console.error('Request body:', req.body);
    
    // Still return 200 to Barion to prevent retry loops
    // The payment status will be checked via getPaymentState on user return
    res.status(200).json({ success: false, error: 'Processing error', message: 'Webhook acknowledged' });
  } finally {
    client.release();
  }
};

// Cal.com webhook handler removed - using internal booking system
