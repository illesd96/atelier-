# Debug Booking API - Why Slots Don't Show as Booked

## Quick Fix Steps

### 1. Restart Backend with Updated Code

```bash
# Stop the backend (Ctrl+C if running)
# Then start it fresh:
cd backend
npm run dev
```

The backend needs to be restarted to use the updated availability query!

### 2. Clear Browser Cache & Hard Refresh

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

Or clear cache:
- Chrome: F12 → Network tab → Check "Disable cache"
- Keep DevTools open while testing

### 3. Check What API is Returning

Open browser DevTools (F12):

1. Go to **Network** tab
2. Navigate to booking page
3. Look for request: `GET /api/availability?date=2025-10-15`
4. Click on it → **Response** tab

**You should see something like:**

```json
{
  "date": "2025-10-15",
  "rooms": [
    {
      "id": "studio-b",
      "name": "Studio B",
      "slots": [
        {
          "time": "11:00",
          "status": "booked"  ← Should say "booked" not "available"!
        },
        {
          "time": "12:00",
          "status": "available"
        }
      ]
    }
  ]
}
```

**If you see `"status": "available"` for booked slots:**
- Backend is not restarted with new code
- Database wasn't updated properly
- Query has an issue

### 4. Verify Database Has Correct Data

```sql
-- Check for bookings on 2025-10-15
SELECT 
    oi.room_id,
    oi.booking_date,
    oi.start_time,
    oi.status as item_status,
    o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.booking_date = '2025-10-15'
ORDER BY oi.start_time;
```

**Expected results:**
- `item_status` = `'booked'` or `'pending'`
- `order_status` = `'paid'`

**If items are still 'pending':**

Run the fix script:
```bash
cd backend
npm run fix:bookings
```

Or SQL:
```sql
UPDATE order_items
SET status = 'booked', 
    booking_id = 'BK-' || extract(epoch from CURRENT_TIMESTAMP)::bigint || '-' || substr(id::text, 1, 8)
WHERE order_id IN (SELECT id FROM orders WHERE status = 'paid')
AND status = 'pending';
```

### 5. Test Backend Directly

Test the API directly in browser or curl:

```bash
# Replace with your date
curl http://localhost:3001/api/availability?date=2025-10-15
```

Look for `"status": "booked"` in the response.

### 6. Check Backend Console Logs

When you load the booking page, you should see in the backend console:

```
Found X booked/pending slots for 2025-10-15
```

If you don't see this log, the backend isn't using the updated code.

## Common Issues

### Issue 1: Backend Not Restarted

**Symptom:** Slots show as available even though database is correct

**Solution:**
```bash
cd backend
# Stop with Ctrl+C
npm run dev
```

### Issue 2: Frontend Cached Old Data

**Symptom:** Hard refresh doesn't help

**Solution:**
- Open DevTools (F12)
- Network tab → Check "Disable cache"
- Clear browser cache completely
- Close and reopen browser

### Issue 3: Wrong Date Format

**Symptom:** Some dates work, some don't

**Solution:** Make sure you're checking the right date:
- Frontend shows: "October 15, 2025" 
- Database has: `2025-10-15`
- API expects: `2025-10-15`

### Issue 4: Order Items Still Pending

**Symptom:** Database shows `item_status = 'pending'`

**Solution:**
```bash
cd backend
npm run fix:bookings
```

### Issue 5: Multiple Backend Instances

**Symptom:** Sometimes works, sometimes doesn't

**Solution:**
```bash
# Kill all node processes
# Windows:
taskkill /IM node.exe /F

# Mac/Linux:
pkill node

# Then start fresh:
cd backend
npm run dev
```

## Step-by-Step Debugging

### Step 1: Check Database

```sql
-- This is what the backend query looks for:
SELECT 
    room_id, 
    start_time, 
    end_time, 
    oi.status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.booking_date = '2025-10-15'
AND (
    (oi.status = 'booked' AND o.status = 'paid')
    OR (oi.status = 'pending' AND o.status = 'paid')
    OR (oi.status = 'pending' AND o.status = 'pending')
)
ORDER BY start_time;
```

**If this returns rows:** Database is correct ✅

**If this returns 0 rows:** Database needs fixing ❌

### Step 2: Check Backend API

```bash
curl http://localhost:3001/api/availability?date=2025-10-15 | jq
```

Look for `"status": "booked"` in the output.

**If API returns "booked":** Backend is correct ✅

**If API returns "available":** Backend isn't using updated code ❌

### Step 3: Check Frontend Request

In browser DevTools:
1. Network tab
2. Find: `availability?date=2025-10-15`
3. Check Response tab

**If response shows "booked":** Frontend should show it as red ✅

**If response shows "available":** Backend problem ❌

### Step 4: Check Frontend Rendering

If API returns "booked" but frontend shows green:

1. Check browser console for errors
2. Hard refresh (Ctrl+Shift+R)
3. Clear all cache
4. Check if frontend code is latest version

## Expected Flow

```
1. User loads booking page
   ↓
2. Frontend: GET /api/availability?date=2025-10-15
   ↓
3. Backend: Query database for booked slots
   ↓
4. Backend: Find slots where:
   - item_status = 'booked' AND order_status = 'paid', OR
   - item_status = 'pending' AND order_status = 'paid', OR  
   - item_status = 'pending' AND order_status = 'pending'
   ↓
5. Backend: Return { "time": "11:00", "status": "booked" }
   ↓
6. Frontend: Render slot with red background (slot-booked class)
   ↓
7. User sees: RED slot that can't be clicked ✅
```

## Quick Checklist

- [ ] Database has order with status='paid'
- [ ] Database has order_items with status='booked' or 'pending'
- [ ] Backend is running with updated code
- [ ] Backend console shows "Found X booked/pending slots..."
- [ ] API response includes "status":"booked"
- [ ] Browser cache is cleared
- [ ] Frontend shows red slot

## If Still Not Working

1. **Show me the API response:**
   - Open DevTools → Network → Find availability request
   - Copy the Response and show me

2. **Show me the database:**
   ```sql
   SELECT * FROM order_items 
   WHERE booking_date = '2025-10-15'
   ORDER BY start_time;
   ```

3. **Show me backend logs:**
   - What does the backend console show when you load the page?

4. **Show me frontend console:**
   - Any errors in browser console (F12)?




