# Email Automation Quick Start Guide

## 🚀 What's Been Added

Your booking system now includes automated email notifications:

1. ✅ **Booking Confirmation** - Sent immediately after successful payment
2. ⏰ **24-Hour Reminder** - Sent daily at 9:00 AM for bookings happening tomorrow
3. ❌ **Cancellation Notice** - Sent when bookings are cancelled
4. ⚠️ **Payment Failed** - Sent when payments fail

## 📋 Setup Checklist

### 1. Get Google App Password (5 minutes)

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google Business email
3. Create App Password:
   - App: **Mail**
   - Device: **Other (Photo Studio Backend)**
4. Copy the 16-character password

### 2. Configure Environment Variables

**Local Development** (`backend/.env`):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@yourdomain.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Atelier Archilles
```

**Vercel Production**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = your business email
   - `SMTP_PASS` = App Password (16 characters)
   - `FROM_EMAIL` = your sender email
   - `FROM_NAME` = Atelier Archilles
   - `CRON_SECRET` = Generate a random secret (e.g., `openssl rand -base64 32`)

3. Redeploy backend

### 3. Apply Database Migration

Run this SQL migration to create the email logs table:

```bash
# Using your PostgreSQL client
psql -h your-database-host -U username -d photo_studio -f backend/src/database/migrations/005-add-email-logs.sql
```

Or in your database console:
```sql
-- Copy and run the contents of backend/src/database/migrations/005-add-email-logs.sql
```

### 4. Test Email Service

**Local Testing**:
```bash
cd backend
npm run dev
```

Look for:
```
✅ Email service connection verified
```

**Make a test booking** to verify confirmation email arrives.

### 5. Test Reminder Email

Create a booking for tomorrow, then:

```bash
cd backend
npm run send-reminders
```

Expected output:
```
📧 Found 1 booking(s) that need reminders.
✅ Reminder sent successfully to customer@email.com
```

### 6. Verify Automated Reminders

**On Vercel** (Automatic):
- Vercel Cron will automatically call `/api/cron/send-reminders` daily at 9:00 AM
- No additional setup needed!
- Check logs in Vercel Dashboard → Your Project → Logs

**On Your Own Server**:
The scheduler runs automatically when `NODE_ENV=production`.

## 🧪 Testing

### Test Email Templates

All templates are in `backend/src/templates/emails/`:
- `confirmation.html` - Booking confirmation
- `reminder.html` - 24h reminder
- `cancellation.html` - Cancellation notice
- `payment-failed.html` - Payment failure

### Manual Reminder Test

```bash
# Development
npm run send-reminders

# Production
npm run send-reminders:prod
```

### Check Email Logs

```sql
SELECT 
  order_id,
  email_type,
  booking_date,
  sent_at
FROM email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

## 🔧 Customization

### Change Reminder Time

Edit `backend/src/services/scheduler.ts`:

```typescript
// Current: 9:00 AM daily
const reminderJob = cron.schedule('0 9 * * *', async () => {

// Change to 10:00 AM:
const reminderJob = cron.schedule('0 10 * * *', async () => {
```

Cron format: `minute hour day month weekday`

### Change Reminder Timing (days before)

Edit `backend/src/services/email.ts`, line ~330:

```typescript
// Current: 1 day before
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Change to 2 days before:
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
```

### Customize Email Content

Edit HTML files in `backend/src/templates/emails/`

Use Handlebars syntax for dynamic content:
- `{{customerName}}` - Customer's name
- `{{bookingCode}}` - Booking code
- `{{items}}` - List of bookings
- `{{isHungarian}}` - Boolean for language

## 🚨 Troubleshooting

### Email service connection failed

**Problem**: Authentication error

**Solution**:
1. Verify you're using App Password (not regular password)
2. Enable 2-Step Verification on Google account
3. Generate new App Password
4. Check `SMTP_USER` is complete email address

### Emails not arriving

**Check**:
1. Spam folder
2. Email logs in database: `SELECT * FROM email_logs`
3. Server logs for errors
4. Gmail sending limits (2000/day for Business, 500/day for regular)

### Reminders not sending automatically

**Verify**:
1. `NODE_ENV=production` in Vercel
2. Vercel Cron is configured in `backend/vercel.json`
3. `CRON_SECRET` environment variable is set
4. Check Vercel logs for cron execution

### "Less secure app" error

**Solution**: Use App Password (this bypasses the warning)

## 📊 Monitoring

### View Email Logs

```sql
-- All emails sent today
SELECT * FROM email_logs 
WHERE sent_at::date = CURRENT_DATE
ORDER BY sent_at DESC;

-- Reminders sent this week
SELECT * FROM email_logs 
WHERE email_type = 'reminder' 
AND sent_at > NOW() - INTERVAL '7 days'
ORDER BY sent_at DESC;

-- Failed emails (no log entry for confirmed bookings)
SELECT o.id, o.email, o.created_at
FROM orders o
WHERE o.status = 'paid'
AND NOT EXISTS (
  SELECT 1 FROM email_logs el 
  WHERE el.order_id = o.id 
  AND el.email_type = 'confirmation'
);
```

### Vercel Logs

1. Go to Vercel Dashboard
2. Select your backend project
3. Click "Logs"
4. Filter for "cron" or "reminder"

## 📁 Files Added/Modified

### New Files
- `backend/src/templates/emails/reminder.html` - Reminder email template
- `backend/src/scripts/send-reminders.ts` - Script to send reminders
- `backend/src/services/scheduler.ts` - Automated job scheduler
- `backend/src/database/migrations/005-add-email-logs.sql` - Email logs table
- `GOOGLE_EMAIL_SETUP.md` - Detailed setup guide
- `EMAIL_AUTOMATION_QUICKSTART.md` - This file

### Modified Files
- `backend/src/services/email.ts` - Added reminder functionality
- `backend/src/controllers/webhooks.ts` - Log confirmation emails
- `backend/src/routes/index.ts` - Added cron endpoint
- `backend/src/server.ts` - Start scheduler, test email connection
- `backend/package.json` - Added npm scripts
- `backend/vercel.json` - Added Vercel Cron configuration
- `backend/env.example` - Updated with email variables

## 📖 Documentation

For detailed setup instructions, see:
- **GOOGLE_EMAIL_SETUP.md** - Complete Google Business email setup
- **Code comments** - Implementation details in service files

## ✅ Final Checklist

- [ ] Google App Password generated
- [ ] Environment variables configured (local & production)
- [ ] Database migration applied
- [ ] Email service connection tested
- [ ] Confirmation email tested (make a booking)
- [ ] Reminder email tested (`npm run send-reminders`)
- [ ] Vercel Cron configured (automatic)
- [ ] Email logs monitored
- [ ] Templates customized (optional)

---

**Need Help?** Check `GOOGLE_EMAIL_SETUP.md` for troubleshooting and detailed configuration.

**Questions about implementation?** Review the code in:
- `backend/src/services/email.ts`
- `backend/src/services/scheduler.ts`
- `backend/src/scripts/send-reminders.ts`

