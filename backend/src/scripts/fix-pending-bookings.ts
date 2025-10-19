/**
 * Script to fix pending order items after payment
 * Run this if webhooks didn't fire (e.g., localhost testing)
 * 
 * Usage: ts-node src/scripts/fix-pending-bookings.ts
 */

import pool from '../database/connection';

async function fixPendingBookings() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for pending order items with paid orders...');
    
    // Find order items that need fixing
    const checkResult = await client.query(`
      SELECT 
        o.id as order_id,
        o.customer_name,
        o.status as order_status,
        oi.id as item_id,
        oi.room_id,
        oi.booking_date,
        oi.start_time,
        oi.status as item_status
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status = 'paid'
      AND oi.status = 'pending'
      ORDER BY oi.booking_date, oi.start_time
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ No pending order items found. All bookings are up to date!');
      return;
    }
    
    console.log(`⚠️  Found ${checkResult.rows.length} order items that need to be marked as 'booked':`);
    checkResult.rows.forEach(row => {
      console.log(`   - Order: ${row.order_id.substring(0, 8)}... | Customer: ${row.customer_name}`);
      console.log(`     ${row.room_id} on ${row.booking_date} at ${row.start_time}`);
    });
    
    console.log('\n🔧 Updating order items to "booked" status...');
    
    await client.query('BEGIN');
    
    // Update order items
    const updateResult = await client.query(`
      UPDATE order_items
      SET 
        status = 'booked',
        booking_id = 'BK-' || extract(epoch from CURRENT_TIMESTAMP)::bigint || '-' || substr(id::text, 1, 8),
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id IN (
        SELECT id FROM orders WHERE status = 'paid'
      )
      AND status = 'pending'
      RETURNING id, room_id, booking_date, start_time, booking_id
    `);
    
    await client.query('COMMIT');
    
    console.log(`✅ Successfully updated ${updateResult.rowCount} order items!`);
    
    if (updateResult.rows.length > 0) {
      console.log('\n📋 Updated items:');
      updateResult.rows.forEach(row => {
        console.log(`   ✓ ${row.room_id} on ${row.booking_date} at ${row.start_time}`);
        console.log(`     Booking ID: ${row.booking_id}`);
      });
    }
    
    console.log('\n✨ All done! Bookings are now properly marked as "booked".');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing pending bookings:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fixPendingBookings()
  .then(() => {
    console.log('\n👋 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });





