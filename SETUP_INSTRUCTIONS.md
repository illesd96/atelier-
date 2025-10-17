# 🚀 Email Automation Setup Instructions

## What's New

Your booking system now has **fully automated email notifications** using your Google Business email:

✅ **Booking Confirmation** - Sent immediately after payment  
⏰ **24-Hour Reminder** - Sent daily at 9 AM for tomorrow's bookings  
❌ **Cancellation Notice** - Sent when bookings are cancelled  
⚠️ **Payment Failed** - Sent when payment fails

## 🎯 Quick Setup (3 Steps)

### Step 1: Get Google App Password (5 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Google Business email
3. If prompted, enable 2-Step Verification first
4. Create App Password:
   - App: **Mail**
   - Device: **Photo Studio**
5. **Copy the 16-character password** (you'll need it next)

### Step 2: Add to Vercel (5 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your **backend** project
3. Go to: Settings → Environment Variables
4. Add these variables:

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `your-business-email@yourdomain.com` |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` (the App Password) |
| `FROM_EMAIL` | `noreply@yourdomain.com` |
| `FROM_NAME` | `Atelier Archilles` |
| `CRON_SECRET` | Generate random string (see below) |

**Generate CRON_SECRET**:
```bash
# Option 1: Use OpenSSL (if available)
openssl rand -base64 32

# Option 2: Use online generator
# Visit: https://www.random.org/passwords/
```

5. **Redeploy** your backend (Vercel will auto-deploy after saving variables)

### Step 3: Apply Database Migration (2 minutes)

Connect to your database and run this SQL:

```sql
-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  booking_date DATE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_reminder_per_booking UNIQUE (order_id, email_type, booking_date)
);

CREATE INDEX IF NOT EXISTS idx_email_logs_order_type_date ON email_logs(order_id, email_type, booking_date);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
```

**Or** use the migration file:
```bash
psql -h your-host -U username -d photo_studio -f backend/src/database/migrations/005-add-email-logs.sql
```

## ✅ That's It!

Your email automation is now:
- ✅ Sending confirmation emails after bookings
- ✅ Sending reminder emails daily at 9 AM
- ✅ Logging all emails to prevent duplicates
- ✅ Running automatically via Vercel Cron

## 🧪 Test It

### Test Confirmation Email
1. Make a test booking on your site
2. Complete payment
3. Check your email (and spam folder)

### Test Reminder Email (Optional)
1. Create a booking for tomorrow
2. Wait until 9 AM tomorrow
3. Or manually trigger: `npm run send-reminders` in backend folder

## 📊 Monitor

### Check Email Logs
```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

### View Vercel Logs
1. Vercel Dashboard → Your Backend Project → Logs
2. Filter for "cron" or "reminder"

## 🔧 Customize (Optional)

### Change Reminder Time
Edit `backend/src/services/scheduler.ts` line 17:
```typescript
// Change from 9 AM to 10 AM:
const reminderJob = cron.schedule('0 10 * * *', async () => {
```

And `backend/vercel.json` line 22:
```json
"schedule": "0 10 * * *"
```

### Edit Email Templates
Templates are in: `backend/src/templates/emails/`
- `confirmation.html` - Booking confirmation
- `reminder.html` - 24h reminder
- `cancellation.html` - Cancellation
- `payment-failed.html` - Payment failure

## 📚 Documentation

- **EMAIL_AUTOMATION_QUICKSTART.md** - Quick reference guide
- **GOOGLE_EMAIL_SETUP.md** - Detailed setup with troubleshooting
- **EMAIL_AUTOMATION_IMPLEMENTATION.md** - Technical details

## 🚨 Troubleshooting

### "Email service connection failed"
- Verify you're using the **App Password** (not your regular password)
- Check `SMTP_USER` is your full email address
- Ensure 2-Step Verification is enabled

### "Emails not arriving"
- Check spam folder
- Verify email variables are set in Vercel
- Check Vercel logs for errors

### "Reminders not sending"
- Verify `NODE_ENV=production` in Vercel
- Check Vercel Cron is configured
- Verify `CRON_SECRET` is set

## ✅ Setup Checklist

- [ ] Google 2-Step Verification enabled
- [ ] App Password generated
- [ ] Vercel environment variables added
- [ ] Backend redeployed
- [ ] Database migration applied
- [ ] Test booking made
- [ ] Confirmation email received
- [ ] Email logs checked

---

**Need Help?** See `GOOGLE_EMAIL_SETUP.md` for detailed troubleshooting.

**Questions?** All code is documented in:
- `backend/src/services/email.ts`
- `backend/src/services/scheduler.ts`
- `backend/src/scripts/send-reminders.ts`

