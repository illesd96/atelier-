-- ============================================================
-- Fix Pending Order Items - Update to 'booked' after payment
-- ============================================================

-- Step 1: Check which order items need updating
SELECT 
    o.id as order_id,
    o.customer_name,
    o.status as order_status,
    oi.id as item_id,
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.status as item_status,
    oi.booking_id
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'  -- Order is paid
AND oi.status = 'pending'  -- But items are still pending
ORDER BY oi.booking_date, oi.start_time;

-- Step 2: Update all pending order items to 'booked' for paid orders
UPDATE order_items
SET 
    status = 'booked',
    booking_id = 'BK-' || extract(epoch from CURRENT_TIMESTAMP)::bigint || '-' || substr(id::text, 1, 8),
    updated_at = CURRENT_TIMESTAMP
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'paid'
)
AND status = 'pending';

-- Step 3: Verify the update
SELECT 
    o.id as order_id,
    o.customer_name,
    o.status as order_status,
    oi.id as item_id,
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.status as item_status,
    oi.booking_id
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'
ORDER BY oi.booking_date, oi.start_time;

-- ============================================================
-- Expected Result:
-- All order_items for paid orders should now have:
-- - status = 'booked'
-- - booking_id = 'BK-...'
-- ============================================================





