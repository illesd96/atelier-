# Special Events System - User Guide

This guide explains how to set up and manage special booking events like Santa Claus photo sessions with custom time slots.

## 📋 Overview

The Special Events system allows you to:
- Create special booking events (e.g., Santa Claus photos, themed sessions)
- Use custom time slots (15 minutes, 30 minutes, etc.) instead of standard 1-hour slots
- Automatically block normal bookings during special event times
- Set custom pricing per time slot
- Limit events to specific rooms and date ranges

---

## 🚀 Quick Start

### 1. Access Admin Panel

1. Go to `/admin/bookings`
2. Click the "Special Events" button in the header
3. Or navigate directly to `/admin/special-events`

### 2. Create a Special Event

Click "Új Esemény" (New Event) and fill in:

- **Név** (Name): e.g., "Mikulás Fotózás 2025"
- **Leírás** (Description): Optional description for customers
- **Terem** (Room): Select which studio (e.g., Atelier)
- **Kezdő dátum** (Start Date): When the event begins
- **Befejező dátum** (End Date): When the event ends
- **Kezdés idő** (Start Time): Daily start time (default: 08:00)
- **Befejezés idő** (End Time): Daily end time (default: 20:00)
- **Időköz** (Slot Duration): Duration in minutes (e.g., 15 for Santa sessions)
- **Ár/Időköz** (Price per Slot): Price in HUF (e.g., 15000 Ft)
- **Aktív** (Active): Check to make event bookable

### 3. Share Booking Link

After creating the event, share the booking link with customers:
```
https://your-domain.com/special-events/{event-id}
```

The event ID is shown in the admin table.

---

## 📅 Example: Santa Claus Photo Session

### Setup:

```
Név: Mikulás Fotózás 2025
Leírás: Professzionális fotózás Mikulással!
Terem: Atelier
Időszak: 2025-12-05 → 2025-12-06
Időintervallum: 08:00 → 20:00
Időköz: 15 perc
Ár: 15,000 Ft
```

This creates:
- **48 slots per day** (4 per hour × 12 hours)
- **2 days of availability**
- **96 total bookable slots**
- **Blocks Atelier studio** from normal bookings during this period

---

## 🎨 Customer Booking Experience

### Two-Column Layout

The booking page automatically splits slots into two columns:
- **Left Column**: Morning slots (8:00 - 14:00)
- **Right Column**: Afternoon slots (14:00 - 20:00)

### Booking Flow:

1. Customer visits `/special-events/{event-id}`
2. Sees event details (room, duration, price)
3. Selects a date from calendar
4. Chooses one or more time slots
5. Adds to cart and proceeds to checkout
6. Receives confirmation email with special event label

---

## 🔒 How Blocking Works

When a special event is active:

1. **Normal booking page** (`/booking`):
   - Selected room shows as "Foglalt" (Booked) for event hours
   - Customers cannot book these slots
   
2. **Special event page** (`/special-events/{id}`):
   - Shows 15-minute (or custom) slots
   - Only available on special event booking page

### Example:

```
Special Event: December 5th, 8:00-20:00, Atelier Studio

Normal Booking Page:
  Atelier: 08:00 ❌ Foglalt
  Atelier: 09:00 ❌ Foglalt
  ...
  Atelier: 19:00 ❌ Foglalt

Special Event Page:
  08:00-08:15 ✅ Elérhető
  08:15-08:30 ✅ Elérhető
  ...
  19:45-20:00 ✅ Elérhető
```

---

## 💾 Database Structure

### Tables Created:

#### `special_events`
Stores event definitions:
- name, description
- room_id (which studio)
- start_date, end_date
- start_time, end_time (daily hours)
- slot_duration_minutes (e.g., 15)
- price_per_slot
- active (enable/disable)

#### `special_event_bookings`
Links bookings to events:
- special_event_id → special_events
- order_item_id → order_items

### Migration:

The system automatically creates these tables on deployment.
Migration file: `backend/src/database/migrations/008-special-events.sql`

---

## 🛠️ Admin Management

### View All Events

The admin table shows:
- Event name and room
- Date range
- Time interval
- Slot duration
- Price
- Number of bookings
- Active status

### Edit an Event

Click the edit icon (✏️) to modify:
- Event details
- Dates and times
- Pricing
- Active status

**Note**: You can deactivate an event to stop new bookings while keeping existing ones.

### Delete an Event

Click the delete icon (🗑️):
- ✅ Allowed if no bookings exist
- ❌ Blocked if bookings exist (deactivate instead)

