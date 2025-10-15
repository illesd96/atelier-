# Testing Booking Flow - Verify Slots Show as Unavailable

## Current Implementation

The system already has logic to mark booked slots as unavailable:

### 1. Availability Query (`backend/src/services/booking.ts`)

```sql
SELECT room_id, start_time, end_time, status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.booking_date = $1 
AND oi.status IN ('booked', 'pending')  -- ✅ Checks for booked items
AND o.status IN ('paid', 'pending')      -- ✅ Checks for paid orders
```

This query fetches all slots that are:
- Either `booked` or `pending` in order_items
- AND the order is either `paid` or `pending`

### 2. When Payment Succeeds

The webhook (`/api/webhooks/barion`) does this:

```typescript
if (PaymentState === 'Succeeded') {
  // 1. Creates bookings (updates order_items status to 'booked')
  await bookingService.createBookings(order.id);
  
  // 2. Updates order status to 'paid'
  await client.query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [order.id]);
}
```

### 3. Booking Service Updates Items

```typescript
// Updates each order item
UPDATE order_items 
SET booking_id = $1, status = 'booked', updated_at = CURRENT_TIMESTAMP
WHERE id = $2
```

## The Flow

```
User completes payment
   ↓
Barion calls webhook: /api/webhooks/barion
   ↓
Backend updates:
  - order.status = 'paid' ✅
  - order_items.status = 'booked' ✅
   ↓
Next user loads booking page
   ↓
Backend queries booked slots
   ↓
Returns slots with status='booked' where order is 'paid' ✅
   ↓
Frontend shows slot as "Booked" (red, unclickable) ✅
```

## Test This Locally

### Step 1: Make a Test Booking

```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

1. Go to http://localhost:5173/booking
2. Select **Studio B** on **October 15, 2025** at **10:00**
3. Add to cart
4. Checkout
5. Complete payment with test card `9999-9999-9999-9990`

### Step 2: Check Database

```sql
-- Check the order was created and marked as paid
SELECT id, customer_name, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;

-- Check the order items were marked as booked
SELECT oi.*, o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.id = 'YOUR_ORDER_ID_HERE';

-- You should see:
-- order.status = 'paid'
-- order_items.status = 'booked'
```

### Step 3: Verify Booking Grid

1. **Refresh the booking page:** http://localhost:5173/booking
2. **Navigate to October 15, 2025**
3. **Look at Studio B, 10:00 AM**
4. **It should show as BOOKED (red background)** ✅

### Step 4: Try to Book the Same Slot

1. Try clicking the booked slot
2. **It should not let you click it** ✅
3. The slot should remain red/unavailable

## Visual Status in Grid

The booking grid shows three states:

| Status | Color | Clickable | Meaning |
|--------|-------|-----------|---------|
| **Available** | Green | ✅ Yes | Free to book |
| **Booked** | Red | ❌ No | Already booked by someone |
| **Unavailable** | Gray | ❌ No | Past time or closed |

## Debugging if Slots Don't Show as Booked

### Check 1: Webhook Was Called

**Problem:** Barion webhook might not be reaching your localhost.

**Solution for Local Testing:**

Barion can't call your localhost webhook directly. For local testing, you need to:

**Option A: Manually trigger the booking creation**

After payment succeeds, manually call:

```bash
curl -X POST http://localhost:3001/api/webhooks/barion \
  -H "Content-Type: application/json" \
  -H "x-barion-signature: test" \
  -d '{
    "PaymentId": "YOUR_PAYMENT_ID",
    "PaymentState": "Succeeded"
  }'
```

**Option B: Use ngrok for local webhook**

```bash
# Install ngrok
npm install -g ngrok

# Expose your local backend
ngrok http 3001

# You'll get a URL like: https://abc123.ngrok.io
# Update backend/.env:
BACKEND_URL=https://abc123.ngrok.io
```

Then Barion can actually call your webhook!

### Check 2: Order Status in Database

```sql
-- Check order status
SELECT id, status, customer_name, created_at 
FROM orders 
WHERE id = 'YOUR_ORDER_ID';

