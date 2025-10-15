import { Request, Response } from 'express';
import pool from '../database/connection';
import barionService from '../services/barion';
import bookingService from '../services/booking';

/**
 * Get order status by ID
 */
export const getOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  
  try {
    // Get order from database
    const orderResult = await pool.query(`
      SELECT o.*, p.provider_ref as payment_id, p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.id = $1
    `, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    const order = orderResult.rows[0];
    
    // If payment is still pending, check with Barion for latest status
    if (order.payment_id && order.status === 'pending') {
      try {
        const barionStatus = await barionService.getPaymentState(order.payment_id);
        
        // Update local status if Barion has different status
        if (barionStatus.Status !== order.payment_status) {
          await pool.query(`
            UPDATE payments 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE provider_ref = $2
          `, [barionStatus.Status, order.payment_id]);
          
          // Update order status based on Barion status
          if (barionStatus.Status === 'Succeeded') {
            await pool.query(`
              UPDATE orders 
              SET status = 'paid', updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [orderId]);
            
            order.status = 'paid';
            
            // FALLBACK: Create bookings if webhook hasn't run yet
            console.log('💡 Payment succeeded, checking if bookings need to be created...');
            try {
              const checkBookings = await pool.query(
                `SELECT COUNT(*) as count FROM order_items WHERE order_id = $1 AND status = 'booked'`,
                [orderId]
              );
              
              if (parseInt(checkBookings.rows[0].count) === 0) {
                console.log('🔄 Webhook hasn\'t created bookings yet, creating them now...');
                const bookingResult = await bookingService.createBookings(orderId);
                console.log('✅ Bookings created via fallback:', bookingResult.bookingIds);
              } else {
                console.log('✅ Bookings already created by webhook');
              }
            } catch (bookingError) {
              console.error('❌ Error creating bookings in fallback:', bookingError);
              // Don't fail the whole request if booking creation fails
            }
          } else if (barionStatus.Status === 'Failed' || barionStatus.Status === 'Canceled') {
            await pool.query(`
              UPDATE orders 
              SET status = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [barionStatus.Status.toLowerCase(), orderId]);
            
            order.status = barionStatus.Status.toLowerCase();
          }
        }
      } catch (barionError) {
        console.error('Error checking Barion payment status:', barionError);
        // Continue with database status if Barion check fails
      }
    }
    
    // Get order items
    const itemsResult = await pool.query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.room_id,
        oi.booking_date,
        to_char(oi.start_time, 'HH24:MI') as start_time,
        to_char(oi.end_time, 'HH24:MI') as end_time,
        oi.booking_id,
        oi.status,
        oi.created_at,
        oi.updated_at,
        r.name as room_name
      FROM order_items oi
      LEFT JOIN rooms r ON r.id = oi.room_id
      WHERE oi.order_id = $1
      ORDER BY oi.booking_date, oi.start_time
    `, [orderId]);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        customer_name: order.customer_name,
        email: order.email,
        total_amount: order.total_amount,
        currency: order.currency,
        created_at: order.created_at,
      },
      items: itemsResult.rows,
      payment_id: order.payment_id,
    });
    
  } catch (error) {
    console.error('Error getting order status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};




