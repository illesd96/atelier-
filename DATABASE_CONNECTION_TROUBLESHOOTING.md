# Database Connection Troubleshooting

## Issue: Database was working, now can't connect

Your DATABASE_URL is correct in Vercel:
```
postgresql://neondb_owner:npg_Py2jfnN1iqaA@ep-long-math-agvdns26-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Possible Causes & Solutions

### 1. 🛌 Neon Database in Sleep Mode (Most Common)

**Neon Free Tier** databases go to sleep after inactivity.

**Fix:**
1. Go to https://console.neon.tech
2. Select your project: `ep-long-math-agvdns26`
3. Look for a **"Wake Up"** or **"Activate"** button
4. Or just make any query (it will auto-wake, takes ~10-20 seconds)

**Check Status:**
- Dashboard should show "Active" (green) or "Sleeping" (yellow/gray)

---

### 2. 🔒 Connection Pool Limit Reached

Neon Free Tier limits:
- Max 10 concurrent connections
- Your code sets `max: 20` connections

**Fix:** Reduce connection pool size in `backend/src/database/connection.ts`:

```typescript
const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,  // Changed from 20 to 5 for Neon free tier
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,  // Increased from 2000 to 10000
});
```

---

### 3. ⏰ Connection Timeout Too Short

Your current timeout is only **2 seconds**, which might be too short when the database is waking up.

**Already fixed above** - increased to 10 seconds.

---

### 4. 🔐 SSL Certificate Issues

Neon requires **channel_binding=require**, but the pg library might have issues with it in some environments.

**Fix:** Update DATABASE_URL to remove `channel_binding`:

```
postgresql://neondb_owner:npg_Py2jfnN1iqaA@ep-long-math-agvdns26-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Remove the `&channel_binding=require` part.

---

### 5. 🌍 Wrong Region or Endpoint

I noticed your logs show `us-east-2` but your Vercel env shows `eu-central-1`.

**Check:**
- Are you deploying to multiple Vercel projects?
- Do you have multiple Neon databases?

**Verify:**
1. Go to Neon Console
2. Check which region your database is in
3. Make sure the connection string matches

---

### 6. 🔄 Vercel Deployment Cache

Sometimes Vercel caches old environment variables.

**Fix:**
```bash
# In your backend directory
vercel --prod --force
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Click on latest deployment
3. Click **"Redeploy"** (three dots menu)
4. Check ☑️ **"Use existing Build Cache"** = OFF

---

## 🔍 Immediate Steps to Take

### Step 1: Check Neon Database Status

```bash
# Test connection directly using psql or any SQL client
psql "postgresql://neondb_owner:npg_Py2jfnN1iqaA@ep-long-math-agvdns26-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

If this works, your database is fine and it's a Vercel issue.
If this fails, it's a Neon issue.

### Step 2: Check Neon Dashboard

1. Login to https://console.neon.tech
2. Check **"Operations"** tab for any errors
3. Check **"Monitoring"** for connection attempts
4. Look for any warnings or notices

### Step 3: Apply the Connection Pool Fix

Update the connection settings (see Fix #2 above).

### Step 4: Remove channel_binding

Update DATABASE_URL in Vercel (see Fix #4 above).

---

## 🚀 Quick Fix (Try This First!)

Most likely issue: **Neon database is sleeping or connection pool is exhausted**.

**Do this now:**

1. **Wake up the database:**
   - Go to https://console.neon.tech
   - Open your project
   - Click on any database query or run a test query
   - Wait 10-20 seconds

2. **Update connection timeout:**
   (Apply the fix in connection.ts shown above)

3. **Redeploy without cache:**
   ```bash
   cd backend
   vercel --prod --force
   ```

4. **Check logs again:**
   ```bash
   vercel logs --follow
   ```

---

## 🔴 If Still Failing

### Check Vercel Logs for Specific Error

Look for error messages like:
- `ECONNREFUSED` → Database is down or wrong host
- `password authentication failed` → Wrong password
- `timeout` → Database is sleeping or too slow
- `too many connections` → Connection pool issue
- `SSL error` → Try removing channel_binding

### Contact Neon Support

If none of the above works:
1. Go to https://console.neon.tech
2. Click on "Support" or help icon
3. Check if there's a system status page
4. They might have maintenance or issues

---

## 📊 Monitoring After Fix

Add a health check endpoint to verify connection:

```typescript
// Add to backend/src/routes/index.ts
router.get('/health/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    client.release();
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: result.rows[0].now,
      version: result.rows[0].version,
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      code: error.code,
    });
  }
});
```

Then visit: `https://atelier-backend-ivory.vercel.app/api/health/db`

---

## ✅ Expected Result After Fix

Vercel logs should show:
```
🔗 Attempting to connect to database: postgresql://neondb_owner:****@ep-long-math-agvdns26-pooler...
✅ Database connected successfully
🚀 Server running on port 3000
```

Your website should load without 500 errors.

---

**Last Updated:** 2025-10-20
**Status:** Awaiting verification

