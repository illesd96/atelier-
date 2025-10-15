-- Check the booking for Studio B on 2025-10-16 at 08:00
-- Run this query to see what's in the database

SELECT 
    o.id as order_id,
    o.status as order_status,
    o.customer_name,
    o.email,
    o.created_at as order_created,
    oi.id as item_id,
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.end_time,
    oi.status as item_status,
    p.provider_ref as payment_id,
    p.status as payment_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE oi.room_id = 'studio-b'
  AND oi.booking_date = '2025-10-16'
  AND oi.start_time = '08:00'
ORDER BY o.created_at DESC;

-- This will show you all attempts to book this slot and their statuses

