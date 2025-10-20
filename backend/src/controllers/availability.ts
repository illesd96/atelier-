import { Request, Response } from 'express';
import { z } from 'zod';
import bookingService from '../services/booking';
import { AvailabilityResponse } from '../types';

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date } = availabilityQuerySchema.parse(req.query);
    
    // Get availability using internal booking service
    const availability = await bookingService.getAvailability(date);
    
    res.json(availability);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    console.error('Error in getAvailability:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    res.status(500).json({
      error: 'Failed to fetch availability',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


