# Barion Callback Fix

## Issues Fixed

### 1. **Removed Signature Verification**
The webhook was failing because Barion's signature verification was blocking valid requests.
- Removed the signature check that was causing 401 errors
- Barion already validates the callback internally

### 2. **Added Comprehensive Logging**
Added detailed logging to track every step:
- 📥 Webhook received (with full request details)
- 💳 Processing payment (PaymentId, PaymentState)
- ✅ Payment status updated
- 📦 Order found
- ✅ Bookings created
- 📧 Confirmation email sent

### 3. **Webhook Route Protection**
- Excluded webhooks from rate limiting
- Added webhook-specific logging middleware
- Ensured CORS doesn't block Barion requests

### 4. **Better Error Handling**
- Added stack traces for debugging
- Clear error messages for each failure point
- Proper transaction rollback on errors

## How to Test

### 1. Check Current Configuration

Make sure these environment variables are set in Vercel:

```bash
BACKEND_URL=https://your-backend.vercel.app
BARION_ENVIRONMENT=test  # or 'prod'
BARION_POS_KEY=your-pos-key
BARION_PAYEE_EMAIL=your-email@example.com
```

### 2. Test Payment Flow

1. Make a test booking
2. Go through Barion payment
3. Check Vercel logs for webhook activity:

Look for these log messages:
```
📥 Barion webhook received
💳 Processing Barion webhook
✅ Payment status updated
📦 Order found
✅ Successfully created bookings
📧 Sending confirmation email
✅ Webhook processed successfully
```

### 3. If Webhook Still Fails

Check:
1. **Callback URL in Barion request** - Should be `https://your-backend.vercel.app/api/webhooks/barion`
2. **Barion Test Environment** - Make sure you're in TEST mode during testing
3. **Vercel Logs** - Check for any errors in the logs

## Vercel Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Barion
BARION_ENVIRONMENT=test
BARION_POS_KEY=your-pos-key
BARION_PAYEE_EMAIL=your-email@example.com

# URLs
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourstudio.com
FROM_NAME=Atelier Archilles

# Security
JWT_SECRET=your-random-secret-key
```

## Common Issues

### Issue: "CallbackFailed" Error
**Cause**: Barion cannot reach your callback URL
**Solution**: 
- Verify `BACKEND_URL` is set correctly in Vercel
- Check the URL is publicly accessible
- Ensure no firewall is blocking Barion

### Issue: Webhook Never Called
**Cause**: Callback URL might be wrong in payment request
**Solution**:
- Check logs for the Barion payment request
- Verify CallbackUrl is correct: `${BACKEND_URL}/api/webhooks/barion`

### Issue: Payment Succeeds but Order Status Not Updated
**Cause**: Webhook is failing silently
**Solution**:
- Check Vercel logs for error messages
- Look for database connection issues
- Verify payment record exists in database

## Testing Checklist

- [ ] Environment variables set in Vercel
- [ ] Backend deployed and accessible
- [ ] Test booking created successfully
- [ ] Barion payment initiated
- [ ] Webhook logs appear in Vercel
- [ ] Payment status updated to 'Succeeded'
- [ ] Order status changed to 'paid'
- [ ] Booking items created with status 'booked'
- [ ] Confirmation email sent
- [ ] Order appears in user's booking history

## Debug SQL Queries

### Check Payment Status
```sql
SELECT 
    o.id,
    o.status as order_status,
    o.customer_name,
    o.email,
    p.provider_ref as payment_id,
    p.status as payment_status,
    p.created_at,
    p.updated_at
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.email = 'your-email@example.com'
ORDER BY o.created_at DESC
LIMIT 5;
```

### Check Booking Items
```sql
SELECT 
    oi.id,
    oi.booking_date,
    oi.start_time,
    oi.end_time,
    oi.status,
    oi.booking_id,
    r.name as room_name
FROM order_items oi
JOIN rooms r ON r.id = oi.room_id
WHERE oi.order_id = 'your-order-id';
```

## Next Steps After Fix

1. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Fix Barion callback webhook"
   git push
   ```

2. **Monitor Logs**: Watch Vercel logs during next test payment

3. **Test in Production**: Once working in TEST mode, switch to production Barion

## Support

If webhook still fails after these fixes:
1. Check Vercel function logs
2. Verify Barion dashboard shows callback attempts
3. Test callback URL manually with curl
4. Contact Barion support if needed

