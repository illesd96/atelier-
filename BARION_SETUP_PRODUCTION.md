# Fix Barion Payment Error in Production

## ❌ Current Error
```
{error: "Internal server error", message: "Failed to create payment in Barion"}
```

This means your **Barion API credentials are missing or invalid** in your Vercel production environment.

## ✅ Solution: Configure Barion in Vercel

### Step 1: Get Your Barion Credentials

1. **Login to Barion**
   - Test environment: https://secure.test.barion.com/
   - Production: https://secure.barion.com/

2. **Get your POS Key**
   - Go to: My shops → Select your shop
   - Copy the **POSKey** (long alphanumeric string)

3. **Get your Pixel ID** (optional, for analytics)
   - Settings → Barion Pixel
   - Copy the Pixel ID

### Step 2: Configure Environment Variables in Vercel

#### **Option A: Via Vercel Dashboard** (Recommended)

1. Go to: https://vercel.com/your-project
2. Click on **Settings** tab
3. Click on **Environment Variables** (left sidebar)
4. Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `BARION_ENVIRONMENT` | `test` (for testing) or `prod` (for live) | Production, Preview, Development |
| `BARION_POS_KEY` | Your POSKey from Barion | Production, Preview, Development |
| `BARION_PIXEL_ID` | Your Pixel ID (optional) | Production, Preview, Development |

5. Click **Save**
6. **Redeploy your application** (Settings → Deployments → latest deployment → Redeploy)

#### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Set environment variables
vercel env add BARION_ENVIRONMENT
# Enter: test (or prod when ready for production)

vercel env add BARION_POS_KEY
# Paste your POSKey from Barion

vercel env add BARION_PIXEL_ID
# Paste your Pixel ID (optional)
```

### Step 3: Required Environment Variables for Backend

Make sure ALL these are set in Vercel for your **backend project**:

```env
# Database
DATABASE_URL=your_neon_database_url

# Barion Payment (REQUIRED)
BARION_ENVIRONMENT=test
BARION_POS_KEY=your_barion_pos_key_here

# Security (REQUIRED)
JWT_SECRET=your_secure_random_string_here
WEBHOOK_SECRET=your_webhook_secret_here

# Email (for sending confirmations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@atelierarchilles.com
FROM_NAME=Atelier Archilles

# Frontend URL
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 4: Test Barion Configuration

After setting the environment variables and redeploying:

1. **Go to your site**
2. **Add items to cart**
3. **Proceed to checkout**
4. **Fill the form** and submit

You should be redirected to Barion's payment page.

### Step 5: Using Barion Test Environment

#### Test Cards for Barion TEST Environment

When `BARION_ENVIRONMENT=test`, use these test cards:

**Successful Payment:**
- Card number: `5559 0140 0000 0009`
- Expiry: Any future date
- CVC: Any 3 digits
- Cardholder: Any name

**Failed Payment:**
- Card number: `5559 0140 0000 0017`

**Test Bank Transfer:**
- Use username: `user01@example.com`
- Password: `Pass1234`

### Step 6: Verify Backend Logs

After redeploying, check your Vercel backend logs:

1. Go to Vercel → Your backend project
2. Click on **Deployments** → Latest deployment
3. Click on **View Function Logs**
4. Look for Barion-related logs when you try to checkout

You should see:
```
🔵 Barion Payment Request: { ... }
✅ Barion Response: { ... }
```

If you see:
```
❌ Error creating Barion payment
🔴 Barion Error Response: { ... }
```

This indicates an issue with your Barion credentials or request format.

## 🚨 Common Issues

### 1. "Invalid POSKey"
- ❌ Wrong POSKey entered
- ❌ Using production POSKey with test environment (or vice versa)
- ✅ Make sure `BARION_ENVIRONMENT` matches your POSKey type

### 2. "Unauthorized"
- ❌ POSKey not set in Vercel
- ✅ Add `BARION_POS_KEY` environment variable in Vercel

### 3. "Payment already exists"
- ❌ Using the same PaymentRequestId
- ✅ Clear test data or use different order IDs

### 4. Environment variables not loading
- ❌ Forgot to redeploy after adding variables
- ✅ Always redeploy after adding/changing environment variables

## 📝 Quick Checklist

- [ ] Barion account created (test or production)
- [ ] POSKey obtained from Barion dashboard
- [ ] `BARION_ENVIRONMENT` set in Vercel (test or prod)
- [ ] `BARION_POS_KEY` set in Vercel
- [ ] Backend redeployed after adding variables
- [ ] Test checkout flow works
- [ ] Check Vercel logs for errors

## 🔗 Useful Links

- **Barion Test Environment:** https://secure.test.barion.com/
- **Barion Production:** https://secure.barion.com/
- **Barion API Docs:** https://docs.barion.com/
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

Once you've set up these environment variables and redeployed, the payment should work! 🎉

