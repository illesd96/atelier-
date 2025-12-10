-- ============================================================
-- Check Bookings - Verify booked slots show as unavailable
-- ============================================================

-- 1. Check recent orders
SELECT 
    id,
    customer_name,
    email,
    status,
    total_amount,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check order items (bookings) for a specific date
SELECT 
    oi.room_id,
    r.name as room_name,
    oi.booking_date,
    oi.start_time,
    oi.end_time,
    oi.status as item_status,
    oi.booking_id,
    o.customer_name,
    o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN rooms r ON r.id = oi.room_id
WHERE oi.booking_date = '2025-10-15'  -- Change this date
ORDER BY oi.start_time;

-- 3. Check which slots should show as "booked" for a specific date
-- This is the same query the backend uses
SELECT 
    room_id, 
    start_time, 
    end_time, 
    status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.booking_date = '2025-10-15'  -- Change this date
AND oi.status IN ('booked', 'pending')
AND o.status IN ('paid', 'pending')
ORDER BY room_id, start_time;

-- 4. Find all paid bookings
SELECT 
    o.id as order_id,
    o.customer_name,
    o.status as order_status,
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.status as item_status,
    oi.booking_id
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'
ORDER BY oi.booking_date, oi.start_time;

-- 5. Check if a specific slot is available
-- Returns 0 if available, > 0 if booked
SELECT COUNT(*) as is_booked
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.room_id = 'studio-b'          -- Change this
AND oi.booking_date = '2025-10-15'     -- Change this
AND oi.start_time = '10:00'            -- Change this
AND oi.status IN ('booked', 'pending')
AND o.status IN ('paid', 'pending');

-- 6. Manual fix: Update order to paid (if webhook didn't fire)
-- UNCOMMENT AND RUN IF NEEDED:
-- UPDATE orders SET status = 'paid' WHERE id = 'YOUR_ORDER_ID_HERE';

-- 7. Manual fix: Update order items to booked (if webhook didn't fire)
-- UNCOMMENT AND RUN IF NEEDED:
-- UPDATE order_items 
-- SET status = 'booked', booking_id = 'BK-MANUAL-' || id::text
-- WHERE order_id = 'YOUR_ORDER_ID_HERE';

-- 8. Check bookings for today (Hungarian time - use current date)
SELECT 
    oi.room_id,
    r.name as room_name,
    oi.start_time,
    oi.end_time,
    oi.status,
    o.customer_name,
    o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN rooms r ON r.id = oi.room_id
WHERE oi.booking_date = CURRENT_DATE  -- Today
AND o.status = 'paid'
ORDER BY oi.start_time;

-- 9. Count bookings per studio per day
SELECT 
    oi.booking_date,
    oi.room_id,
    r.name as room_name,
    COUNT(*) as booking_count
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN rooms r ON r.id = oi.room_id
WHERE o.status = 'paid'
GROUP BY oi.booking_date, oi.room_id, r.name
ORDER BY oi.booking_date DESC, oi.room_id;

-- 10. Find double bookings (should be empty!)
SELECT 
    oi1.room_id,
    oi1.booking_date,
    oi1.start_time,
    COUNT(*) as booking_count,
    string_agg(o.customer_name, ', ') as customers
FROM order_items oi1
JOIN orders o ON o.id = oi1.order_id
WHERE o.status IN ('paid', 'pending')
AND oi1.status IN ('booked', 'pending')
GROUP BY oi1.room_id, oi1.booking_date, oi1.start_time
HAVING COUNT(*) > 1;  -- Shows only double-booked slots

-- ============================================================
-- Expected Results:
-- ============================================================
-- - Query 1: Shows all recent orders
-- - Query 2: Shows bookings for specific date
-- - Query 3: Shows which slots are marked as booked (same as backend query)
-- - Query 4: Shows all paid bookings
-- - Query 5: Returns count > 0 if slot is booked
-- - Query 8: Shows today's bookings
-- - Query 9: Shows booking statistics
-- - Query 10: Should be EMPTY (no double bookings)
-- ============================================================