---

## 📧 Email Notifications

### Confirmation Email

Special event bookings show with a star indicator:

```
Booking Details:
  Atelier Studio
  ⭐ Mikulás Fotózás 2025
  📅 2025. December 05.
  🕒 10:30 - 10:45
```

### Reminder Email

Same format, includes special event name.

---

## 🔍 API Endpoints

### Public Endpoints:

```
GET  /api/special-events
     Get all active special events

GET  /api/special-events/:id
     Get event details

GET  /api/special-events/:id/availability?date=YYYY-MM-DD
     Get available slots for a date
```

### Admin Endpoints (require authentication):

```
POST   /api/admin/special-events
       Create new event

PUT    /api/admin/special-events/:id
       Update event

DELETE /api/admin/special-events/:id
       Delete event (if no bookings)
```

---

## 🎯 Best Practices

### 1. Advance Setup
Create events at least 1-2 weeks before they start to allow marketing time.

### 2. Slot Duration
- **15 minutes**: Quick sessions (Santa photos, headshots)
- **30 minutes**: Standard portrait sessions
- **60 minutes**: Full sessions (back to normal booking)

### 3. Pricing Strategy
Set prices per slot:
- 15 min → 15,000 Ft
- 30 min → 25,000 Ft
- Consider discounts for multiple slots

### 4. Room Selection
- Use **Atelier** for Santa/themed events (cozy, good for kids)
- Use **Frigyes** for product shoots
- Use **Karinthy** for larger groups

### 5. Capacity Management
Monitor bookings in admin panel:
- Check "Foglalások" (Bookings) column
- Deactivate if fully booked
- Extend dates if high demand

---

## 🚨 Troubleshooting

### Event Not Showing Up?

1. Check "Aktív" (Active) checkbox
2. Verify dates are in the future
3. Check browser console for errors

### Customers Can't Book?

1. Verify event is active
2. Check date range includes selected date
3. Ensure time slots aren't all booked
4. Check browser console on booking page

### Normal Bookings Still Available?

This means blocking isn't working:
1. Run database migration: `008-special-events.sql`
2. Restart backend server
3. Clear availability cache

### Slots Not Appearing?

1. Check start_time < end_time
2. Verify slot_duration_minutes > 0
3. Ensure room_id matches existing room

---

## 🔄 Migration to Production

### Step 1: Run Migration

```bash
# Connect to production database
psql $DATABASE_URL

# Run migration
\i backend/src/database/migrations/008-special-events.sql
```

### Step 2: Verify Tables

```sql
SELECT * FROM special_events;
SELECT * FROM special_event_bookings;
```

### Step 3: Deploy Code

```bash
# Deploy to Vercel
vercel --prod
```

### Step 4: Create First Event

Use admin panel to create your first special event.

---

## 📊 Monitoring

### Check Bookings:

```sql
-- View special event bookings
SELECT 
    se.name as event_name,
    COUNT(seb.id) as booking_count,
    SUM(se.price_per_slot) as revenue
FROM special_events se
LEFT JOIN special_event_bookings seb ON seb.special_event_id = se.id
GROUP BY se.id, se.name;
```

### View Availability:

```sql
-- Check available slots for a date
SELECT 
    se.name,
    se.start_time,
    se.end_time,
    se.slot_duration_minutes,
    COUNT(seb.id) as booked_slots
FROM special_events se
LEFT JOIN special_event_bookings seb ON seb.special_event_id = se.id
JOIN order_items oi ON oi.id = seb.order_item_id
WHERE oi.booking_date = '2025-12-05'
GROUP BY se.id;
```

---

## 🎉 Success Metrics

Track these KPIs:
- **Booking Rate**: Bookings / Total Slots
- **Revenue per Event**: Total revenue / Event days
- **Average Booking Time**: When customers book (how far in advance)
- **Slot Utilization**: Booked slots / Available slots
- **Repeat Customers**: Same email multiple bookings

---

## 💡 Future Enhancements

Potential additions:
- [ ] Bulk discount (book 3+ slots, get 10% off)
- [ ] Waitlist for fully booked slots
- [ ] Customer reviews/ratings per event
- [ ] Photo gallery upload after session
- [ ] SMS reminders (in addition to email)
- [ ] Multi-room events (book multiple rooms at once)
- [ ] Recurring events (weekly/monthly)

---

## 📞 Support

If you need help:
1. Check this guide first
2. Review error messages in browser console
3. Check server logs (`vercel logs`)
4. Contact development team

---

**Happy Event Planning! 🎄✨**

