import { Request, Response } from 'express';
import { z } from 'zod';
import { reservationService } from '../services/reservation';

// Generate a session ID if not provided
const generateSessionId = (req: Request): string => {
  return req.session?.id || req.headers['x-session-id'] as string || `session_${Date.now()}_${Math.random()}`;
};

const CreateReservationSchema = z.object({
  room_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
});

const RemoveReservationSchema = z.object({
  room_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createTempReservation = async (req: Request, res: Response) => {
  try {
    const { room_id, date, start_time } = CreateReservationSchema.parse(req.body);
    const sessionId = generateSessionId(req);

    const reservation = await reservationService.createTempReservation(
      room_id,
      date,
      start_time,
      sessionId
    );

    if (!reservation) {
      return res.status(409).json({
        error: 'Slot is already reserved or booked',
        code: 'SLOT_UNAVAILABLE'
      });
    }

    res.json({
      success: true,
      reservation: {
        id: reservation.id,
        room_id: reservation.room_id,
        date: reservation.date,
        start_time: reservation.start_time,
        expires_at: reservation.expires_at,
        duration_minutes: 10
      }
    });

  } catch (error: any) {
    console.error('Error creating temp reservation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to create reservation'
    });
  }
};

export const removeTempReservation = async (req: Request, res: Response) => {
  try {
    const { room_id, date, start_time } = RemoveReservationSchema.parse(req.body);
    const sessionId = generateSessionId(req);

    const removed = await reservationService.removeTempReservation(
      room_id,
      date,
      start_time,
      sessionId
    );

    if (!removed) {
      return res.status(404).json({
        error: 'Reservation not found or already expired'
      });
    }

    res.json({
      success: true,
      message: 'Reservation removed successfully'
    });

  } catch (error: any) {
    console.error('Error removing temp reservation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to remove reservation'
    });
  }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const sessionId = generateSessionId(req);
    const reservations = await reservationService.getUserReservations(sessionId);

    res.json({
      success: true,
      reservations: reservations.map(r => ({
        id: r.id,
        room_id: r.room_id,
        date: r.date,
        start_time: r.start_time,
        expires_at: r.expires_at
      }))
    });

  } catch (error: any) {
    console.error('Error getting user reservations:', error);
    res.status(500).json({
      error: 'Failed to get reservations'
    });
  }
};

export const extendReservation = async (req: Request, res: Response) => {
  try {
    const { room_id, date, start_time } = RemoveReservationSchema.parse(req.body);
    const sessionId = generateSessionId(req);

    const extended = await reservationService.extendReservation(
      room_id,
      date,
      start_time,
      sessionId
    );

    if (!extended) {
      return res.status(404).json({
        error: 'Reservation not found or already expired'
      });
    }

    res.json({
      success: true,
      message: 'Reservation extended successfully',
      new_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

  } catch (error: any) {
    console.error('Error extending reservation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to extend reservation'
    });
  }
};


