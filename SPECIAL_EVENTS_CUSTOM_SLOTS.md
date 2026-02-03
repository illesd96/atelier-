# Special Events Custom Slots, Optional Rooms & Slot Capacity

## New Features Implemented

### 1. **Optional Room Selection**
Events can now be created without being tied to a specific room. This is useful for:
- Events that don't require a physical studio space
- Mobile events or outdoor sessions
- Events where the location varies

### 2. **Custom Time Slots**
Instead of automatically generating time slots based on duration, you can now define specific fixed time slots. This allows for:
- Overlapping sessions (e.g., 10:00-12:00 and 11:30-13:30)
- Preparation time between sessions
- Flexible scheduling patterns

### 3. **Slot Capacity** ⭐ NEW!
Allow multiple bookings per time slot. Perfect for:
- Events that can handle multiple clients simultaneously
- Maximizing studio utilization and revenue
- Real-time capacity tracking ("X hely maradt")
- Default: **2 spots per slot** (configurable 1-10)

## Example Use Case: Santa Photo Sessions

**Requirements:** 
- 4 time slots starting at 10 AM
- Each 2 hours long, with 1.5-hour intervals
- **2 families can book the same slot** (capacity: 2)

**Time Slots:**
```
10:00-12:00  (First session)  - 2 spots available
11:30-13:30  (Second session) - 2 spots available
13:00-15:00  (Third session)  - 2 spots available
14:30-16:30  (Fourth session) - 2 spots available
```

**Benefits:**
- Each client gets 2 hours (1 hour prep + 1 hour photos)
- 2 families can book same slot = **double revenue**
- First hour: both families prepare separately
- Last hour: you alternate between families for photos
- Overlapping schedules maximize studio usage
- Customers see real-time availability ("2 hely maradt", "1 hely maradt", "Betelt")

---

## Database Changes

### Migration: 011-special-events-custom-slots.sql

**Changes:**
1. Made `room_id` nullable (can be NULL)
2. Added `use_custom_slots` BOOLEAN field (default: false)
3. Added `custom_slots` JSONB field to store custom time slots
4. Added `max_capacity_per_slot` INTEGER field (default: 1, constraint: > 0)

**Custom Slots Format:**
```json
[
  {"start": "10:00", "end": "12:00"},
  {"start": "11:30", "end": "13:30"},
  {"start": "13:00", "end": "15:00"},
  {"start": "14:30", "end": "16:30"}
]
```

**Capacity:**
- Default: 1 (one booking per slot)
- Can be set to 2-10 for events that handle multiple clients
- Enforced at database level (must be positive integer)

---

## How to Use

### Creating an Event with Custom Slots

#### Admin UI:

1. Go to **Admin** → **Special Events**
2. Click **"Új Esemény"** (New Event)
3. Fill in basic details (name, description, dates, price)
4. **Optional Room:**
   - Check **"Nincs meghatározott terem"** if you don't want to assign a specific room
   - Otherwise, select a room from the dropdown
5. **Custom Time Slots:**
   - Check **"Egyedi időpontok használata"** (Use custom time slots)
   - The UI will show 4 default time slots (10:00-12:00, 11:30-13:30, 13:00-15:00, 14:30-16:30)
   - Click **"Új időpont hozzáadása"** to add more slots
   - Use the trash icon to remove unwanted slots
   - Edit times directly in the time pickers
6. Click **"Mentés"** (Save)

#### API Example:

```typescript
POST /api/admin/special-events
Authorization: Bearer <admin_token>

{
  "name": "Mikulás Fotózás 2024",
  "description": "2 órás fotózási idősáv, első óra öltözködés/felkészülés",
  "slug": "mikulas-2024",
  "room_id": null,  // No specific room
  "start_date": "2024-12-01",
  "end_date": "2024-12-24",
  "price_per_slot": 25000,
  "active": true,
  "use_custom_slots": true,
  "custom_slots": [
    {"start": "10:00", "end": "12:00"},
    {"start": "11:30", "end": "13:30"},
    {"start": "13:00", "end": "15:00"},
    {"start": "14:30", "end": "16:30"}
  ]
}
```

---

## Backend Changes

### Files Modified:

1. **`backend/src/controllers/specialEvents.ts`**
   - Updated `getAllSpecialEvents` - Changed `JOIN` to `LEFT JOIN` for nullable room_id
   - Updated `getSpecialEventById` - Changed `JOIN` to `LEFT JOIN`
   - Updated `createSpecialEvent` - Added validation and handling for custom_slots
   - Updated `updateSpecialEvent` - Added custom_slots update logic
   - Updated `getSpecialEventAvailability` - Added logic to use custom_slots when available

2. **`backend/src/database/migrations/011-special-events-custom-slots.sql`** (NEW)
   - Migration file to update the database schema

---

## Frontend Changes

### Admin Page (`frontend/src/pages/Admin/SpecialEventsPage.tsx`)

**New UI Elements:**
1. **"Nincs meghatározott terem"** checkbox
   - When checked, disables room dropdown
   - Sends `room_id: null` to backend

2. **"Egyedi időpontok használata"** checkbox
   - When checked, shows custom slots editor
   - When unchecked, shows traditional start_time/end_time/slot_duration fields

3. **Custom Slots Editor**
   - List of time slot pairs (start - end)
   - Add/remove slots dynamically
   - Time pickers for easy editing
   - Validation ensures start and end times are provided

**Table Updates:**
- Room column now shows "Nincs terem" (No room) in italics for events without a room

### Booking Page (`frontend/src/pages/SpecialEventBookingPage.tsx`)

**Changes:**
1. Room information only displays if `room_name` exists
2. Shows "Egyedi időpontok" instead of duration when using custom slots
3. Handles events without room_id by using a placeholder: `special-event-{eventId}`
4. Cart system works seamlessly with or without room_id