-- Check order items status
SELECT id, room_id, booking_date, start_time, status, booking_id
FROM order_items 
WHERE order_id = 'YOUR_ORDER_ID';
```

**Expected:**
- `orders.status` = `'paid'`
- `order_items.status` = `'booked'`
- `order_items.booking_id` = `'BK-xxxxx'` (not null)

**If you see:**
- `orders.status` = `'pending'` → Webhook didn't run or failed
- `order_items.status` = `'pending'` → Bookings weren't created

### Check 3: Manual Fix for Testing

If webhook didn't run, you can manually update:

```sql
-- Get your order ID
SELECT id FROM orders ORDER BY created_at DESC LIMIT 1;

-- Manually update order to paid
UPDATE orders SET status = 'paid' WHERE id = 'YOUR_ORDER_ID';

-- Manually update order items to booked
UPDATE order_items 
SET status = 'booked', 
    booking_id = 'BK-MANUAL-' || id::text
WHERE order_id = 'YOUR_ORDER_ID';
```

Then refresh the booking page - slots should show as booked!

### Check 4: Frontend is Fetching Latest Data

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to booking page
4. Look for request to `/api/availability?date=2025-10-15`
5. Check the response:

```json
{
  "date": "2025-10-15",
  "rooms": [
    {
      "id": "studio-b",
      "name": "Studio B",
      "slots": [
        {
          "time": "10:00",
          "status": "booked"  // ✅ Should say "booked"
        }
      ]
    }
  ]
}
```

## Production Testing

In production (Vercel), the webhook WILL work because Barion can reach your public backend URL.

### Steps:

1. **Deploy to Vercel**
2. **Make a test booking** on https://www.atelier-archilles.hu
3. **Complete payment**
4. **Go back to booking page**
5. **The slot should show as booked** ✅

## Expected Behavior

### ✅ Success Criteria

- [x] After payment succeeds, webhook updates order to 'paid'
- [x] Order items are updated to 'booked'
- [x] Booked slots appear as RED in booking grid
- [x] Booked slots are not clickable
- [x] New customers cannot book the same slot
- [x] Multiple bookings for different slots work
- [x] Past bookings still show as booked

### ❌ What Might Go Wrong

1. **Webhook doesn't reach backend**
   - Localhost: Use ngrok or manual SQL update
   - Production: Check BACKEND_URL is set correctly

2. **Order stays "pending"**
   - Check Barion logs for webhook delivery
   - Check backend logs for errors
   - Manually trigger webhook

3. **Slots still show as available**
   - Clear browser cache
   - Check database: order.status should be 'paid'
   - Check API response in Network tab

## Quick Test Commands

```bash
# Check last order
psql -U postgres -d atelier_photo_studio -c "SELECT id, status, customer_name FROM orders ORDER BY created_at DESC LIMIT 1;"

# Check booked slots for today
psql -U postgres -d atelier_photo_studio -c "SELECT room_id, booking_date, start_time, status FROM order_items WHERE status = 'booked' ORDER BY booking_date, start_time;"

# Manual webhook trigger (replace values)
curl -X POST http://localhost:3001/api/webhooks/barion \
  -H "Content-Type: application/json" \
  -d '{"PaymentId":"YOUR_PAYMENT_ID","PaymentState":"Succeeded"}'
```

## Summary

✅ The booking system **already marks booked slots as unavailable**

The logic is:
1. Payment succeeds → Webhook fires
2. Webhook updates order to 'paid' + order_items to 'booked'
3. Availability query checks for 'booked' items
4. Frontend shows booked slots as red/unavailable

**For local testing:** The webhook won't work without ngrok, so you may need to manually update the database or use ngrok.

**For production:** Everything works automatically! 🎉




