# Admin Bookings Management System

This document explains the admin bookings management system that has been implemented for your photo studio application.

## Overview

The admin system allows designated admin users to:
- View all bookings in the system
- Filter bookings by status and date range
- View detailed statistics (today's orders, weekly/monthly totals, revenue)
- Access detailed information about each booking including customer details and time slots  

## Features Implemented

### Backend Changes

1. **Database Migration** (`backend/src/database/migrations/004-add-admin-role.sql`)
   - Added `is_admin` boolean field to users table
   - Created index for fast admin lookups

2. **Admin Middleware** (`backend/src/middleware/adminAuth.ts`)
   - `requireAdmin`: Checks if authenticated user is an admin
   - `adminAuth`: Combined authentication + admin check middleware

3. **Admin Controller** (`backend/src/controllers/admin.ts`)
   - `getAllBookings`: Get all bookings with filtering and pagination
   - `getBookingStats`: Get dashboard statistics

4. **Updated Types** (`backend/src/types/index.ts`)
   - Added `is_admin` field to User interface
   - Added `is_admin` to AuthResponse interface

5. **API Routes** (`backend/src/routes/index.ts`)
   - `GET /api/admin/bookings` - Get all bookings (admin only)
   - `GET /api/admin/stats` - Get booking statistics (admin only)

6. **Auth Service Updates**
   - Updated `getUserProfile` to include `is_admin` field
   - Updated login and register responses to include admin status

### Frontend Changes

1. **Admin Bookings Page** (`frontend/src/pages/AdminBookingsPage.tsx`)
   - Dashboard with statistics cards
   - Filterable data table with bookings
   - Expandable rows showing detailed booking information
   - Pagination support
   - Date range and status filters

2. **Updated Auth Context** (`frontend/src/contexts/AuthContext.tsx`)
   - Added `is_admin` field to User interface

3. **Admin API Client** (`frontend/src/services/api.ts`)
   - Added `adminAPI` with methods to fetch bookings and stats

4. **Navigation Updates** (`frontend/src/components/shared/Header.tsx`)
   - Admin dashboard icon in header (visible only to admins)
   - Admin menu item in mobile menu
   - Golden/yellow color scheme for admin elements

5. **Routing** (`frontend/src/App.tsx`)
   - Added `/admin/bookings` route

## Setup Instructions

### 1. Run the Database Migration

Execute the migration to add the `is_admin` field to your users table:

```sql
-- Run this in your database
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = true;
```

Or use your migration system:
```bash
# If you have a migration runner
psql $DATABASE_URL -f backend/src/database/migrations/004-add-admin-role.sql
```

### 2. Set a User as Admin

To make a user an admin, run this SQL command with the user's email:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-admin-email@example.com';
```

### 3. Rebuild Backend (TypeScript)

The backend needs to be rebuilt to include the new TypeScript changes:

```bash
cd backend
npm run build
```

### 4. Restart Your Application

Restart both frontend and backend to apply all changes.

## Using the Admin Dashboard

### Access

1. Log in with an admin account
2. You'll see a golden chart icon (📊) in the header
3. Click the icon or navigate to `/admin/bookings`

### Features

#### Statistics Dashboard
Shows at the top of the page:
- Today's orders
- This week's orders
- This month's orders
- Monthly revenue
- Pending orders
- Upcoming bookings

#### Bookings Table
- **Expandable rows**: Click the arrow to see full booking details
- **Filters**:
  - Status filter (pending, paid, failed, etc.)
  - Date range filter (from/to dates)
  - Clear filters button
- **Pagination**: Navigate through large datasets
- **Sortable columns**: Click column headers to sort

#### Booking Details (Expanded View)
- Customer information
- Order ID and payment details
- User account info (if registered user)
- List of all booked time slots with studio names

## API Endpoints

### Get All Bookings
```
GET /api/admin/bookings
Authorization: Bearer <token>

Query Parameters:
- status: Filter by order status (optional)
- date_from: Filter bookings from date (YYYY-MM-DD, optional)
- date_to: Filter bookings to date (YYYY-MM-DD, optional)
- limit: Number of results per page (default: 50)
- offset: Pagination offset (default: 0)

Response:
{
  "success": true,
  "bookings": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Booking Statistics
```
GET /api/admin/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "today_orders": 5,
    "week_orders": 15,
    "month_orders": 42,
    "paid_orders": 35,
    "pending_orders": 7,
    "failed_orders": 0,
    "month_revenue": 125000,
    "total_bookings": 42,
    "upcoming_bookings": 28
  }
}
```

## Security

- Admin routes are protected with `adminAuth` middleware
- Regular users cannot access admin endpoints (403 Forbidden)
- Admin status is checked on every request
- Frontend automatically redirects non-admins away from admin pages

## UI/UX Design

- Admin elements use a golden/yellow color scheme (#fbbf24) to distinguish from regular features
- Responsive design works on mobile and desktop
- Uses PrimeReact components for professional data table functionality
- Statistics cards have gradient backgrounds for visual appeal
- Loading states and empty states are handled

## Future Enhancements

Potential additions you might want to consider:
- Edit/cancel bookings from admin panel
- Export bookings to CSV/Excel
- Email customers from admin panel
- Advanced analytics and charts
- User management (activate/deactivate users)
- Manual booking creation
- Revenue reports by date range

## Troubleshooting

### "Admin access required" error
- Ensure the user is set as admin in the database
- Log out and log back in to refresh the token
- Check that the migration ran successfully

### Admin button not showing
- Verify user has `is_admin: true` in the database
- Check browser console for errors
- Clear browser cache and reload

### TypeScript errors
- Run `npm run build` in the backend directory
- Ensure all dependencies are installed
- Check for any linting errors

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs for authentication issues
3. Verify database migration completed successfully
4. Ensure admin flag is set correctly in database

