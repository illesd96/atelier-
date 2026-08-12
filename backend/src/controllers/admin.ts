import { Request, Response } from 'express';
import pool from '../database/connection';
import config from '../config';
import bookingService from '../services/booking';
import emailService from '../services/email';

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
        p.status as payment_status,
        i.id as invoice_id,
        i.invoice_number,
        i.status as invoice_status
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN rooms r ON oi.room_id = r.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON p.order_id = o.id
      LEFT JOIN invoices i ON i.order_id = o.id
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
      GROUP BY o.id, u.id, p.id, i.id
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

/**
 * Cancel a booking item
 */
export async function cancelBookingItem(req: Request, res: Response) {
  try {
    const { bookingItemId } = req.params;
    
    const result = await pool.query(
      `UPDATE order_items 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, status, booking_date, start_time, end_time, room_id`,
      [bookingItemId]
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
      message: 'Booking item cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Modify a booking item (change date/time/room)
 */
export async function modifyBookingItem(req: Request, res: Response) {
  try {
    const { bookingItemId } = req.params;
    const { room_id, booking_date, start_time, end_time } = req.body;
    
    // Validate required fields
    if (!room_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: room_id, booking_date, start_time, end_time',
      });
    }
    
    // Check if the new slot is available
    const conflictCheck = await pool.query(
      `SELECT id FROM order_items 
       WHERE room_id = $1 
       AND booking_date = $2 
       AND start_time < $4 
       AND end_time > $3
       AND status IN ('booked', 'pending')
       AND id != $5`,
      [room_id, booking_date, start_time, end_time, bookingItemId]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Time slot is not available',
      });
    }
    
    // Update the booking item
    const result = await pool.query(
      `UPDATE order_items 
       SET room_id = $1, booking_date = $2, start_time = $3, end_time = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, room_id, booking_date, start_time, end_time, status`,
      [room_id, booking_date, start_time, end_time, bookingItemId]
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
      message: 'Booking item modified successfully',
    });
  } catch (error) {
    console.error('Modify booking item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}


/**
 * Create a manual booking on behalf of a customer (admin only).
 * Used for clients who book by phone/email instead of online (e.g. big clients).
 * Skips payment entirely: the order is confirmed immediately.
 */
export async function createManualBooking(req: Request, res: Response) {
  const client = await pool.connect();

  try {
    const {
      items,
      customer,
      note,
      free_of_charge = false,
      send_email = true,
      language = 'hu',
    } = req.body || {};

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one time slot is required' });
    }
    if (!customer || typeof customer.name !== 'string' || customer.name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return res.status(400).json({ success: false, error: 'Invalid customer email' });
    }
    if (language !== 'hu' && language !== 'en') {
      return res.status(400).json({ success: false, error: 'Invalid language' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    // Validate items and compute server-side prices
    let totalAmount = 0;
    const validatedItems: Array<{
      room_id: string;
      room_name: string;
      date: string;
      start_time: string;
      end_time: string;
      price: number;
    }> = [];

    for (const item of items) {
      if (!item || !dateRegex.test(item.date) || !timeRegex.test(item.start_time) || !timeRegex.test(item.end_time)) {
        return res.status(400).json({ success: false, error: 'Invalid slot format' });
      }

      const studio = config.studios.find(
        (s: { id: string; name: string; price?: number }) => s.id === item.room_id
      );
      if (!studio) {
        return res.status(400).json({ success: false, error: `Unknown room: ${item.room_id}` });
      }

      const available = await bookingService.isSlotAvailable(item.room_id, item.date, item.start_time);
      if (!available) {
        return res.status(409).json({
          success: false,
          error: `Slot not available: ${studio.name} ${item.date} ${item.start_time}`,
        });
      }

      const price = free_of_charge ? 0 : (studio.price ?? config.business.hourlyRate);
      totalAmount += price;
      validatedItems.push({
        room_id: item.room_id,
        room_name: studio.name,
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        price,
      });
    }

    // Placeholder satisfies orders.email NOT NULL when the client has no email;
    // confirmation emails are only sent to real, admin-entered addresses.
    const customerEmail = customer.email?.trim() || 'no-email@manual.booking';

    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (
        status, language, customer_name, email, phone,
        total_amount, currency, invoice_required,
        terms_accepted, privacy_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        'pending',
        language,
        customer.name.trim(),
        customerEmail,
        customer.phone?.trim() || null,
        totalAmount,
        config.business.currency,
        false,
        true,
        true,
      ]
    );
    const orderId = orderResult.rows[0].id;

    const adminNote = `Manual booking by admin${note ? `: ${String(note).trim()}` : ''}`;
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, room_id, booking_date, start_time, end_time, status, admin_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.room_id, item.date, item.start_time, item.end_time, 'pending', adminNote]
      );
    }

    const bookingResult = await bookingService.createBookings(orderId);
    if (!bookingResult.success) {
      throw new Error('Failed to create bookings for manual order');
    }

    await client.query(
      `UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [orderId]
    );

    await client.query('COMMIT');

    // Send confirmation email only when the admin entered a real address
    let emailSent = false;
    if (send_email && customer.email?.trim()) {
      try {
        const orderForEmail = {
          id: orderId,
          status: 'paid' as const,
          language,
          customer_name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone?.trim() || undefined,
          total_amount: totalAmount,
          currency: config.business.currency,
          invoice_required: false,
          terms_accepted: true,
          privacy_accepted: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        const itemsForEmail = validatedItems.map(item => ({
          room_name: item.room_name,
          booking_date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          special_event_name: null,
        })) as any[];

        const calendarFile = Buffer.from(
          emailService.generateCalendarFile(orderForEmail as any, itemsForEmail),
          'utf-8'
        );
        await emailService.sendBookingConfirmation(orderForEmail as any, itemsForEmail, calendarFile);
        emailSent = true;
      } catch (emailError) {
        console.error('Error sending manual booking confirmation email:', emailError);
      }
    }

    res.json({
      success: true,
      orderId,
      total: totalAmount,
      currency: config.business.currency,
      email_sent: emailSent,
    });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Create manual booking error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
}
