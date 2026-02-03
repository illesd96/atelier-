# Quick Start: Custom Time Slots for Special Events

## What's New?

✨ **Three Major Features:**

1. **Optional Room** - Create events without tying them to a specific studio room
2. **Custom Time Slots** - Define specific fixed time slots (e.g., 10:00-12:00, 11:30-13:30)
3. **Slot Capacity** - Allow multiple people (e.g., 2) to book the same time slot

Perfect for events like Santa photo sessions where you need overlapping schedules with prep time and can handle multiple families!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Apply Database Migration

**Windows (PowerShell):**
```powershell
.\apply-custom-slots-migration.ps1
```

**Mac/Linux:**
```bash
chmod +x apply-custom-slots-migration.sh
./apply-custom-slots-migration.sh
```

**Or manually:**
```bash
cd backend
psql $DATABASE_URL -f src/database/migrations/011-special-events-custom-slots.sql
```

### Step 2: Deploy Code

```bash
# Deploy backend
cd backend
git add .
git commit -m "Add custom slots and optional rooms for special events"
git push

# Deploy frontend
cd ../frontend
git add .
git commit -m "Add custom slots UI for special events"
git push
```

### Step 3: Create Your First Event

1. Go to **Admin Panel** → **Special Events**
2. Click **"Új Esemény"** (New Event)
3. Fill in the form:
   - ✅ Check **"Nincs meghatározott terem"** (no specific room)
   - ✅ Check **"Egyedi időpontok használata"** (use custom slots)
   - ✅ Edit the 4 default time slots or add your own
4. Click **Save**

Done! 🎉

---

## 📝 Example: Santa Photo Sessions

**Your Requirement:**
- 4 time slots per day
- Each session is 2 hours
- First hour = prep/dressing up
- Second hour = actual photos
- Starts at 10:00 AM
- New session every 1.5 hours

**Time Slots to Configure:**
```
10:00 - 12:00  (Session 1)
11:30 - 13:30  (Session 2)  ← Overlaps with Session 1
13:00 - 15:00  (Session 3)  ← Overlaps with Session 2
14:30 - 16:30  (Session 4)  ← Overlaps with Session 3
```

**In the Admin UI:**

1. Name: "Mikulás Fotózás 2024"
2. Description: "2 órás időpont, első óra öltözködés"
3. ✅ **"Nincs meghatározott terem"** (checked)
4. Date range: December 1-24, 2024
5. ✅ **"Egyedi időpontok használata"** (checked)
6. Time slots:
   - Slot 1: 10:00 → 12:00
   - Slot 2: 11:30 → 13:30
   - Slot 3: 13:00 → 15:00
   - Slot 4: 14:30 → 16:30
7. Price: 25,000 Ft per slot
8. **Max. foglalások/időpont: 2** ← NEW! Two people can book each slot
9. Save!

---

## 🎨 Admin UI Guide

### Creating Event WITHOUT Room

![Checkbox for no room]
☑️ **"Nincs meghatározott terem"**

When checked:
- Room dropdown is hidden
- Event is not tied to any physical room
- Customers won't see room information

### Using Custom Time Slots

![Checkbox for custom slots]
☑️ **"Egyedi időpontok használata"**

When checked:
- Traditional time fields are hidden (start time, end time, duration)
- Custom slots editor appears
- You can add/edit/remove individual time slots

### Custom Slots Editor

```
[10:00] - [12:00]  [🗑️]
[11:30] - [13:30]  [🗑️]
[13:00] - [15:00]  [🗑️]
[14:30] - [16:30]  [🗑️]

[+ Új időpont hozzáadása]
```

- Click **time fields** to edit
- Click **trash icon** to remove slot
- Click **"+ Új időpont"** to add more

### Slot Capacity Control

**Max. foglalások/időpont:** [- 2 +]

- Use **+ / -** buttons to adjust capacity
- Default: **2** (perfect for Santa sessions)
- Min: **1** (one family at a time)
- Max: **10** (for large group events)
- Shows as "X hely maradt" on booking page

---

## 🛍️ Customer Booking Experience

### What Customers See:

**Event Page:**
- Event name and description
- Price per slot
- "Egyedi időpontok" (Custom time slots) badge
- Calendar to select date

**Available Times (for one day):**
```
☀️ Délelőtt (Morning)
[ 10:00 - 12:00 ] ✓ 2 hely maradt
[ 11:30 - 13:30 ] ✓ 1 hely maradt

🌙 Délután (Afternoon)
[ 13:00 - 15:00 ] ✗ Betelt
[ 14:30 - 16:30 ] ✓ 2 hely maradt
```

**Customers see:**
- "2 hely maradt" = 2 spots remaining
- "1 hely maradt" = Only 1 spot left (hurry!)
- "Betelt" = Fully booked

Customers can:
- Click any available slot to add to cart
- See real-time capacity updates
- Select multiple slots (different days)
- Proceed to checkout as normal

---

## ✅ Testing Checklist

After deployment:

- [ ] Can create event without room
- [ ] Can create event with custom slots
- [ ] Can edit existing events
- [ ] Custom slots appear on booking page
- [ ] Can add slots to cart
- [ ] Checkout works correctly
- [ ] Payment confirmation shows correct slot times
- [ ] Email confirmation includes slot information
- [ ] Admin can see bookings for custom slot events

---

## 🔧 Troubleshooting

### Migration Error: "column already exists"

**Solution:** Migration was already applied, skip to deployment.

### Room field shows error "required"

**Solution:** Make sure "Nincs meghatározott terem" checkbox is checked.

### Custom slots not showing on booking page

**Check:**
1. Is "Egyedi időpontok használata" checked in admin?
2. Are custom_slots populated (at least 1 slot)?
3. Is the event active?
4. Refresh the page

### Booking fails

**Check:**
1. Selected date is within event date range
2. Selected slot is still available
3. Cart has items
4. Check browser console for errors

---

## 📚 More Information

See full documentation: `SPECIAL_EVENTS_CUSTOM_SLOTS.md`

---

## 🎯 Summary

**Before:**
- Events required a room
- Time slots auto-generated (e.g., every 15 minutes)
- No overlapping possible
- Only 1 booking per slot

**After:**
- Events can be room-less ✅
- Custom fixed time slots ✅
- Overlapping schedules supported ✅
- Multiple bookings per slot (capacity: 2) ✅
- Real-time "spots remaining" indicator ✅
- Perfect for prep time scenarios ✅

**Perfect for your Santa sessions!** 🎅📸

**Example:** With capacity of 2:
- Time slot 10:00-12:00 can have 2 families booked
- First booking: "2 hely maradt" → "1 hely maradt"
- Second booking: "1 hely maradt" → "Betelt"
- Maximizes your revenue and studio usage! 💰
