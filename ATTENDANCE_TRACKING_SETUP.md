# Attendance Tracking Setup Guide

This guide explains the new attendance tracking feature for the admin schedule view.

## Database Migration

### Run the Migration

Execute the following SQL migration to add attendance tracking to your database:

```sql
-- Run this in your database
\i backend/src/database/migrations/003-attendance-tracking.sql
```

Or manually run:

```sql
-- Add attendance tracking to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(20) DEFAULT 'pending' 
CHECK (attendance_status IN ('pending', 'showed_up', 'no_show', 'cancelled'));

-- Add index for attendance queries
CREATE INDEX IF NOT EXISTS idx_order_items_attendance ON order_items(attendance_status);

-- Add notes field for admin comments
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;
```

## Features

### Admin Schedule Page

The new admin schedule page (`/admin/schedule`) provides:

1. **Calendar/Grid View** - View all paid bookings in a table format
2. **Date Range Filter** - Filter bookings by date range (default: next 7 days)
3. **Room Filter** - Filter by specific studio
4. **Customer Information** - See customer name, email, and phone for each booking
5. **Quick Actions** - Fast buttons to mark attendance:
   - ✅ **Showed Up** - Mark customer as present
   - ❌ **No Show** - Mark customer as absent
   - 📝 **Add Notes** - Add admin notes about the booking

### Attendance Statuses

- **Pending** (default) - Customer hasn't attended yet
- **Showed Up** - Customer arrived for their booking
- **No Show** - Customer didn't show up
- **Cancelled** - Booking was cancelled

### Access

- Navigate from Admin Bookings page using the "Schedule View" button
- Or go directly to `/admin/schedule`
- Navigate back to orders view using "View Orders" button

## API Endpoints

### Get Schedule View
```
GET /admin/schedule?date_from=2024-01-01&date_to=2024-01-31&room_id=studio-a
Authorization: Bearer <admin-token>
```

### Update Attendance
```
PUT /admin/bookings/:bookingItemId/attendance
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "attendance_status": "showed_up",
  "admin_notes": "Customer arrived early, very professional"
}
```

## Development

### Frontend Files Created
- `frontend/src/pages/AdminSchedulePage.tsx` - Main schedule page component
- `frontend/src/pages/AdminSchedulePage.css` - Styling
- Updated `frontend/src/App.tsx` - Added route
- Updated `frontend/src/services/api.ts` - Added API methods

### Backend Files Created/Modified
- `backend/src/database/migrations/003-attendance-tracking.sql` - Database migration
- `backend/src/controllers/admin.ts` - Added `getScheduleView` and `updateAttendance` functions
- `backend/src/routes/index.ts` - Added new routes

## Usage Example

1. Admin logs in and navigates to `/admin/schedule`
2. Sets date range (e.g., today to next week)
3. Optionally filters by room
4. Views table of all bookings with customer details
5. As customers arrive, clicks ✅ button to mark "Showed Up"
6. If customer doesn't show, clicks ❌ for "No Show"
7. Adds notes as needed using 📝 button

## Benefits

- **Real-time Tracking** - Know who's coming and who showed up
- **Quick Actions** - Mark attendance with one click
- **Customer Context** - See contact info for follow-ups
- **Admin Notes** - Keep track of special circumstances
- **Better Analytics** - Track no-show rates and attendance patterns

