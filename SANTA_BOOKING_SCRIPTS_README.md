# Santa Event Booking Scripts

## Overview

These SQL scripts help you block and manage time slots for the Mikulás (Santa) special event.

## Scripts Included

### 1. `GET_SANTA_EVENT_ID.sql`
**Purpose:** Get the Mikulás event ID from the database

**When to use:** First, to verify the event exists and get its ID

**Run this:**
```sql
\i GET_SANTA_EVENT_ID.sql
```

**Expected output:**
```
id: 03748123-6228-4fbf-bd25-61ce9272e994
name: Mikulás Fotózás
start_date: 2025-12-06
end_date: 2025-12-07
```

---

### 2. `BLOCK_SATURDAY_SANTA_10-11.sql`
**Purpose:** Block Saturday (Dec 7) slots from 10:00-11:00

**What it does:**
- Creates an admin order
- Blocks 4 time slots (15 minutes each):
  - 10:00-10:15
  - 10:15-10:30
  - 10:30-10:45
  - 10:45-11:00
- Links them to the Santa special event

**Run this:**
```sql
\i BLOCK_SATURDAY_SANTA_10-11.sql
```

**Expected output:**
```
Successfully blocked 4 Santa slots on Saturday 10:00-11:00
Order ID: [generated-uuid]

Verification:
- 2025-12-07 10:00 - booked - Mikulás Fotózás
- 2025-12-07 10:15 - booked - Mikulás Fotózás
- 2025-12-07 10:30 - booked - Mikulás Fotózás
- 2025-12-07 10:45 - booked - Mikulás Fotózás
```

---

### 3. `UNBLOCK_SATURDAY_SANTA_10-11.sql`
**Purpose:** Remove the block and free up the slots

**When to use:** If you made a mistake or want to open these slots to customers

**Run this:**
```sql
\i UNBLOCK_SATURDAY_SANTA_10-11.sql
```

**Expected output:**
```
Successfully unblocked Saturday 10:00-11:00 Santa slots
```

---

### 4. `CHECK_SANTA_BOOKINGS.sql`
**Purpose:** View all bookings for the Santa event

**When to use:** 
- After blocking slots to verify
- To see all customer bookings
- To check availability

**Run this:**
```sql
\i CHECK_SANTA_BOOKINGS.sql
```

**Expected output:**
```
date       | start_time | end_time | customer_name                    | booking_type
-----------|------------|----------|----------------------------------|------------------
2025-12-06 | 09:00      | 09:15    | János Kovács                     | ✓ Customer Booking
2025-12-07 | 10:00      | 10:15    | Admin Block - Santa Saturday... | 🔒 BLOCKED
2025-12-07 | 10:15      | 10:30    | Admin Block - Santa Saturday... | 🔒 BLOCKED
...

Summary:
date       | total_bookings | admin_blocks | customer_bookings
-----------|----------------|--------------|-------------------
2025-12-06 | 12             | 0            | 12
2025-12-07 | 15             | 4            | 11
```

---

## How to Run These Scripts

### Option 1: Direct Database Connection

**On Neon Console:**
1. Go to https://console.neon.tech/
2. Select your project
3. Open SQL Editor
4. Copy and paste the script content
5. Click "Run"

**Using psql:**
```bash
psql $DATABASE_URL -f BLOCK_SATURDAY_SANTA_10-11.sql
```

### Option 2: Through Your App

Connect to your production database and run the scripts.

---

## Step-by-Step Guide

### Initial Setup (Do Once)

**Step 1:** Verify the Santa event exists
```sql
\i GET_SANTA_EVENT_ID.sql
```

If the event doesn't exist, create it in the admin panel first:
- Go to `/admin/special-events`
- Create "Mikulás Fotózás" event
- Dates: Dec 6-7, 2025
- Time: 8:00-20:00
- 15-minute slots
- Price: 15000 Ft

**Step 2:** Update the event ID in scripts (if different)

Open `BLOCK_SATURDAY_SANTA_10-11.sql` and update this line:
```sql
v_special_event_id UUID := '03748123-6228-4fbf-bd25-61ce9272e994';
```

Replace with the actual ID from Step 1.

---

### Blocking Saturday 10-11 Slots

