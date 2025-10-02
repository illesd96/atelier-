import { Router } from 'express';
import { getAvailability } from '../controllers/availability';
import { validateCart } from '../controllers/cart';
import { createCheckout } from '../controllers/checkout';
import { handleBarionWebhook } from '../controllers/webhooks';
import { createTempReservation, removeTempReservation, getUserReservations, extendReservation } from '../controllers/reservations';
import pool from '../database/connection';

const router = Router();

// Availability endpoints
router.get('/availability', getAvailability);

// Cart endpoints
router.post('/cart/validate', validateCart);

// Checkout endpoints
router.post('/checkout', createCheckout);

// Reservation endpoints
router.post('/reservations', createTempReservation);
router.delete('/reservations', removeTempReservation);
router.get('/reservations', getUserReservations);
router.put('/reservations/extend', extendReservation);

// Webhook endpoints
router.post('/webhooks/barion', handleBarionWebhook);

// Health check
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


