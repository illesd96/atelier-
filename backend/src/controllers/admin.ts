import { Request, Response } from 'express';
import pool from '../database/connection';

/**
 * Get all bookings for admin view
 */
export async function getAllBookings(req: Request, res: Response) {
  try {
    // Query parameters for filtering and pagination
    const { 
      status, 
      date_from, 
      date_to,
      limit = '50',
      offset = '0'
    } = req.query;

    let query = `
      SELECT 
        o.id,
        o.status,
        o.customer_name,
        o.email,
        o.phone,
        o.total_amount,
        o.currency,
        o.created_at,
        o.updated_at,
        o.user_id,
        u.name as user_name,
        u.email as user_email,
        json_agg(
          json_build_object(
            'id', oi.id,
            'room_id', oi.room_id,
            'room_name', r.name,
            'booking_date', oi.booking_date,
            'start_time', oi.start_time,
            'end_time', oi.end_time,
            'status', oi.status,
            'booking_id', oi.booking_id
          ) ORDER BY oi.booking_date, oi.start_time
        ) as items,
        p.provider_ref as payment_id,
        p.status as payment_status
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN rooms r ON oi.room_id = r.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON p.order_id = o.id
    `;

    const queryParams: any[] = [];
    const conditions: string[] = [];

    // Filter by status
    if (status && typeof status === 'string') {
      queryParams.push(status);
      conditions.push(`o.status = $${queryParams.length}`);
    }

    // Filter by date range
    if (date_from && typeof date_from === 'string') {
      queryParams.push(date_from);
      conditions.push(`oi.booking_date >= $${queryParams.length}`);
    }

    if (date_to && typeof date_to === 'string') {
      queryParams.push(date_to);
      conditions.push(`oi.booking_date <= $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY o.id, u.id, p.id
      ORDER BY o.created_at DESC
    `;

    // Add pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    queryParams.push(limitNum, offsetNum);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT o.id) FROM orders o';
    
    if (conditions.length > 0) {
      countQuery += ' LEFT JOIN order_items oi ON o.id = oi.order_id WHERE ' + 
        conditions.join(' AND ');
    }

    const countResult = await pool.query(
      countQuery, 
      queryParams.slice(0, conditions.length)
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      bookings: result.rows,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + result.rows.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get booking statistics for admin dashboard
 */
export async function getBookingStats(req: Request, res: Response) {
  try {
    // Get stats for today, this week, this month
    const statsQuery = `
      SELECT
        COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= CURRENT_DATE) as today_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= date_trunc('week', CURRENT_DATE)) as week_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= date_trunc('month', CURRENT_DATE)) as month_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'paid') as paid_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'failed') as failed_orders,
        SUM(o.total_amount) FILTER (WHERE o.status = 'paid' AND o.created_at >= date_trunc('month', CURRENT_DATE)) as month_revenue,
        COUNT(DISTINCT oi.id) as total_bookings,
        COUNT(DISTINCT oi.id) FILTER (WHERE oi.booking_date >= CURRENT_DATE) as upcoming_bookings
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        today_orders: parseInt(stats.today_orders) || 0,
        week_orders: parseInt(stats.week_orders) || 0,
        month_orders: parseInt(stats.month_orders) || 0,
        paid_orders: parseInt(stats.paid_orders) || 0,
        pending_orders: parseInt(stats.pending_orders) || 0,
        failed_orders: parseInt(stats.failed_orders) || 0,
        month_revenue: parseFloat(stats.month_revenue) || 0,
        total_bookings: parseInt(stats.total_bookings) || 0,
        upcoming_bookings: parseInt(stats.upcoming_bookings) || 0,
      },
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get schedule/calendar view of all bookings
 */
export async function getScheduleView(req: Request, res: Response) {
  try {
    const { date_from, date_to, room_id } = req.query;
    
    let query = `
      SELECT 
        oi.id,
        oi.booking_id,
        oi.booking_date,
        to_char(oi.start_time, 'HH24:MI') as start_time,
        to_char(oi.end_time, 'HH24:MI') as end_time,
        oi.room_id,
        r.name as room_name,
        oi.status,
        oi.attendance_status,
        oi.admin_notes,
        o.id as order_id,
        o.customer_name,
        o.email,
        o.phone,
        o.status as order_status
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN rooms r ON oi.room_id = r.id
      WHERE o.status = 'paid'
    `;
    
    const queryParams: any[] = [];
    
    if (date_from && typeof date_from === 'string') {
      queryParams.push(date_from);
      query += ` AND oi.booking_date >= $${queryParams.length}`;
    }
    
    if (date_to && typeof date_to === 'string') {
      queryParams.push(date_to);
      query += ` AND oi.booking_date <= $${queryParams.length}`;
    }
    
    if (room_id && typeof room_id === 'string') {
      queryParams.push(room_id);
      query += ` AND oi.room_id = $${queryParams.length}`;
    }
    
    query += ' ORDER BY oi.booking_date, oi.start_time, r.name';
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error('Get schedule view error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Update attendance status for a booking
 */
export async function updateAttendance(req: Request, res: Response) {
  try {
    const { bookingItemId } = req.params;
    const { attendance_status, admin_notes } = req.body;
    
    // Validate attendance_status
    const validStatuses = ['pending', 'showed_up', 'no_show', 'cancelled'];
    if (!validStatuses.includes(attendance_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attendance status',
      });
    }
    
    const result = await pool.query(
      `UPDATE order_items 
       SET attendance_status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, attendance_status, admin_notes`,
      [attendance_status, admin_notes || null, bookingItemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking item not found',
      });
    }
    
    res.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

