# Google Business Email Setup Guide

This guide will help you set up automated email notifications using your Google Business (Google Workspace) email account.

## 📋 Overview

The system sends automated emails for:
- ✅ **Booking Confirmation** - Sent immediately after successful payment
- ⏰ **Reminder Emails** - Sent 24 hours before the booking date at 9:00 AM
- ❌ **Cancellation Confirmation** - Sent when a booking is cancelled
- ⚠️ **Payment Failed** - Sent when a payment fails

## 🔐 Step 1: Create Google App Password

For security reasons, you cannot use your regular Gmail password. You need to create an **App Password**.

### Prerequisites
- Google Workspace (Business) account OR Gmail with 2-Step Verification enabled
- Admin access to your Google account

### Create App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with your Google Business email

2. **Enable 2-Step Verification** (if not already enabled)
   - Navigate to: Security → 2-Step Verification
   - Follow the prompts to set it up

3. **Generate App Password**
   - Navigate to: Security → 2-Step Verification → App passwords
   - Or directly visit: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: `Photo Studio Backend`
   - Click **Generate**
   - **Copy the 16-character password** (you won't see it again!)

## ⚙️ Step 2: Configure Environment Variables

### Local Development (.env file)

Create or update your `backend/.env` file:

```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@yourdomain.com
SMTP_PASS=xxxx xxxx xxxx xxxx    # The 16-character App Password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Atelier Archilles
```

**Important Notes:**
- `SMTP_USER`: Your full Google Business email address
- `SMTP_PASS`: The 16-character App Password (spaces are optional)
- `FROM_EMAIL`: Can be the same as SMTP_USER or a noreply address
- `FROM_NAME`: Display name for emails

### Vercel Production Environment

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add the following variables:

| Variable | Value | Example |
|----------|-------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | smtp.gmail.com |
| `SMTP_PORT` | `587` | 587 |
| `SMTP_USER` | Your business email | info@atelierarchilles.com |
| `SMTP_PASS` | App Password | abcd efgh ijkl mnop |
| `FROM_EMAIL` | Sender email | noreply@atelierarchilles.com |
| `FROM_NAME` | Display name | Atelier Archilles |

4. Redeploy your backend after adding variables

## 🧪 Step 3: Test Email Service

### Test in Development

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console output:
   ```
   ✅ Email service connection verified
   ```

   If you see an error, check your credentials.

### Test Confirmation Email

Make a test booking and verify you receive the confirmation email.

### Test Reminder Email

1. Create a test booking for tomorrow's date
2. Run the reminder script manually:
   ```bash
   cd backend
   npm run send-reminders
   ```

3. Check the console output:
   ```
   📧 Found 1 booking(s) that need reminders.
   ✅ Reminder sent successfully to customer@email.com
   ```

## 🤖 Step 4: Set Up Automated Reminders

Reminder emails are automatically sent daily at 9:00 AM (Europe/Budapest timezone) for bookings happening the next day.

### In Production (Vercel)

The scheduler is automatically started when `NODE_ENV=production`.

**Using Vercel Cron Jobs** (Recommended):

1. Create `vercel.json` in your backend directory:
   ```json
   {
     "crons": [{
       "path": "/api/cron/send-reminders",
       "schedule": "0 9 * * *"
     }]
   }
   ```

2. Create a cron endpoint in `backend/src/routes/index.ts`:
   ```typescript
   // Cron endpoint for Vercel
   router.get('/cron/send-reminders', async (req, res) => {
     // Verify it's Vercel calling (using authorization header)
     const authHeader = req.headers.authorization;
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     try {
       await sendReminders();
       res.json({ success: true, message: 'Reminders sent' });
     } catch (error) {
       res.status(500).json({ error: 'Failed to send reminders' });
     }
   });
   ```

3. Add `CRON_SECRET` to Vercel environment variables

**Alternative: External Cron Service**

Use services like:
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Configure them to call your endpoint daily.

### On Your Own Server

If you're hosting on your own server, the built-in scheduler will work automatically.

You can also set up a system cron job:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9:00 AM)
0 9 * * * cd /path/to/photo-studio/backend && npm run send-reminders:prod >> /var/log/reminders.log 2>&1
```

## 📊 Step 5: Monitor Email Logs

### Check Database Logs

Email logs are stored in the `email_logs` table:

```sql
SELECT * FROM email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Check Server Logs

