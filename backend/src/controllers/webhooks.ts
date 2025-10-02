import { Request, Response } from 'express';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';
import emailService from '../services/email';
import config from '../config';

export const handleBarionWebhook = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-barion-signature'] as string;
    
    // Verify webhook signature
    if (!barionService.verifyWebhookSignature(payload, signature)) {
      console.error('Invalid Barion webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { PaymentId, PaymentState } = req.body;
    
    if (!PaymentId) {
      return res.status(400).json({ error: 'Missing PaymentId' });
    }
    
    await client.query('BEGIN');
    
    // Update payment status
    await client.query(`
      UPDATE payments 
      SET status = $1, payload_json = $2, updated_at = CURRENT_TIMESTAMP
      WHERE provider_ref = $3
    `, [PaymentState, payload, PaymentId]);
    
    // Get the order associated with this payment
    const orderResult = await client.query(`
      SELECT o.*, p.id as payment_id
      FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE p.provider_ref = $1
    `, [PaymentId]);
    
    if (orderResult.rows.length === 0) {
      console.error('Order not found for PaymentId:', PaymentId);
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    if (PaymentState === 'Succeeded') {
      try {
        // Create internal bookings using booking service
        const bookingResult = await bookingService.createBookings(order.id);
        
        if (!bookingResult.success) {
          throw new Error('Failed to create internal bookings');
        }
        
        // Get order items for email
        const itemsResult = await client.query(`
          SELECT oi.*, r.name as room_name
          FROM order_items oi
          LEFT JOIN rooms r ON r.id = oi.room_id
          WHERE oi.order_id = $1
        `, [order.id]);
        
        const orderItems = itemsResult.rows;
        
        // Update order status to paid
        await client.query(`
          UPDATE orders 
          SET status = 'paid', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [order.id]);
        
        console.log('Successfully created bookings:', bookingResult.bookingIds);
        
        // Send confirmation email
        try {
          const calendarFile = Buffer.from(
            emailService.generateCalendarFile(order, orderItems),
            'utf-8'
          );
          
          await emailService.sendBookingConfirmation(order, orderItems, calendarFile);
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
    res.json({ success: true });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in Barion webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Cal.com webhook handler removed - using internal booking system
