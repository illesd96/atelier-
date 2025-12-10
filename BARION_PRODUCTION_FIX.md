# Barion Production Configuration Fix

## Problem

Checkout is failing with error: `"Failed to create payment in Barion"`

This is caused by missing or incorrect Barion environment variables in Vercel production.

## Required Environment Variables

You need to set these in **Vercel → Backend Project → Settings → Environment Variables**:

### 1. BARION_POS_KEY
Your Barion Point of Sale key (get from Barion dashboard)

**How to get it:**
1. Go to [Barion Dashboard](https://secure.barion.com/)
2. Login to your account
3. Go to **My Shops** → Select your shop
4. Copy the **POS Key** (long string of characters)

**Test Environment:**
- Use test POS key for testing
- URL: [https://secure.test.barion.com/](https://secure.test.barion.com/)

**Production Environment:**
- Use production POS key for live payments
- URL: [https://secure.barion.com/](https://secure.barion.com/)

### 2. BARION_ENVIRONMENT
Set to `test` or `prod`

**Values:**
- `test` - Use Barion test environment (recommended for development)
- `prod` - Use Barion production environment (for live payments)

### 3. BARION_PAYEE_EMAIL
Your Barion account email address

**Example:** `your-business-email@example.com`

This must be the email address associated with your Barion account.

### 4. BARION_PIXEL_ID (Optional)
Your Barion Pixel ID for tracking (if you have one)

### 5. FRONTEND_URL
Your frontend URL (where users are redirected after payment)

**Production:** `https://www.atelier-archilles.hu`  
**Preview:** `https://atelier-frontend-mu.vercel.app`

### 6. BACKEND_URL
Your backend URL (for Barion webhook callbacks)

**Production:** `https://atelier-backend-ivory.vercel.app`

## Step-by-Step Setup in Vercel

### Step 1: Go to Vercel Backend Project

1. Open [Vercel Dashboard](https://vercel.com)
2. Select your **backend project** (`atelier-backend-ivory`)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add each variable with the appropriate value:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `BARION_ENVIRONMENT` | `test` (or `prod`) | Production, Preview, Development |
| `BARION_POS_KEY` | Your POS key from Barion | Production, Preview, Development |
| `BARION_PAYEE_EMAIL` | Your Barion email | Production, Preview, Development |
| `BARION_PIXEL_ID` | Your pixel ID (optional) | Production, Preview, Development |
| `FRONTEND_URL` | `https://www.atelier-archilles.hu` | Production |
| `FRONTEND_URL` | `https://atelier-frontend-mu.vercel.app` | Preview |
| `BACKEND_URL` | `https://atelier-backend-ivory.vercel.app` | Production, Preview |

**Important:** Check all three boxes (Production, Preview, Development) for each variable.

### Step 3: Redeploy Backend

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Select **"Use existing Build Cache: No"**
5. Click **"Redeploy"**

## Verification

### Check Environment Variables are Set

After redeployment, check the Vercel logs:

1. Go to **Deployments** → Select latest deployment
2. Click on **"View Function Logs"** or **"Runtime Logs"**
3. Look for these log messages when you make a checkout:

```
🔧 Barion Configuration: {
  environment: 'test',
  baseUrl: 'https://api.test.barion.com',
  posKey: 'xxxxxxxxxx...',
  payeeEmail: 'your-email@example.com',
  frontendUrl: 'https://www.atelier-archilles.hu',
  backendUrl: 'https://atelier-backend-ivory.vercel.app'
}
```

### Test Checkout

1. Go to your website: `https://www.atelier-archilles.hu/booking`
2. Add items to cart
3. Proceed to checkout
4. Fill out the form
5. Click "Proceed to Payment"

**Expected result:**
- Should redirect to Barion payment page
- No errors in console

**If you see errors:**
- Check Vercel logs for details
- Verify all environment variables are set correctly
- Make sure POS key is valid

## Test Payment in Barion Test Environment

When using `BARION_ENVIRONMENT=test`, you can use these test cards:

### Successful Payment
- **Card Number:** `9999-9999-9999-9990`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **Name:** Any name

### Failed Payment
- **Card Number:** `9999-9999-9999-9991`
- **Expiry:** Any future date
- **CVC:** Any 3 digits

## Common Errors and Solutions

### Error: "Barion POS Key is not configured"

**Solution:** 
- Add `BARION_POS_KEY` in Vercel environment variables
- Make sure it's added to "Production" environment
- Redeploy

### Error: "Barion Payee Email is not configured"

**Solution:**
- Add `BARION_PAYEE_EMAIL` in Vercel environment variables
- Use the email address associated with your Barion account
- Redeploy

### Error: "Invalid POS Key"

**Solution:**
- Double-check your POS key from Barion dashboard
- Make sure there are no extra spaces
- Verify you're using the correct environment (test vs prod) key

### Error: "Invalid Payee"

**Solution:**
- Make sure `BARION_PAYEE_EMAIL` matches your Barion account email exactly
- Check for typos

### Error: "Invalid CallbackUrl"

**Solution:**
- Make sure `BACKEND_URL` is set correctly
- Should be: `https://atelier-backend-ivory.vercel.app`
- No trailing slash

## Barion Dashboard URLs

### Test Environment
- **Dashboard:** https://secure.test.barion.com/
- **API:** https://api.test.barion.com
- **Docs:** https://docs.barion.com/

### Production Environment
- **Dashboard:** https://secure.barion.com/
- **API:** https://api.barion.com

## Code Changes Made

### 1. Added `BARION_PAYEE_EMAIL` to config
```typescript
// backend/src/config/index.ts
barion: {
  // ...
  payeeEmail: process.env.BARION_PAYEE_EMAIL || '',
}
```

### 2. Added `BACKEND_URL` to config
```typescript
// backend/src/config/index.ts
backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
```

### 3. Fixed Barion payment request
```typescript
// backend/src/services/barion.ts
Transactions: [{
  Payee: config.barion.payeeEmail, // ✅ Now uses email instead of POS key
  // ...
}],
CallbackUrl: `${config.backendUrl}/api/webhooks/barion`, // ✅ Now uses backend URL
```

### 4. Added validation
```typescript
// backend/src/services/barion.ts
if (!config.barion.posKey) {
  throw new Error('Barion POS Key is not configured');
}

if (!config.barion.payeeEmail) {
  throw new Error('Barion Payee Email is not configured');
}
```

## Testing Checklist

- [ ] All Barion environment variables set in Vercel
- [ ] Backend redeployed after adding variables
- [ ] Frontend deployed (to use the fixed code)
- [ ] Can access booking page
- [ ] Can add items to cart
- [ ] Can fill checkout form
- [ ] Gets redirected to Barion payment page (not error)
- [ ] Can complete test payment with test card
- [ ] Redirected back to success page after payment

## Next Steps

1. **Set environment variables in Vercel** (see Step 2 above)
2. **Redeploy backend**
3. **Test checkout** with test card
4. **Switch to production** when ready:
   - Change `BARION_ENVIRONMENT` to `prod`
   - Use production POS key
   - Test with real card (small amount)

## Support

If you still have issues:
1. Check Vercel logs for detailed error messages
2. Verify Barion account is active
3. Make sure you've completed Barion account verification
4. Contact Barion support if API issues persist







