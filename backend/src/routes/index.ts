import { Router } from 'express';
import { getAvailability } from '../controllers/availability';
import { validateCart } from '../controllers/cart';
import { createCheckout } from '../controllers/checkout';
import { getOrderStatus } from '../controllers/orders';
import { handleBarionWebhook } from '../controllers/webhooks';
import { createTempReservation, removeTempReservation, getUserReservations, extendReservation } from '../controllers/reservations';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updatePassword,
  getOrderHistory,
  getSavedAddresses,
  saveAddress,
  deleteAddress,
} from '../controllers/user';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import pool from '../database/connection';

const router = Router();

// Auth endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authenticateToken, getProfile);
router.put('/auth/profile', authenticateToken, updateProfile);
router.put('/auth/password', authenticateToken, updatePassword);

// User endpoints
router.get('/user/orders', authenticateToken, getOrderHistory);
router.get('/user/addresses', authenticateToken, getSavedAddresses);
router.post('/user/addresses', authenticateToken, saveAddress);
router.delete('/user/addresses/:id', authenticateToken, deleteAddress);

// Availability endpoints
router.get('/availability', getAvailability);

// Cart endpoints
router.post('/cart/validate', validateCart);

// Checkout endpoints (with optional auth)
router.post('/checkout', optionalAuth, createCheckout);

// Order endpoints
router.get('/orders/:orderId/status', getOrderStatus);

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


