/**
 * Send reminder emails for bookings happening tomorrow
 * This script should be run daily via cron job or scheduled task
 * 
 * Usage: npm run send-reminders
 * Or: node dist/scripts/send-reminders.js
 */

import emailService from '../services/email';
import pool from '../database/connection';

async function sendReminders() {
  console.log('🔔 Starting reminder email job...');
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  try {
    // Get bookings that need reminders
    const bookingsForReminder = await emailService.getBookingsForReminder();

    if (bookingsForReminder.length === 0) {
      console.log('✅ No bookings need reminders today.');
      return;
    }

    console.log(`📧 Found ${bookingsForReminder.length} booking(s) that need reminders.`);

    let successCount = 0;
    let failCount = 0;

    // Send reminder for each booking
    for (const { order, items } of bookingsForReminder) {
      try {
        console.log(`📤 Sending reminder for order ${order.id} to ${order.email}...`);
        
        await emailService.sendBookingReminder(order, items);
        
        successCount++;
        console.log(`✅ Reminder sent successfully to ${order.email}`);
        
      } catch (error) {
        failCount++;
        console.error(`❌ Failed to send reminder for order ${order.id}:`, error);
      }
    }

    console.log('\n📊 Reminder job completed:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${bookingsForReminder.length}`);

  } catch (error) {
    console.error('❌ Error in reminder job:', error);
    throw error;
  }
}

// Run the script
async function main() {
  try {
    await sendReminders();
    console.log('\n✅ Reminder job finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Reminder job failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

export { sendReminders };

