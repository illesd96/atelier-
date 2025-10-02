# Vercel Database Connection Troubleshooting

## Error: `getaddrinfo ENOTFOUND base`

This error means the `DATABASE_URL` is either:
1. **Not set** in Vercel environment variables
2. **Incorrectly formatted**
3. **Partially set** (like just "base" instead of a full connection string)

---

## ✅ Step-by-Step Fix

### Step 1: Verify Your DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL` variable
3. **Click "Edit"** and verify the value looks like this:

```
postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech:5432/database_name?sslmode=require
```

**Important parts**:
- Starts with `postgresql://` (not `postgres://`)
- Has username and password
- Has a complete host (like `ep-xxx.region.aws.neon.tech`)
- Has port `:5432`
- Has database name
- Ends with `?sslmode=require`

### Step 2: Get Correct DATABASE_URL from Neon

1. Go to https://console.neon.tech
2. Select your project
3. Click **"Dashboard"** or **"Connection Details"**
4. Look for **"Connection string"** section
5. Copy the **Pooled connection** string (recommended for serverless)
6. It should look like:
   ```
   postgresql://username:password@ep-something-something.region.aws.neon.tech/database?sslmode=require
   ```

### Step 3: Update in Vercel

1. In Vercel → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Click **Edit** (or delete and re-create)
4. Paste the complete connection string from Neon
5. Make sure **Production**, **Preview**, and **Development** are checked
6. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click your latest deployment
3. Click the **⋯** menu
4. Select **"Redeploy"**
5. Click **Redeploy**

### Step 5: Check Function Logs

After redeployment:
1. Go to your deployment
2. Click **"Functions"** tab
3. Click on any function
4. Check the logs - you should now see:
   ```
   🔗 Attempting to connect to database: postgresql://user:****@ep-xxx.region.aws.neon.tech/...
   ✅ Database connected successfully
   ```

---

## Common Mistakes

### ❌ Wrong: Using Individual Connection Params
```
PGHOST=ep-something.neon.tech
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
```

### ✅ Correct: Using Full Connection String
```
DATABASE_URL=postgresql://username:password@ep-something.neon.tech:5432/database?sslmode=require
```

---

## Still Not Working?

### Check Neon IP Allowlist

1. Go to Neon Dashboard → Your Project
2. Click **Settings** → **IP Allow**
3. Make sure it's set to **"Allow all IPs"** (`0.0.0.0/0`)
   - Or add Vercel's IP ranges (see https://vercel.com/docs/edge-network/ip-addresses)

### Verify Neon Database is Active

1. In Neon dashboard, check if your project is **Active** (not suspended)
2. Check if the database exists
3. Try connecting with `psql` from your local machine:
   ```bash
   psql "your_connection_string_here"
   ```

### Check Vercel Function Logs

After the latest deployment with debugging enabled, check the logs:
1. Deployment → Functions → Select any function
2. Look for the log line starting with `🔗 Attempting to connect to database:`
3. This will show you what DATABASE_URL is actually being used (with password masked)

---

## Alternative: Use Vercel Postgres

If Neon continues to have issues, you can use Vercel's own Postgres:

1. Go to your Vercel project
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Create the database
6. Vercel will automatically inject the correct environment variables

Then update your code to use Vercel's auto-injected variables:
```typescript
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});
```

