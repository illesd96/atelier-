import { Request, Response } from 'express';
import { z } from 'zod';
import bookingService from '../services/booking';
import config from '../config';
import { CartItem } from '../types';
import pool from '../database/connection';

const cartItemSchema = z.object({
  room_id: z.string(),
  room_name: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().positive(),
  special_event_id: z.string().optional(),
  special_event_name: z.string().optional(),
});

const validateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart must contain at least one item'),
});

export const validateCart = async (req: Request, res: Response) => {
  try {
    const { items } = validateCartSchema.parse(req.body);
    
    const validationResults = [];
    
  for (const item of items) {
    const itemWithSpecialEvent = item as any; // Cast to access special_event_id
    
    // Check if this is a special event booking
    if (itemWithSpecialEvent.special_event_id) {
      try {
        // Validate special event booking
        const eventResult = await pool.query(
          `SELECT * FROM special_events WHERE id = $1 AND active = true`,
          [itemWithSpecialEvent.special_event_id]
        );
        
        if (eventResult.rows.length === 0) {
          validationResults.push({
            item,
            valid: false,
            error: 'Special event not found or not active',
          });
          continue;
        }
        
        const event = eventResult.rows[0];
        
        // Check if date is within event range
        if (item.date < event.start_date || item.date > event.end_date) {
          validationResults.push({
            item,
            valid: false,
            error: 'Date is outside event range',
          });
          continue;
        }
        
        // Check if this specific time slot is already booked
        const bookedCheck = await pool.query(
          `SELECT COUNT(*) as count
          FROM order_items oi
          JOIN special_event_bookings seb ON seb.order_item_id = oi.id
          JOIN orders o ON o.id = oi.order_id
          WHERE seb.special_event_id = $1
          AND oi.booking_date = $2
          AND oi.start_time = $3
          AND oi.status IN ('pending', 'booked')
          AND o.status IN ('pending', 'paid')`,
          [itemWithSpecialEvent.special_event_id, item.date, `${item.start_time}:00`]
        );
        
        if (parseInt(bookedCheck.rows[0].count) > 0) {
          validationResults.push({
            item,
            valid: false,
            error: 'Time slot is no longer available',
          });
          continue;
        }
        
        // Validate price against event price
        if (item.price !== parseFloat(event.price_per_slot)) {
          validationResults.push({
            item,
            valid: false,
            error: 'Invalid price',
          });
          continue;
        }
        
        validationResults.push({
          item,
          valid: true,
        });
        
      } catch (error) {
        console.error(`Error validating special event item:`, error);
        validationResults.push({
          item,
          valid: false,
          error: 'Unable to validate availability',
        });
      }
    } else {
      // Normal booking validation
      const studio = config.studios.find((s: { id: string; name: string }) => s.id === item.room_id);
      if (!studio) {
        validationResults.push({
          item,
          valid: false,
          error: 'Studio not found',
        });
        continue;
      }
      
      try {
        // Check if the slot is available using internal booking service
        const isAvailable = await bookingService.isSlotAvailable(
          item.room_id,
          item.date,
          item.start_time
        );
        
        if (!isAvailable) {
          validationResults.push({
            item,
            valid: false,
            error: 'Time slot is no longer available',
          });
          continue;
        }
        
        // Validate price
        if (item.price !== config.business.hourlyRate) {
          validationResults.push({
            item,
            valid: false,
            error: 'Invalid price',
          });
          continue;
        }
        
        validationResults.push({
          item,
          valid: true,
        });
        
      } catch (error) {
        console.error(`Error validating item for ${item.room_id}:`, error);
        validationResults.push({
          item,
          valid: false,
          error: 'Unable to validate availability',
        });
      }
    }
  }
    
    const allValid = validationResults.every(result => result.valid);
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    
    res.json({
      valid: allValid,
      items: validationResults,
      total: totalAmount,
      currency: config.business.currency,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('Error in validateCart:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};


