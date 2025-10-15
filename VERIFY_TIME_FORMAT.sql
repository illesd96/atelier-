-- Check the exact format of start_time returned from database
SELECT 
    start_time,
    start_time::text as start_time_text,
    LENGTH(start_time::text) as time_length,
    pg_typeof(start_time) as time_type
FROM order_items
WHERE room_id = 'studio-b'
  AND booking_date = '2025-10-16'
  AND start_time = '08:00'
LIMIT 1;

-- If the length is 8 (like '08:00:00'), that's the problem!
-- The code is comparing '08:00:00' with '08:00' which will never match

