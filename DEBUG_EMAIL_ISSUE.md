# Debugging Email Not Sent Issue

## Check 1: Order Status

Run this SQL to check if your order was marked as 'paid':

```sql
-- Check recent orders
SELECT 
  id, 
  status, 
  email, 
  customer_name,
  created_at,
  updated_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected**: Status should be `paid` if payment succeeded.

**If status is 'pending'**: The Barion webhook never ran or failed.

## Check 2: Check Order Items Status

```sql
-- Check if bookings were created
SELECT 
  oi.id,
  oi.order_id,
  oi.status,
  oi.booking_date,
  oi.start_time,
  r.name as room_name,
  o.status as order_status
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN rooms r ON r.id = oi.room_id
ORDER BY oi.created_at DESC
LIMIT 10;
```

**Expected**: order_items.status should be `booked` and orders.status should be `paid`.

## Check 3: Check Backend Logs

### On Vercel:
1. Go to: https://vercel.com/dashboard
2. Select your backend project
3. Click "Logs" tab
4. Look for:
   - `📧 Sending confirmation email to:`
   - `Error sending confirmation email:`
   - `📥 Barion webhook received:`

### Locally (if running dev server):
Check your terminal for the same log messages.

## Check 4: Test Email Service Connection

Run this command in your backend directory:

```bash
npm run dev
```

Look for this message in the logs:
- ✅ `Email service connection verified` - Good!
- ❌ `Email service connection failed` - Email not configured

## Check 5: Verify Environment Variables

### Local (.env file):
```bash
cd backend
cat .env | grep SMTP
```

Should show:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@domain.com
FROM_NAME=Atelier Archilles
```

### Vercel:
1. Go to: Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Verify these exist:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `FROM_EMAIL`
   - `FROM_NAME`

## Common Issues & Solutions

### Issue 1: Order Status is 'pending'

**Cause**: Barion webhook not triggered or failed.

**Solution**:
1. Check Barion webhook is configured correctly
2. Check backend logs for webhook errors
3. Verify webhook URL in Barion settings

### Issue 2: Email Service Not Configured

**Cause**: Missing or incorrect SMTP credentials.

**Check**:
```bash
# In backend directory
npm run dev
```

Look for: `❌ Email service connection failed`

**Solution**:
1. Generate Google App Password: https://myaccount.google.com/apppasswords
2. Add to Vercel environment variables
3. Redeploy backend

### Issue 3: Webhook Runs But Email Fails

**Check backend logs for**:
```
✅ Successfully created bookings
📧 Sending confirmation email to: customer@email.com
❌ Error sending confirmation email: [error details]
```

**Common Errors**:

1. **"Invalid login"**
   - Wrong App Password
   - Using regular password instead of App Password
   - 2-Step Verification not enabled

2. **"Connection timeout"**
   - Wrong SMTP_HOST or SMTP_PORT
   - Firewall blocking SMTP

3. **"Recipient rejected"**
   - Invalid email address

### Issue 4: Email Logs Table Missing

**Cause**: Migration not applied.

**Solution**:
```sql
-- Apply migration
\i backend/src/database/migrations/005-add-email-logs.sql
```

Or copy-paste the SQL from that file.

## Manual Email Test

If you want to manually trigger an email for an existing order:

```typescript
// In backend console or create a test script
import emailService from './src/services/email';
import pool from './src/database/connection';

async function testEmail() {
  const orderId = 'your-order-id'; // Get from orders table
  
  // Get order
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderResult.rows[0];
  
  // Get items
  const itemsResult = await pool.query(`
    SELECT oi.*, r.name as room_name
    FROM order_items oi
    LEFT JOIN rooms r ON r.id = oi.room_id
    WHERE oi.order_id = $1
  `, [orderId]);
  const items = itemsResult.rows;
  
  // Send email
  const calendarFile = Buffer.from(
    emailService.generateCalendarFile(order, items),
    'utf-8'
  );
  
  await emailService.sendBookingConfirmation(order, items, calendarFile);
  console.log('Email sent!');
}

testEmail();
```

## Quick Diagnostic SQL

Run this to get a complete picture:

```sql
-- Complete diagnostic query
WITH recent_order AS (
  SELECT * FROM orders ORDER BY created_at DESC LIMIT 1
)
SELECT 
  'Order Info' as check_type,
  json_build_object(
    'id', o.id,
    'status', o.status,
    'email', o.email,
    'created', o.created_at,
    'updated', o.updated_at
  ) as details
FROM recent_order o

UNION ALL

SELECT 
  'Order Items',
  json_agg(json_build_object(
    'id', oi.id,
    'status', oi.status,
    'date', oi.booking_date,
    'time', to_char(oi.start_time, 'HH24:MI')
  ))
FROM order_items oi, recent_order o
WHERE oi.order_id = o.id

UNION ALL

SELECT 
  'Email Logs',
  COALESCE(
    json_agg(json_build_object(
      'type', el.email_type,
      'sent_at', el.sent_at
    )),
    '[]'::json
  )
FROM email_logs el, recent_order o
WHERE el.order_id = o.id;
```

## Next Steps

1. **Run Check 1 & 2** (SQL queries above) and share the results
2. **Check backend logs** for any errors
3. **Verify email service connection** with `npm run dev`
4. **Check environment variables** are set correctly

Once you share the results, I can help pinpoint the exact issue!

