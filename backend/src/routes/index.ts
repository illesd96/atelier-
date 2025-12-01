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
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/user';
import { getAllBookings, getBookingStats, getScheduleView, updateAttendance, cancelBookingItem, modifyBookingItem } from '../controllers/admin';
import { 
  getOrderInvoice, 
  downloadInvoicePdf, 
  getAllInvoices, 
  getInvoiceById, 
  adminDownloadInvoicePdf 
} from '../controllers/invoices';
import {
  getAllSpecialEvents,
  getSpecialEventById,
  createSpecialEvent,
  updateSpecialEvent,
  deleteSpecialEvent,
  getSpecialEventAvailability
} from '../controllers/specialEvents';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import pool from '../database/connection';
import { sendReminders } from '../scripts/send-reminders';
import { createBackup } from '../scripts/backup-database';
import config from '../config';

const router = Router();

// Auth endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-email', verifyEmail);
router.post('/auth/resend-verification', resendVerificationEmail);
router.get('/auth/profile', authenticateToken, getProfile);
router.put('/auth/profile', authenticateToken, updateProfile);
router.put('/auth/password', authenticateToken, updatePassword);

// User endpoints
router.get('/user/orders', authenticateToken, getOrderHistory);
router.get('/user/addresses', authenticateToken, getSavedAddresses);
router.post('/user/addresses', authenticateToken, saveAddress);
router.delete('/user/addresses/:id', authenticateToken, deleteAddress);

// Config endpoint - returns business configuration
router.get('/config', (req, res) => {
  res.json({
    hourlyRate: config.business.hourlyRate,
    currency: config.business.currency,
    openingHours: config.business.openingHours,
    studios: config.studios,
  });
});

// Availability endpoints
router.get('/availability', getAvailability);

// Cart endpoints
router.post('/cart/validate', validateCart);

// Checkout endpoints (with optional auth)
router.post('/checkout', optionalAuth, createCheckout);

// Order endpoints
router.get('/orders/:orderId/status', getOrderStatus);

// Invoice endpoints
router.get('/orders/:orderId/invoice', optionalAuth, getOrderInvoice);
router.get('/invoices/:invoiceId/download', optionalAuth, downloadInvoicePdf);

// Reservation endpoints
router.post('/reservations', createTempReservation);
router.delete('/reservations', removeTempReservation);
router.get('/reservations', getUserReservations);
router.put('/reservations/extend', extendReservation);

// Webhook endpoints
router.post('/webhooks/barion', handleBarionWebhook);

// Admin endpoints
router.get('/admin/bookings', adminAuth, getAllBookings);
router.get('/admin/stats', adminAuth, getBookingStats);
router.get('/admin/schedule', adminAuth, getScheduleView);
router.put('/admin/bookings/:bookingItemId/attendance', adminAuth, updateAttendance);
router.put('/admin/bookings/:bookingItemId/cancel', adminAuth, cancelBookingItem);
router.put('/admin/bookings/:bookingItemId/modify', adminAuth, modifyBookingItem);

// Admin invoice endpoints
router.get('/admin/invoices', adminAuth, getAllInvoices);
router.get('/admin/invoices/:invoiceId', adminAuth, getInvoiceById);
router.get('/admin/invoices/:invoiceId/download', adminAuth, adminDownloadInvoicePdf);

// Special Events endpoints (public read, admin write)
router.get('/special-events', getAllSpecialEvents);
router.get('/special-events/:id', getSpecialEventById);
router.get('/special-events/:id/availability', getSpecialEventAvailability);
router.post('/admin/special-events', adminAuth, createSpecialEvent);
router.put('/admin/special-events/:id', adminAuth, updateSpecialEvent);
router.delete('/admin/special-events/:id', adminAuth, deleteSpecialEvent);

// Cron endpoints (for Vercel Cron or external cron services)
router.get('/cron/send-reminders', async (req, res) => {
  try {
    // Verify authorization (use Vercel cron secret or basic auth)
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET || config.webhookSecret;
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️  Unauthorized cron attempt from:', req.ip);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('🔔 Cron job triggered: send-reminders');
    await sendReminders();
    
    res.json({ 
      success: true, 
      message: 'Reminders processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send reminders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/cron/backup', async (req, res) => {
  try {
    // Verify authorization
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    const expectedSecret = process.env.CRON_SECRET || config.webhookSecret;
    
    if (cronSecret !== expectedSecret) {
      console.warn('⚠️  Unauthorized backup attempt from:', req.ip);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('💾 Cron job triggered: database backup');
    const result = await createBackup();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Backup completed successfully',
        filename: result.filename,
        size: result.size,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Backup failed'
      });
    }
  } catch (error) {
    console.error('❌ Backup cron job failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create backup',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Favicon requests - redirect to frontend or return 204
router.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content - silences the 404s
});

router.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

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


