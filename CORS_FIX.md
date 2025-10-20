# CORS and Error Fixes Applied

## Issues Fixed

### 1. ✅ CORS Error - Custom Domain Blocked

**Problem:**
```
Access to XMLHttpRequest from 'https://www.atelier-archilles.hu' has been blocked by CORS policy
```

**Solution:**
Added your custom domains to the allowed origins in `backend/src/server.ts`:
- `https://www.atelier-archilles.hu`
- `https://atelier-archilles.hu` (without www)

**File Updated:** `backend/src/server.ts`

---

### 2. ✅ 500 Internal Server Error

**Problem:**
```
GET https://atelier-backend-ivory.vercel.app/api/availability?date=2025-10-20 net::ERR_FAILED 500
```

**Solution:**
- Added better error logging in `availability.ts` controller
- Enhanced error messages to help diagnose database issues
- The error might be related to database connection issues on Vercel

**File Updated:** `backend/src/controllers/availability.ts`

**Next Steps:**
You need to check your Vercel backend logs to see the actual error. Run:
```bash
vercel logs atelier-backend-ivory
```

Or check in Vercel Dashboard → Your Backend Project → Logs

---

### 3. ✅ Barion Pixel Error

**Problem:**
```
ERROR Barion Pixel: Base code implementation not found
```

**Solution:**
- Improved Barion Pixel initialization with retry logic
- Removed console.log statements from production (only show in development)
- Added delay retry mechanism to wait for Barion script to load

**File Updated:** `frontend/src/utils/barionPixel.ts`

---

## Deployment Steps

### Backend (CRITICAL - Must Deploy First)

```bash
cd backend

# Make sure your .env has these variables:
# DATABASE_URL=your_neon_database_url
# FRONTEND_URL=https://www.atelier-archilles.hu
# BARION_ENVIRONMENT=prod
# BARION_POS_KEY=your_production_key
# BARION_PIXEL_ID=your_pixel_id

# Deploy to Vercel
git add .
git commit -m "fix: Add custom domain to CORS, improve error handling"
git push origin main

# Or deploy directly
vercel --prod
```

### Frontend

```bash
cd frontend

# Make sure your .env has:
# VITE_API_URL=https://atelier-backend-ivory.vercel.app
# VITE_BARION_PIXEL_ID=your_pixel_id

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Verify Fixes

After deploying both backend and frontend:

1. **Test CORS Fix:**
   - Open https://www.atelier-archilles.hu
   - Open browser console (F12)
   - Navigate to booking page
   - Should see no CORS errors
   - Should see availability grid load

2. **Test 500 Error Fix:**
   - If still getting 500 error, check Vercel logs:
   ```bash
   vercel logs atelier-backend-ivory --follow
   ```
   - Look for database connection errors
   - Verify DATABASE_URL is set in Vercel environment variables

3. **Test Barion Pixel:**
   - Open https://www.atelier-archilles.hu
   - Open browser console (F12)
   - Should NOT see any console.log messages in production
   - Should NOT see "Barion Pixel: Base code implementation not found"
   - Navigate to booking page
   - Navigate to checkout
   - Barion should track these events silently

---

## Database Connection Issue

If you're still seeing 500 errors, it's likely a database connection issue. Check:

### 1. Verify DATABASE_URL in Vercel

```bash
# Check Vercel environment variables
vercel env ls

# If DATABASE_URL is not set, add it:
vercel env add DATABASE_URL production
# Then paste your Neon database connection string
```

### 2. Check Neon Database

- Log in to https://console.neon.tech
- Verify your database is active
- Check connection string format:
  ```
  postgresql://user:password@host/database?sslmode=require
  ```

### 3. Test Database Connection

Create a simple test endpoint to verify connection:

```typescript
// Add to backend/src/routes/index.ts
router.get('/health/db', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});
```

Then visit: `https://atelier-backend-ivory.vercel.app/api/health/db`

---

## Troubleshooting

### If CORS still blocking:

1. Check that backend is deployed with latest changes
2. Verify in Vercel dashboard that deployment succeeded
3. Clear browser cache and hard reload (Ctrl + Shift + R)

### If 500 error persists:

1. Check Vercel backend logs
2. Verify DATABASE_URL environment variable
3. Test database connection endpoint
4. Check if database has required tables

### If Barion Pixel not working:

1. Verify VITE_BARION_PIXEL_ID is set in frontend env
2. Check that pixel ID is correct format (BP-xxxxx-xxxxx)
3. Open browser console, should see no errors
4. Contact Barion support if pixel ID is invalid

---

## Contact Info

If issues persist after deploying:
- Check backend logs: `vercel logs atelier-backend-ivory --follow`
- Check frontend build: `vercel logs atelier-frontend-mu --follow`
- Verify all environment variables are set correctly in Vercel dashboard

---

**Last Updated:** 2025-10-20
**Status:** Fixes applied, ready for deployment

