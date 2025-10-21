import pool from '../database/connection';
import config from '../config';
import { TimeSlot, RoomAvailability, AvailabilityResponse } from '../types';

class BookingService {
  /**
   * Get availability for all studios on a specific date
   */
  async getAvailability(date: string): Promise<AvailabilityResponse> {
    const client = await pool.connect();
    
    try {
      let bookedSlots: any[] = [];
      
      try {
        // Check if tables exist first
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('orders', 'order_items')
        `);
        
        if (tablesResult.rows.length === 2) {
          // Get all booked slots for this date
          // Include: 
          // 1. Items with 'booked' status and order 'paid' (confirmed bookings)
          // 2. Items with 'pending' status and order 'paid' (webhook hasn't run yet)
          // 3. Items with 'pending' status and order 'pending' (payment in progress, temporarily reserved)
          const bookedSlotsResult = await client.query(`
            SELECT 
              room_id, 
              to_char(start_time, 'HH24:MI') as start_time,
              to_char(end_time, 'HH24:MI') as end_time,
              oi.status
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.booking_date = $1 
            AND (
              (oi.status = 'booked' AND o.status = 'paid')  -- Confirmed bookings
              OR (oi.status = 'pending' AND o.status = 'paid')  -- Paid but webhook didn't run
              OR (oi.status = 'pending' AND o.status = 'pending')  -- Payment in progress
            )
          `, [date]);
          
          bookedSlots = bookedSlotsResult.rows;
          
          console.log(`Found ${bookedSlots.length} booked/pending slots for ${date}`);
        }
      } catch (dbError) {
        console.warn('Database tables not ready, showing all slots as available:', dbError);
        bookedSlots = [];
      }
      
      // Generate availability for each studio
      const roomAvailabilities: RoomAvailability[] = [];
      
      for (const studio of config.studios) {
        const slots = this.generateHourlySlots(date, studio.id, bookedSlots);
        
        roomAvailabilities.push({
          id: studio.id,
          name: studio.name,
          slots,
        });
      }
      
      return {
        date,
        rooms: roomAvailabilities,
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * Generate hourly slots for a studio, marking booked ones
   * Always uses Hungarian timezone (Europe/Budapest)
   */
  private generateHourlySlots(
    date: string, 
    studioId: string, 
    bookedSlots: any[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const { openingHours } = config.business;
    
    // Get current date/time in Hungarian timezone
    const hungarianNow = new Date();
    const hungarianTimeString = hungarianNow.toLocaleString('en-US', { 
      timeZone: 'Europe/Budapest' 
    });
    const now = new Date(hungarianTimeString);
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const isPastDate = selectedDate < today;
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentHour = now.getHours();
    
    // Generate hourly slots
    for (let hour = openingHours.start; hour < openingHours.end; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      
      // Check if this slot is booked
      const isBooked = bookedSlots.some(slot => 
        slot.room_id === studioId && 
        slot.start_time === timeStr
      );
      
      // Check if this slot is in the past (for today only, using Hungarian time)
      const isInPast = isToday && hour <= currentHour;
      
      let status: 'available' | 'booked' | 'unavailable' = 'available';
      
      if (isPastDate || isInPast) {
        status = 'unavailable';
      } else if (isBooked) {
        status = 'booked';
      }
      
      slots.push({
        time: timeStr,
        status,
      });
    }
    
    return slots;
  }

  /**
   * Generate a simple 6-character check-in code (uppercase alphanumeric)
   */
  private generateCheckinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters (0, O, 1, I)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create internal booking records (replaces Cal.com booking creation)
   */
  async createBookings(orderId: string): Promise<{ success: boolean; bookingIds: string[] }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get order items that need booking
      const itemsResult = await client.query(`
        SELECT * FROM order_items 
        WHERE order_id = $1 AND status = 'pending'
      `, [orderId]);
      
      const items = itemsResult.rows;
      const bookingIds: string[] = [];
      
      for (const item of items) {
        // Generate a simple booking ID
        const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate a simple check-in code and ensure it's unique
        let checkinCode = this.generateCheckinCode();
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
          const existingCode = await client.query(`
            SELECT id FROM order_items WHERE checkin_code = $1
          `, [checkinCode]);
          
          if (existingCode.rows.length === 0) {
            isUnique = true;
          } else {
            checkinCode = this.generateCheckinCode();
            attempts++;
          }
        }
        
        // Update the order item with booking ID, check-in code, and mark as booked
        await client.query(`
          UPDATE order_items 
          SET booking_id = $1, checkin_code = $2, status = 'booked', updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [bookingId, checkinCode, item.id]);
        
        bookingIds.push(bookingId);
      }
      
      await client.query('COMMIT');
      
      return { success: true, bookingIds };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating bookings:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(orderId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update order status
      await client.query(`
        UPDATE orders 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [orderId]);
      
      // Update order items status
      await client.query(`
        UPDATE order_items 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $1
      `, [orderId]);
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get booking details by order ID
   */
  async getBookingDetails(orderId: string) {
    const client = await pool.connect();
    
    try {
      // Get order
      const orderResult = await client.query(`
        SELECT * FROM orders WHERE id = $1
      `, [orderId]);
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      // Get order items
      const itemsResult = await client.query(`
        SELECT oi.*, r.name as room_name
        FROM order_items oi
        JOIN rooms r ON r.id = oi.room_id
        WHERE oi.order_id = $1
        ORDER BY oi.booking_date, oi.start_time
      `, [orderId]);
      
      return {
        order: orderResult.rows[0],
        items: itemsResult.rows,
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * Check if a time slot is available
   */
  async isSlotAvailable(studioId: string, date: string, startTime: string): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      try {
        // Check if tables exist first
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('orders', 'order_items')
        `);
        
        if (tablesResult.rows.length === 2) {
          const result = await client.query(`
            SELECT COUNT(*) as count
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.room_id = $1 
            AND oi.booking_date = $2 
            AND to_char(oi.start_time, 'HH24:MI') = $3
            AND oi.status IN ('booked', 'pending')
            AND o.status IN ('paid', 'pending')
          `, [studioId, date, startTime]);
          
          return parseInt(result.rows[0].count) === 0;
        }
        
        // If tables don't exist, all slots are available
        return true;
        
      } catch (dbError) {
        console.warn('Database tables not ready, assuming slot is available:', dbError);
        return true;
      }
      
    } finally {
      client.release();
    }
  }

  /**
   * Get studio configuration
   */
  getStudios() {
    return config.studios;
  }

  /**
   * Get business hours
   */
  getBusinessHours() {
    return config.business.openingHours;
  }
}

export default new BookingService();
