# Booking Availability Issue Debug Guide

## The Problem
You've booked Studio B on 2025-10-16 at 08:00, but:
- ✅ Cart validation prevents adding it (correct)
- ✅ Checkout validation blocks payment (correct)  
- ❌ Availability grid still shows it as "available" (bug)

## Root Cause Analysis

The issue could be one of several things:

### 1. Check Database Status

Run this SQL query to see the actual booking status:

```sql
SELECT 
    o.id as order_id,
    o.status as order_status,
    o.customer_name,
    o.created_at,
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.status as item_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.room_id = 'studio-b'
  AND oi.booking_date = '2025-10-16'
  AND oi.start_time = '08:00'
ORDER BY o.created_at DESC;
```

### 2. Expected Results

For the slot to show as "booked" in the availability grid, you should see:
- `order_status` = 'paid' OR 'pending'
- `item_status` = 'booked' OR 'pending'

If you see 'failed', 'cancelled', or 'expired', that's why it shows as available.

### 3. Possible Scenarios

#### Scenario A: Payment Failed
- Order was created but payment failed
- Order status changed to 'failed'
- Solution: Slot should show as available (working correctly)

#### Scenario B: Payment Pending/Timeout
- Order created, payment started but never completed  
- Order status is 'pending' but old (expired)
- Solution: Need to implement automatic expiration of old pending orders

#### Scenario C: Successful Booking
- Order status = 'paid'
- Item status = 'booked' or 'pending'
- If availability still shows available, this is a REAL BUG

## Quick Fixes Implemented

### 1. Checkout Validation (✅ DONE)
Added pre-flight availability check before creating order.

```typescript
// Now checks availability BEFORE creating order
// Returns 409 Conflict if slots unavailable
```

### 2. Better Error Messages
Users now get specific error message about which slots are unavailable.

## Testing the Fix

### Test 1: Try to Book Already Booked Slot
1. Use admin panel to verify slot is booked (order status = 'paid', item status = 'booked')
2. Try to add same slot to cart
3. **Expected**: Cart validation should fail
4. **Expected**: Availability grid should show 'booked' (red)

### Test 2: Expired Pending Order
1. Create an order but don't complete payment
2. Wait or manually set order to 'expired'
3. **Expected**: Slot shows as available again

### Test 3: Race Condition
1. Open two browser windows
2. Both try to book the same slot simultaneously
3. **Expected**: One succeeds, other gets "slot no longer available" error

## Admin Tools for Debugging

Use the new admin panel at `/admin/bookings` to:
- See all bookings and their statuses
- Filter by date to find the specific booking
- Check order and payment status
- Verify booking item status

## SQL Queries for Manual Investigation

### Find All Bookings for a Date
```sql
SELECT 
    o.id,
    o.status as order_status,
    o.customer_name,
    o.email,
    oi.room_id,
    oi.start_time,
    oi.status as item_status,
    p.status as payment_status
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE oi.booking_date = '2025-10-16'
ORDER BY oi.start_time, o.created_at;
```

### Find Stuck Pending Orders
```sql
SELECT 
    o.id,
    o.status,
    o.created_at,
    o.customer_name,
    NOW() - o.created_at as age
FROM orders o
WHERE o.status = 'pending'
  AND o.created_at < NOW() - INTERVAL '30 minutes'
ORDER BY o.created_at DESC;
```

### Manually Clean Up Expired Pending Orders
```sql
-- Mark old pending orders as expired (older than 30 minutes)
UPDATE orders
SET status = 'expired'
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '30 minutes';

-- Also update their items
UPDATE order_items
SET status = 'failed'
WHERE status = 'pending'
  AND order_id IN (
    SELECT id FROM orders WHERE status = 'expired'
  );
```

## Frontend Cache Issue?

If the data is correct in the database but the UI still shows wrong data:

### Clear Frontend Cache
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check if API response is cached (check Network tab in DevTools)

### Check API Response
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the availability grid
4. Find the `/api/availability?date=2025-10-16` request
5. Check the response - does it show the slot as 'booked'?

## Recommended Next Steps

1. **Run the diagnostic SQL** above to see actual booking status
2. **Check the API response** in browser DevTools
3. **Implement automatic expiration** of old pending orders (optional enhancement)
4. **Test the new validation** to ensure race conditions are prevented

## Need More Help?

Share the results of:
1. The diagnostic SQL query results
2. The API response from `/api/availability?date=2025-10-16`
3. Any error messages from browser console or server logs