- **Vercel**: View logs in Vercel Dashboard → Your Project → Logs
- **Local**: Check console output

## 🚨 Troubleshooting

### "Invalid login" error

**Problem**: Authentication failed
**Solutions**:
1. Verify 2-Step Verification is enabled
2. Generate a new App Password
3. Ensure you're using the App Password, not your regular password
4. Check `SMTP_USER` is your full email address

### "Connection timeout" error

**Problem**: Cannot connect to Gmail SMTP server
**Solutions**:
1. Check your internet connection
2. Verify `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`
3. Check if your server's IP is blocked by Google
4. Try port `465` with `secure: true`

### Emails not being sent

**Problem**: No errors but emails don't arrive
**Solutions**:
1. Check spam folder
2. Verify email templates exist in `backend/src/templates/emails/`
3. Check database for email logs: `SELECT * FROM email_logs`
4. Review server logs for errors

### Reminders not sending automatically

**Problem**: Manual test works but automated reminders don't send
**Solutions**:
1. Verify `NODE_ENV=production` in Vercel
2. Check Vercel cron job is configured
3. Review cron job logs in Vercel dashboard
4. Verify database has bookings for tomorrow

### "Less secure app" warning

**Problem**: Google blocks sign-in
**Solution**: 
- Use App Passwords (which bypasses this)
- Do NOT enable "Less secure app access" (security risk)

## 🔒 Security Best Practices

1. **Never commit credentials** to Git
   - Use `.env` file (already in `.gitignore`)
   - Use Vercel environment variables for production

2. **Use App Passwords** instead of regular passwords
   - More secure
   - Can be revoked without changing your account password

3. **Rotate credentials** periodically
   - Generate new App Password every 6-12 months
   - Update Vercel environment variables

4. **Monitor email logs** for suspicious activity
   - Check `email_logs` table regularly
   - Set up alerts for failed sends

## 📧 Email Templates

Email templates are located in `backend/src/templates/emails/`:

- `confirmation.html` - Booking confirmation
- `reminder.html` - Reminder 24h before
- `cancellation.html` - Cancellation confirmation
- `payment-failed.html` - Payment failed notification

To customize:
1. Edit the HTML files
2. Use Handlebars syntax for dynamic content: `{{customerName}}`
3. Test by sending a test email
4. Rebuild backend: `npm run build`

## 🎨 Customization

### Change Reminder Time

Edit `backend/src/services/scheduler.ts`:

```typescript
// Send at 10:00 AM instead of 9:00 AM
const reminderJob = cron.schedule('0 10 * * *', async () => {
  // ...
});
```

Cron format: `minute hour day month weekday`
- `0 9 * * *` = 9:00 AM daily
- `0 18 * * *` = 6:00 PM daily
- `30 8 * * *` = 8:30 AM daily

### Send Reminders 2 Days Before

Edit `backend/src/services/email.ts`, method `getBookingsForReminder`:

```typescript
// Change from 1 day to 2 days
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2); // Changed from +1 to +2
```

### Add More Email Types

1. Create template in `backend/src/templates/emails/your-template.html`
2. Load template in `EmailService.loadTemplates()`
3. Create method `sendYourEmail()` in `EmailService`
4. Call method where needed

## 📞 Support

If you continue to have issues:

1. Check Google Workspace Admin Console
2. Verify email sending limits (Google Workspace: 2000/day, Gmail: 500/day)
3. Contact your IT administrator
4. Review [Google SMTP settings](https://support.google.com/a/answer/176600)

## ✅ Checklist

- [ ] Google 2-Step Verification enabled
- [ ] App Password generated
- [ ] Environment variables configured (local & Vercel)
- [ ] Email service connection tested
- [ ] Test booking confirmation received
- [ ] Reminder script tested manually
- [ ] Automated reminders configured (Vercel Cron or scheduler)
- [ ] Email logs monitored
- [ ] Database migration applied (`005-add-email-logs.sql`)

---

**Last Updated**: October 2024
**Questions?** Check `backend/src/services/email.ts` for implementation details.

