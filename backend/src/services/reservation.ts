import pool from '../database/connection';

export interface TempReservation {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  session_id: string;
  created_at: Date;
  expires_at: Date;
}

export class ReservationService {
  private static readonly RESERVATION_DURATION_MINUTES = 10;

  /**
   * Create a temporary reservation for a time slot
   */
  async createTempReservation(
    roomId: string,
    date: string,
    startTime: string,
    sessionId: string
  ): Promise<TempReservation | null> {
    const client = await pool.connect();

    try {
      // First, check if the slot is already reserved or booked
      const existingQuery = `
        SELECT 1 FROM temp_reservations 
        WHERE room_id = $1 AND date = $2 AND start_time = $3 
        AND expires_at > NOW()
        UNION
        SELECT 1 FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.room_id = $1 AND oi.booking_date = $2 AND oi.start_time = $3
        AND oi.status IN ('booked', 'pending')
        AND o.status IN ('paid', 'pending')
      `;

      const existingResult = await client.query(existingQuery, [roomId, date, startTime]);

      if (existingResult.rows.length > 0) {
        return null; // Slot is already reserved or booked
      }

      // Create the reservation
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.RESERVATION_DURATION_MINUTES);

      const insertQuery = `
        INSERT INTO temp_reservations (room_id, date, start_time, session_id, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (room_id, date, start_time) 
        DO UPDATE SET 
          session_id = EXCLUDED.session_id,
          expires_at = EXCLUDED.expires_at,
          created_at = NOW()
        RETURNING *
      `;

      const result = await client.query(insertQuery, [roomId, date, startTime, sessionId, expiresAt]);
      return result.rows[0];

    } finally {
      client.release();
    }
  }

  /**
   * Remove a temporary reservation
   */
  async removeTempReservation(roomId: string, date: string, startTime: string, sessionId: string): Promise<boolean> {
    const client = await pool.connect();

    try {
      const query = `
        DELETE FROM temp_reservations 
        WHERE room_id = $1 AND date = $2 AND start_time = $3 AND session_id = $4
      `;

      const result = await client.query(query, [roomId, date, startTime, sessionId]);
      return result.rowCount > 0;

    } finally {
      client.release();
    }
  }

  /**
   * Get all active reservations for a user session
   */
  async getUserReservations(sessionId: string): Promise<TempReservation[]> {
    const client = await pool.connect();

    try {
      const query = `
        SELECT * FROM temp_reservations 
        WHERE session_id = $1 AND expires_at > NOW()
        ORDER BY date, start_time
      `;

      const result = await client.query(query, [sessionId]);
      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Clean up expired reservations
   */
  async cleanupExpiredReservations(): Promise<number> {
    const client = await pool.connect();

    try {
      const query = `DELETE FROM temp_reservations WHERE expires_at <= NOW()`;
      const result = await client.query(query);
      return result.rowCount || 0;

    } finally {
      client.release();
    }
  }

  /**
   * Extend a reservation (refresh the expiry time)
   */
  async extendReservation(roomId: string, date: string, startTime: string, sessionId: string): Promise<boolean> {
    const client = await pool.connect();

    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.RESERVATION_DURATION_MINUTES);

      const query = `
        UPDATE temp_reservations 
        SET expires_at = $5
        WHERE room_id = $1 AND date = $2 AND start_time = $3 AND session_id = $4
      `;

      const result = await client.query(query, [roomId, date, startTime, sessionId, expiresAt]);
      return result.rowCount > 0;

    } finally {
      client.release();
    }
  }
}

export const reservationService = new ReservationService();


