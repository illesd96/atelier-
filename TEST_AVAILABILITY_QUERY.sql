-- Test the exact query that the availability endpoint uses
-- This should return your booking for studio-b at 08:00

SELECT room_id, start_time, end_time, oi.status, o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.booking_date = '2025-10-16'
AND (
  (oi.status = 'booked' AND o.status = 'paid')  -- Confirmed bookings
  OR (oi.status = 'pending' AND o.status = 'paid')  -- Paid but webhook didn't run  <<< YOUR BOOKING SHOULD MATCH THIS
  OR (oi.status = 'pending' AND o.status = 'pending')  -- Payment in progress
)
ORDER BY room_id, start_time;

-- Expected result: Should show studio-b at 08:00
-- If it DOES show the booking, then the problem is in how the frontend displays it
-- If it DOESN'T show the booking, then there's a bug in the SQL query

