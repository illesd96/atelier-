import { Request, Response } from 'express';
import pool from '../database/connection';

/**
 * Get all special events (admin and public)
 */
export const getAllSpecialEvents = async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;
    
    let query = `
      SELECT 
        se.*,
        r.name as room_name,
        (
          SELECT COUNT(*) 
          FROM special_event_bookings seb 
          JOIN order_items oi ON oi.id = seb.order_item_id 
          WHERE seb.special_event_id = se.id 
          AND oi.status = 'booked'
        ) as total_bookings
      FROM special_events se
      LEFT JOIN rooms r ON r.id = se.room_id
    `;
    
    const params: any[] = [];
    
    if (active_only === 'true') {
      query += ` WHERE se.active = true AND se.end_date >= CURRENT_DATE`;
    }
    
    query += ` ORDER BY se.start_date DESC, se.start_time ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      events: result.rows
    });
  } catch (error) {
    console.error('Error fetching special events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch special events'
    });
  }
};

/**
 * Get a single special event by ID or slug
 */
export const getSpecialEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if it's a UUID format (contains hyphens and is 36 chars) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const result = await pool.query(
      `SELECT 
        se.*,
        r.name as room_name
      FROM special_events se
      LEFT JOIN rooms r ON r.id = se.room_id
      WHERE ${isUUID ? 'se.id = $1' : 'se.slug = $1'}`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Special event not found'
      });
    }
    
    res.json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching special event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch special event'
    });
  }
};

/**
 * Create a new special event (admin only)
 */
export const createSpecialEvent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      room_id,
      start_date,
      end_date,
      start_time,
      end_time,
      slot_duration_minutes,
      price_per_slot,
      active,
      slug,
      use_custom_slots,
      custom_slots
    } = req.body;
    
    // Validation
    if (!name || !start_date || !end_date || !price_per_slot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (name, start_date, end_date, price_per_slot)'
      });
    }
    
    // Validate max_capacity_per_slot if provided
    const max_capacity = req.body.max_capacity_per_slot;
    if (max_capacity !== undefined && (max_capacity < 1 || !Number.isInteger(max_capacity))) {
      return res.status(400).json({
        success: false,
        error: 'max_capacity_per_slot must be a positive integer (minimum 1)'
      });
    }
    
    // If not using custom slots, slot_duration_minutes is required
    if (!use_custom_slots && !slot_duration_minutes) {
      return res.status(400).json({
        success: false,
        error: 'slot_duration_minutes is required when not using custom slots'
      });
    }
    
    // If using custom slots, validate custom_slots format
    if (use_custom_slots) {
      if (!custom_slots || !Array.isArray(custom_slots) || custom_slots.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'custom_slots must be a non-empty array when use_custom_slots is true'
        });
      }
      
      // Validate each slot has start and end
      for (const slot of custom_slots) {
        if (!slot.start || !slot.end) {
          return res.status(400).json({
            success: false,
            error: 'Each custom slot must have start and end times'
          });
        }
      }
    }
    
    // Validate slug format if provided
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO special_events (
        name, description, room_id, start_date, end_date,
        start_time, end_time, slot_duration_minutes, price_per_slot, active, slug,
        use_custom_slots, custom_slots, max_capacity_per_slot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name,
        description || null,
        room_id || null, // Now nullable
        start_date,
        end_date,
        start_time || '08:00:00',
        end_time || '20:00:00',
        slot_duration_minutes || 120, // Default to 120 minutes if using custom slots
        price_per_slot,
        active !== false,
        slug || null,
        use_custom_slots || false,
        custom_slots ? JSON.stringify(custom_slots) : null,
        max_capacity || 1 // Default to 1 if not specified
      ]
    );
    
    res.status(201).json({
      success: true,
      event: result.rows[0],
      message: 'Special event created successfully'
    });
  } catch (error: any) {
    console.error('Error creating special event:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505' && error.constraint === 'special_events_slug_key') {
      return res.status(400).json({
        success: false,
        error: 'This URL slug is already in use. Please choose a different one.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create special event'
    });
  }
};

/**
 * Update a special event (admin only)
 */
export const updateSpecialEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      room_id,
      start_date,
      end_date,
      start_time,
      end_time,
      slot_duration_minutes,
      price_per_slot,
      active,
      slug,
      use_custom_slots,
      custom_slots
    } = req.body;
    
    // Validate slug format if provided
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }
    
    // If using custom slots, validate custom_slots format
    if (use_custom_slots !== undefined && use_custom_slots) {
      if (custom_slots && Array.isArray(custom_slots)) {
        for (const slot of custom_slots) {
          if (!slot.start || !slot.end) {
            return res.status(400).json({
              success: false,
              error: 'Each custom slot must have start and end times'
            });
          }
        }
      }
    }
    
    const max_capacity = req.body.max_capacity_per_slot;
    if (max_capacity !== undefined && (max_capacity < 1 || !Number.isInteger(max_capacity))) {
      return res.status(400).json({
        success: false,
        error: 'max_capacity_per_slot must be a positive integer (minimum 1)'
      });
    }
    
    const result = await pool.query(
      `UPDATE special_events
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        room_id = CASE WHEN $3::varchar IS NULL THEN NULL ELSE COALESCE($3, room_id) END,
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        start_time = COALESCE($6, start_time),
        end_time = COALESCE($7, end_time),
        slot_duration_minutes = COALESCE($8, slot_duration_minutes),
        price_per_slot = COALESCE($9, price_per_slot),
        active = COALESCE($10, active),
        slug = COALESCE($11, slug),
        use_custom_slots = COALESCE($12, use_custom_slots),
        custom_slots = CASE 
          WHEN $13::jsonb IS NULL THEN custom_slots 
          ELSE $13 
        END,
        max_capacity_per_slot = COALESCE($14, max_capacity_per_slot)
      WHERE id = $15
      RETURNING *`,
      [
        name,
        description,
        room_id,
        start_date,
        end_date,
        start_time,
        end_time,
        slot_duration_minutes,
        price_per_slot,
        active,
        slug,
        use_custom_slots,
        custom_slots ? JSON.stringify(custom_slots) : null,
        max_capacity,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Special event not found'
      });
    }
    
    res.json({
      success: true,
      event: result.rows[0],
      message: 'Special event updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating special event:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505' && error.constraint === 'special_events_slug_key') {
      return res.status(400).json({
        success: false,
        error: 'This URL slug is already in use. Please choose a different one.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update special event'
    });
  }
};

/**
 * Delete a special event (admin only)
 */
export const deleteSpecialEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if there are any bookings
    const bookingsCheck = await pool.query(
      `SELECT COUNT(*) as count FROM special_event_bookings WHERE special_event_id = $1`,
      [id]
    );
    
    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete special event with existing bookings. Deactivate it instead.'
      });
    }
    
    const result = await pool.query(
      'DELETE FROM special_events WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Special event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Special event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting special event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete special event'
    });
  }
};

/**
 * Get available slots for a special event
 */
export const getSpecialEventAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }
    
    // Check if it's a UUID format or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    // Get special event details
    let eventResult;
    try {
      eventResult = await pool.query(
        `SELECT * FROM special_events WHERE ${isUUID ? 'id = $1' : 'slug = $1'} AND active = true`,
        [id]
      );
    } catch (dbError: any) {
      // If slug column doesn't exist yet, fall back to ID only
      if (dbError.code === '42703') { // undefined_column
        console.log('Slug column not found, falling back to UUID lookup');
        eventResult = await pool.query(
          'SELECT * FROM special_events WHERE id = $1 AND active = true',
          [id]
        );
      } else {
        throw dbError;
      }
    }
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Special event not found or not active'
      });
    }
    
    const event = eventResult.rows[0];
    
    // Check if date is within event range
    if (date < event.start_date || date > event.end_date) {
      return res.json({
        success: true,
        event,
        availableSlots: []
      });
    }
    
    // Generate time slots based on custom_slots or slot_duration_minutes
    const allSlots: Array<{ start_time: string; end_time: string; available: boolean }> = [];
    
    if (event.use_custom_slots && event.custom_slots) {
      // Use custom predefined slots
      const customSlots = event.custom_slots;
      for (const slot of customSlots) {
        // Ensure time format has seconds (HH:MM:SS)
        const startTime = slot.start.includes(':00:') ? slot.start : `${slot.start}:00`;
        const endTime = slot.end.includes(':00:') ? slot.end : `${slot.end}:00`;
        
        allSlots.push({
          start_time: startTime,
          end_time: endTime,
          available: true
        });
      }
    } else {
      // Generate slots based on slot_duration_minutes
      const startHour = parseInt(event.start_time.split(':')[0]);
      const startMinute = parseInt(event.start_time.split(':')[1]);
      const endHour = parseInt(event.end_time.split(':')[0]);
      const endMinute = parseInt(event.end_time.split(':')[1]);
      
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      
      for (let time = startTimeMinutes; time < endTimeMinutes; time += event.slot_duration_minutes) {
        const slotStartHour = Math.floor(time / 60);
        const slotStartMinute = time % 60;
        const slotEndTime = time + event.slot_duration_minutes;
        const slotEndHour = Math.floor(slotEndTime / 60);
        const slotEndMinute = slotEndTime % 60;
        
        const startTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}:00`;
        const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}:00`;
        
        allSlots.push({
          start_time: startTime,
          end_time: endTime,
          available: true
        });
      }
    }
    
    // Count bookings per slot to check against capacity
    const bookedSlotsResult = await pool.query(
      `SELECT oi.start_time, COUNT(*) as booking_count
      FROM order_items oi
      JOIN special_event_bookings seb ON seb.order_item_id = oi.id
      WHERE seb.special_event_id = $1
      AND oi.booking_date = $2
      AND oi.status IN ('pending', 'booked')
      GROUP BY oi.start_time`,
      [event.id, date]
    );
    
    const bookedSlotCounts = bookedSlotsResult.rows.reduce((acc: any, row: any) => {
      acc[row.start_time] = parseInt(row.booking_count);
      return acc;
    }, {});
    
    // Mark slots as unavailable if they've reached max capacity
    const maxCapacity = event.max_capacity_per_slot || 1;
    allSlots.forEach(slot => {
      const currentBookings = bookedSlotCounts[slot.start_time] || 0;
      slot.available = currentBookings < maxCapacity;
      (slot as any).remaining_capacity = maxCapacity - currentBookings;
    });
    
    res.json({
      success: true,
      event,
      date,
      availableSlots: allSlots,
      slotDuration: event.slot_duration_minutes,
      pricePerSlot: parseFloat(event.price_per_slot),
      maxCapacityPerSlot: event.max_capacity_per_slot || 1
    });
  } catch (error) {
    console.error('Error fetching special event availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability'
    });
  }
};

