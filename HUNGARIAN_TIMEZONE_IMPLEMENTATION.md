# Hungarian Timezone Implementation

## Problem

The booking system was using server time (which can be in any timezone on Vercel servers) and browser time (which depends on the user's location). This caused inconsistencies in:
- Which time slots appear as "past" and unavailable
- When "today" is calculated
- Reservation expiry times

## Solution

All date/time operations now use **Hungarian timezone (Europe/Budapest)** consistently across frontend and backend.

## Changes Made

### Backend Changes

#### 1. Created `backend/src/utils/timezone.ts`
Utility functions for Hungarian timezone handling:
- `getHungarianNow()` - Get current date/time in Budapest
- `getHungarianToday()` - Get today at midnight in Budapest
- `getHungarianHour()` - Get current hour in Budapest
- `isDateInPast()` - Check if a date is past in Budapest time
- `isTimeSlotInPast()` - Check if a time slot is past in Budapest time

#### 2. Updated `backend/src/services/booking.ts`
- Modified `generateHourlySlots()` to use Hungarian time for:
  - Determining if a date is in the past
  - Determining if a time slot is in the past
  - Getting the current hour

```typescript
// Get current date/time in Hungarian timezone
const hungarianNow = new Date();
const hungarianTimeString = hungarianNow.toLocaleString('en-US', { 
  timeZone: 'Europe/Budapest' 
});
const now = new Date(hungarianTimeString);
```

#### 3. Updated `backend/src/services/reservation.ts`
- Modified `createTempReservation()` to calculate expiry time in Hungarian timezone
- Modified `extendReservation()` to calculate new expiry time in Hungarian timezone

### Frontend Changes

#### 1. Created `frontend/src/utils/timezone.ts`
Utility functions for Hungarian timezone handling:
- `getHungarianNow()` - Get current date/time in Budapest
- `getHungarianToday()` - Get today at midnight in Budapest
- `getHungarianHour()` - Get current hour in Budapest
- `getMinSelectableDate()` - Get minimum selectable date (today in Budapest)
- `getMaxSelectableDate()` - Get maximum selectable date (90 days from today in Budapest)
- `formatHungarianDate()` - Format date in Hungarian locale
- `formatHungarianDateTime()` - Format datetime in Hungarian locale

#### 2. Updated `frontend/src/components/StudioGrid/StudioGrid.tsx`
- Changed initial `selectedDate` to use `getHungarianToday()`
- Changed `goToToday()` to use `getHungarianToday()`

```typescript
// Always start with today's date in Hungarian timezone
const [selectedDate, setSelectedDate] = useState<Date>(getHungarianToday());

const goToToday = () => {
  // Always use Hungarian timezone for "today"
  setSelectedDate(getHungarianToday());
};
```

#### 3. Updated `frontend/src/components/StudioGrid/DateNavigation.tsx`
- Changed Calendar `minDate` to use `getMinSelectableDate()`
- Changed Calendar `maxDate` to use `getMaxSelectableDate()`

## How It Works

### Date Comparison Logic

Both frontend and backend now use the same logic:

1. **Get current time in Budapest:**
   ```typescript
   const now = new Date();
   const budapestTime = now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' });
   const hungarianNow = new Date(budapestTime);
   ```

2. **Compare dates:**
   - Dates are compared at midnight (00:00:00)
   - Time slots are compared by hour
   - All comparisons use Budapest time

3. **Mark slots as unavailable:**
   - If the selected date is before today (Budapest time): ALL slots unavailable
   - If the selected date is today (Budapest time): Past slots unavailable, future slots available

### Example Scenarios

#### Scenario 1: User in New York (EDT, -4 hours from UTC)
- Time in New York: 10:00 AM
- Time in Budapest: 4:00 PM
- Backend checks: "Is it past 4 PM in Budapest?" → Slots until 4 PM are unavailable

#### Scenario 2: User in Tokyo (JST, +9 hours from UTC)
- Time in Tokyo: 11:00 PM
- Time in Budapest: 4:00 PM
- Backend checks: "Is it past 4 PM in Budapest?" → Same result as Scenario 1

#### Scenario 3: Vercel Server in US-East
- Server time: 10:00 AM EDT
- Code calculates: Budapest time is 4:00 PM
- Backend marks slots correctly based on Budapest time

## Benefits

1. **Consistency**: All users see the same availability regardless of their location
2. **Correctness**: Slots are marked unavailable based on Budapest time, not user's local time
3. **Business Logic**: Opening hours (8 AM - 8 PM) are in Budapest time
4. **No Confusion**: Staff and customers see the same schedule

## Testing

To test the timezone implementation:

1. **Change your system time** to different timezones
2. **Open the booking page** 
3. **Verify** that:
   - "Today" button shows current date in Budapest
   - Past time slots (in Budapest) are marked unavailable
   - Future time slots (in Budapest) are available
   - The current hour line matches Budapest time

## Configuration

The timezone is configured in:
- `backend/src/config/index.ts`:
  ```typescript
  timezone: 'Europe/Budapest'
  ```

- Used throughout the application via utility functions

## Important Notes

1. **No Database Changes**: The database stores dates/times as they are. The timezone conversion happens in application logic.

2. **ISO Format**: When sending dates to the API, use ISO format (`YYYY-MM-DD`), which is timezone-agnostic.

3. **Display**: Dates are displayed in the user's locale format, but calculations use Budapest time.

4. **DST (Daylight Saving Time)**: JavaScript's `Intl` API automatically handles DST transitions for Europe/Budapest timezone.

## Future Improvements

If you want to support multiple studios in different timezones in the future:

1. Add `timezone` field to the `rooms` table
2. Pass timezone parameter to availability functions
3. Calculate availability per studio's timezone
4. Display times with timezone indicator (e.g., "14:00 CET")

## Migration Notes

This change is **backward compatible**:
- Existing bookings are not affected
- Database schema unchanged
- API contracts unchanged
- Only the availability calculation logic changed

No data migration required.

## Deployment

After deploying this update:

1. **Backend**: Redeploy to Vercel (timezone logic is server-side)
2. **Frontend**: Redeploy to Vercel (timezone logic is client-side)
3. **Test**: Verify booking page shows correct availability
4. **Monitor**: Check Vercel logs for any timezone-related errors

The changes will take effect immediately after deployment.

