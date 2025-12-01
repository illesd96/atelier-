import { Router, Request, Response } from 'express';
import { createBackup } from '../scripts/backup-database';

const router = Router();

/**
 * Backup API Endpoint
 * Protected by CRON_SECRET to prevent unauthorized access
 * Can be triggered by Vercel Cron or external cron services
 */

router.post('/api/backup', async (req: Request, res: Response) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    
    if (cronSecret !== process.env.CRON_SECRET) {
      console.warn('⚠️ Unauthorized backup attempt');
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    console.log('🔄 Backup triggered via API');

    // Execute backup
    const result = await createBackup();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Backup completed successfully',
        filename: result.filename,
        size: result.size,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Backup failed'
      });
    }

  } catch (error) {
    console.error('❌ Backup API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for backup system
router.get('/api/backup/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backup system is operational',
    timestamp: new Date().toISOString()
  });
});

export default router;

