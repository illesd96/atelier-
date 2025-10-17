/**
 * Scheduled Jobs Service
 * Manages automated tasks like sending reminder emails
 */

import cron from 'node-cron';
import { sendReminders } from '../scripts/send-reminders';

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Start all scheduled jobs
   */
  start() {
    console.log('📅 Starting scheduled jobs...');

    // Send reminder emails daily at 9:00 AM
    // Cron format: minute hour day month weekday
    // '0 9 * * *' = At 9:00 AM every day
    const reminderJob = cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running daily reminder job...');
      try {
        await sendReminders();
      } catch (error) {
        console.error('❌ Reminder job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Budapest' // Use your timezone
    });

    this.jobs.set('reminder', reminderJob);
    console.log('✅ Reminder job scheduled (daily at 9:00 AM Europe/Budapest)');

    // Optional: Clean up old email logs monthly (at 2:00 AM on the 1st)
    const cleanupJob = cron.schedule('0 2 1 * *', async () => {
      console.log('🧹 Running monthly email log cleanup...');
      try {
        await this.cleanupOldEmailLogs();
      } catch (error) {
        console.error('❌ Cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Budapest'
    });

    this.jobs.set('cleanup', cleanupJob);
    console.log('✅ Cleanup job scheduled (monthly on 1st at 2:00 AM)');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('⏹️  Stopping scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`✅ Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Clean up email logs older than 6 months
   */
  private async cleanupOldEmailLogs() {
    const pool = require('../database/connection').default;
    try {
      const result = await pool.query(`
        DELETE FROM email_logs
        WHERE sent_at < NOW() - INTERVAL '6 months'
      `);
      console.log(`✅ Cleaned up ${result.rowCount} old email log entries`);
    } catch (error) {
      console.error('Error cleaning up email logs:', error);
      throw error;
    }
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status: Record<string, boolean> = {};
    this.jobs.forEach((job, name) => {
      // Check if job is running (scheduled tasks don't have getStatus method)
      status[name] = job ? true : false;
    });
    return status;
  }
}

export default new SchedulerService();