**Step 1:** Run the blocking script
```sql
\i BLOCK_SATURDAY_SANTA_10-11.sql
```

**Step 2:** Verify it worked
```sql
\i CHECK_SANTA_BOOKINGS.sql
```

You should see:
- 4 blocked slots on Saturday (Dec 7)
- Customer name: "Admin Block - Santa Saturday 10-11"
- Booking type: "🔒 BLOCKED"

**Step 3:** Test on the website
1. Go to the Santa booking page
2. Select Saturday, December 7
3. Check that 10:00, 10:15, 10:30, 10:45 show as "Foglalt" (Booked)

---

### Unblocking (If Needed)

**Step 1:** Run the unblock script
```sql
\i UNBLOCK_SATURDAY_SANTA_10-11.sql
```

**Step 2:** Verify slots are free
```sql
\i CHECK_SANTA_BOOKINGS.sql
```

The 4 blocked slots should no longer appear.

---

## Creating Custom Block Scripts

Want to block different times? Copy `BLOCK_SATURDAY_SANTA_10-11.sql` and modify:

### Example: Block Friday 14:00-15:00

```sql
-- Change these values:
v_booking_date DATE := '2025-12-06'; -- Friday instead of Saturday
customer_name := 'Admin Block - Santa Friday 14-15'; -- Different name

-- Change the time slots:
-- Slot 1: 14:00-14:15
start_time := '14:00:00';
end_time := '14:15:00';

-- Slot 2: 14:15-14:30
-- ... etc
```

---

## Important Notes

### ⚠️ Before Running Scripts

1. **Backup first!** Always backup before running SQL scripts
2. **Test on dev database** if possible
3. **Verify event ID** matches your actual Santa event
4. **Check existing bookings** - don't accidentally block customer bookings

### ✅ After Running Scripts

1. **Verify in database** using `CHECK_SANTA_BOOKINGS.sql`
2. **Test on website** - try booking the blocked slots
3. **Check admin panel** - verify the order appears

### 🔄 Maintenance

- Run `CHECK_SANTA_BOOKINGS.sql` regularly to monitor bookings
- Keep track of which slots you've blocked
- Document any custom blocks you create

---

## Troubleshooting

### Error: "Cannot read properties of null"

**Cause:** Event ID doesn't exist

**Solution:** 
1. Run `GET_SANTA_EVENT_ID.sql` to get correct ID
2. Update the ID in blocking script
3. Or create the event in admin panel first

### Error: "Duplicate key value"

**Cause:** Slot already blocked or booked

**Solution:**
1. Run `CHECK_SANTA_BOOKINGS.sql` to see existing bookings
2. Choose different time slots
3. Or unblock first if it's your admin block

### Slots Still Showing as Available

**Causes:**
1. Script didn't run successfully
2. Wrong event ID
3. Wrong date
4. Cache issue on frontend

**Solution:**
1. Run `CHECK_SANTA_BOOKINGS.sql` to verify
2. Hard refresh browser (Ctrl+F5)
3. Check that order status is 'paid' and item status is 'booked'

---

## Quick Reference

```bash
# Get event ID
psql $DATABASE_URL -f GET_SANTA_EVENT_ID.sql

# Block Saturday 10-11
psql $DATABASE_URL -f BLOCK_SATURDAY_SANTA_10-11.sql

# Check all bookings
psql $DATABASE_URL -f CHECK_SANTA_BOOKINGS.sql

# Unblock if needed
psql $DATABASE_URL -f UNBLOCK_SATURDAY_SANTA_10-11.sql
```

---

## Summary

✅ **To block Saturday 10-11:**
1. Run `GET_SANTA_EVENT_ID.sql` (verify event exists)
2. Run `BLOCK_SATURDAY_SANTA_10-11.sql` (block slots)
3. Run `CHECK_SANTA_BOOKINGS.sql` (verify)
4. Test on website

✅ **To unblock:**
1. Run `UNBLOCK_SATURDAY_SANTA_10-11.sql`
2. Verify with `CHECK_SANTA_BOOKINGS.sql`

✅ **To check status:**
- Run `CHECK_SANTA_BOOKINGS.sql` anytime

---

Good luck with your Santa bookings! 🎅✨