---

## Migration Steps

### 1. Apply Database Migration

**Option A: Using npm script (recommended)**
```bash
cd backend
npm run migrate
```

**Option B: Manual SQL**
```bash
cd backend
psql $DATABASE_URL -f src/database/migrations/011-special-events-custom-slots.sql
```

**Option C: Direct SQL (Production - Vercel Postgres)**
```sql
-- Copy and run the contents of:
-- backend/src/database/migrations/011-special-events-custom-slots.sql
```

### 2. Deploy Backend Changes

```bash
cd backend
npm run build
# Deploy to Vercel or your hosting platform
```

### 3. Deploy Frontend Changes

```bash
cd frontend
npm run build
# Deploy to Vercel or your hosting platform
```

---

## Testing

### Test Scenario 1: Create Event with Custom Slots

1. Login as admin
2. Go to Special Events admin page
3. Create new event:
   - Name: "Test Custom Slots"
   - Check "Egyedi időpontok használata"
   - Set 4 overlapping slots (10:00-12:00, 11:30-13:30, etc.)
   - Save
4. Verify the event appears in the list

### Test Scenario 2: Book Custom Slot

1. Go to the event booking page: `/special-events/test-custom-slots`
2. Select a date
3. Verify that exactly 4 time slots appear:
   - 10:00 - 12:00
   - 11:30 - 13:30
   - 13:00 - 15:00
   - 14:30 - 16:30
4. Click on a slot to add to cart
5. Verify it appears in cart
6. Complete checkout

### Test Scenario 3: Event Without Room

1. Create event with "Nincs meghatározott terem" checked
2. Verify room dropdown is disabled
3. Save event
4. Check event list - should show "Nincs terem" in room column
5. Book a slot - should work normally
6. Verify checkout and payment complete successfully

---

## Troubleshooting

### Migration Fails

**Error:** `column "room_id" of relation "special_events" must be NOT NULL`

**Solution:** Some events might have NULL room_id already. Update them first:
```sql
UPDATE special_events SET room_id = 'studio-a' WHERE room_id IS NULL;
```

### Custom Slots Not Showing

**Check:**
1. Verify `use_custom_slots` is `true`
2. Verify `custom_slots` is valid JSON array
3. Check browser console for errors
4. Verify backend is returning custom_slots in API response

### Booking Fails for Events Without Room

**Check:**
1. Verify cart is using placeholder room_id: `special-event-{eventId}`
2. Check backend accepts NULL room_id in special_event_bookings table
3. Verify checkout doesn't require room_id

---

## Backward Compatibility

✅ **Fully Backward Compatible**

- Existing events continue to work unchanged
- Old events without custom_slots use traditional slot generation
- Events with room_id continue to display room information
- No data migration required for existing events

---

## Future Enhancements

### Possible Additions:

1. **Slot Capacity** - Allow multiple bookings per slot
2. **Slot-Specific Pricing** - Different prices for different time slots
3. **Blocked Slots** - Admin can block specific slots without deleting
4. **Recurring Events** - Weekly/monthly recurring custom slots
5. **Waitlist** - Allow customers to join waitlist for full slots

---

## API Reference

### Create Special Event

**POST** `/api/admin/special-events`

**New Fields:**
- `room_id` (string | null) - Room ID or null for no room
- `use_custom_slots` (boolean) - Use custom time slots
- `custom_slots` (array) - Array of {start, end} time objects

**Example:**
```json
{
  "name": "Santa Photos",
  "room_id": null,
  "start_date": "2024-12-01",
  "end_date": "2024-12-24",
  "price_per_slot": 25000,
  "max_capacity_per_slot": 2,
  "use_custom_slots": true,
  "custom_slots": [
    {"start": "10:00", "end": "12:00"},
    {"start": "11:30", "end": "13:30"}
  ]
}
```

### Get Special Event Availability

**GET** `/api/special-events/:id/availability?date=2024-12-15`

**Response with Custom Slots & Capacity:**
```json
{
  "success": true,
  "event": {
    "id": "...",
    "use_custom_slots": true,
    "custom_slots": [...],
    "max_capacity_per_slot": 2
  },
  "availableSlots": [
    {"start_time": "10:00:00", "end_time": "12:00:00", "available": true, "remaining_capacity": 2},
    {"start_time": "11:30:00", "end_time": "13:30:00", "available": true, "remaining_capacity": 1},
    {"start_time": "13:00:00", "end_time": "15:00:00", "available": false, "remaining_capacity": 0},
    {"start_time": "14:30:00", "end_time": "16:30:00", "available": true, "remaining_capacity": 2}
  ],
  "maxCapacityPerSlot": 2
}
```

**Capacity Display:**
- `remaining_capacity: 2` → Shows "2 hely maradt"
- `remaining_capacity: 1` → Shows "1 hely maradt"
- `remaining_capacity: 0` → Shows "Betelt" (Full)

---

## Summary

✅ **Feature Complete:**
- Optional room selection
- Custom time slots with overlapping support
- **Slot capacity (2+ bookings per slot)** ⭐ NEW!
- Real-time capacity display on booking page
- Full UI support in admin panel
- Booking page fully functional with capacity indicators
- API updated and tested
- Database migration ready
- Backward compatible (existing events default to capacity = 1)

🎯 **Ready to Deploy!**

**Perfect for Your Use Case:**
- ✅ No room required
- ✅ 4 custom time slots (10:00-12:00, 11:30-13:30, 13:00-15:00, 14:30-16:30)
- ✅ 2 families can book same slot
- ✅ Shows "X hely maradt" to customers
- ✅ Double revenue per slot! 💰
