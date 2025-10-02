import { Request, Response } from 'express';
import { z } from 'zod';
import bookingService from '../services/booking';
import config from '../config';
import { CartItem } from '../types';

const cartItemSchema = z.object({
  room_id: z.string(),
  room_name: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().positive(),
});

const validateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart must contain at least one item'),
});

export const validateCart = async (req: Request, res: Response) => {
  try {
    const { items } = validateCartSchema.parse(req.body);
    
    const validationResults = [];
    
  for (const item of items) {
    // Find the studio configuration
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


