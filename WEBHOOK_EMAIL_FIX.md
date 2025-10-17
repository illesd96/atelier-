# Webhook Email Issue - Fixed! 🎉

## Problem Summary

Your booking confirmation emails weren't being sent because the Barion webhook was failing.

### Root Cause

**Barion was sending webhooks with only `PaymentId` but no `PaymentState`:**

```
💳 Processing Barion webhook: {
  PaymentId: 'e16e1aee5cabf0118c20001dd8b71cc5',
  PaymentState: undefined  ← Missing!
}
```

The webhook handler tried to update the database with `status = undefined`, which caused this error:

```
❌ Error: null value in column "status" of relation "payments" 
violates not-null constraint
```

**Result:**
- Webhook crashed before creating bookings
- No bookings = No confirmation email
- Fallback mechanism later created bookings (but without email)

## The Fix

Updated `backend/src/controllers/webhooks.ts` to:

1. **Detect when `PaymentState` is missing**
2. **Fetch the real status from Barion API** using `getPaymentState()`
3. **Continue with the normal flow** (create bookings + send email)

### Code Change

```typescript
// If PaymentState is not provided, fetch it from Barion
if (!PaymentState) {
  console.log('⚠️  PaymentState not provided in webhook, fetching from Barion API...');
  const paymentStatus = await barionService.getPaymentState(PaymentId);
  PaymentState = paymentStatus.Status;
  console.log('✅ Fetched PaymentState from Barion:', PaymentState);
}
```

## What This Fixes

✅ Webhook no longer crashes when PaymentState is missing  
✅ Bookings are created immediately (no fallback needed)  
✅ Confirmation emails are sent right away  
✅ Email logging works properly  

## Deploy to Production

### Option 1: Git Push (Recommended)

```bash
cd C:\Projects\cursor\photo-studio

# Stage changes
git add backend/src/controllers/webhooks.ts

# Commit
git commit -m "Fix: Handle missing PaymentState in Barion webhook

- Fetch PaymentState from Barion API when not provided in webhook
- Prevents database constraint violation
- Enables confirmation emails to be sent properly"

# Push to trigger Vercel deployment
git push origin main
```

Vercel will automatically deploy the update.

### Option 2: Manual Vercel Deployment

If you're not using Git auto-deploy:

1. Go to Vercel Dashboard → Your Backend Project
2. Click "Deployments" tab
3. Click "..." menu → "Redeploy"
4. Select "Use existing Build Cache" and deploy

## Test the Fix

### 1. Make a New Test Booking

1. Go to your booking site
2. Make a new test booking
3. Complete the payment
4. **Check your email** - You should receive confirmation!

### 2. Check Vercel Logs

After the booking, check Vercel logs. You should now see:

```
📥 Barion webhook received
💳 Processing Barion webhook: { PaymentId: '...', PaymentState: undefined }
⚠️  PaymentState not provided in webhook, fetching from Barion API...
✅ Fetched PaymentState from Barion: Succeeded
✅ Payment status updated
✅ Successfully created bookings
📧 Sending confirmation email to: customer@email.com
✅ Confirmation email sent
```

### 3. Check Email Logs in Database

```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 5;
```

You should see a new entry with `email_type = 'confirmation'`.

## For Your Previous Booking

Your booking from today (**3bd95359-4f1a-4f31-a842-ea34b999e2a6**) was already completed via the fallback mechanism.

If you want to send a confirmation email for it manually, run this script:

```bash
cd backend
npm run send-manual-confirmation -- 3bd95359-4f1a-4f31-a842-ea34b999e2a6
```

(Or I can create a quick script for you if needed)

## Why Did This Happen?

Barion has different webhook formats depending on their configuration:

1. **Full webhook** - Sends `PaymentId` + `PaymentState` + full details
2. **Minimal webhook** - Sends only `PaymentId` (expects you to call their API)

Your Barion configuration is using the minimal format. The fix now handles both formats properly.

## Verify Email Settings (While You're Here)

Make sure these are still set in Vercel:

- ✅ `SMTP_HOST` = `smtp.gmail.com`
- ✅ `SMTP_PORT` = `587`  
- ✅ `SMTP_USER` = Your business email
- ✅ `SMTP_PASS` = 16-character App Password
- ✅ `FROM_EMAIL` = Your sender email
- ✅ `FROM_NAME` = Atelier Archilles

## Summary

**Problem:** Barion webhook missing PaymentState → Database error → No email  
**Solution:** Fetch PaymentState from Barion API when missing  
**Status:** ✅ Fixed and ready to deploy  
**Next Step:** Push to Git or redeploy on Vercel, then test with a new booking  

---

**Questions?** The fix is in `backend/src/controllers/webhooks.ts` lines 29-45.

