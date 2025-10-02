# Vercel Environment Variables Configuration

## ⚠️ IMPORTANT: Variable Names Must Match Code Expectations

Your current Vercel variables have prefixes like `atelier_database_*`, but the code expects simple names.

## Required Environment Variables for Backend

Go to your Vercel project → Settings → Environment Variables and set these:

### Database (PostgreSQL/Neon)
```
DATABASE_URL = postgresql://username:password@host:5432/database?sslmode=require
```
**Note**: Use the full connection string from your Neon dashboard (it should include `?sslmode=require`)

### Node Environment
```
NODE_ENV = production
PORT = 3001
```

### Barion Payment Gateway
```
BARION_ENVIRONMENT = test
BARION_POS_KEY = your_pos_key_here
BARION_PIXEL_ID = your_pixel_id_here
```

### Email (SMTP)
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your_email@gmail.com
SMTP_PASS = your_app_password
FROM_EMAIL = noreply@atelierarchilles.com
FROM_NAME = Atelier Archilles
```

### Security
```
JWT_SECRET = your_random_secret_key_here
WEBHOOK_SECRET = your_webhook_secret_here
```

### Frontend URL
```
FRONTEND_URL = https://your-frontend-domain.vercel.app
```

## Required Environment Variables for Frontend

### API Connection
```
VITE_API_URL = https://your-backend-domain.vercel.app
```

---

## How to Get Your Neon Database Connection String

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project (`atelier_database`)
3. Click "Connection Details"
4. Copy the **full connection string** that looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech:5432/atelier_database?sslmode=require
   ```
5. Paste this as the value for `DATABASE_URL` in Vercel

---

## Steps to Update Vercel Environment Variables

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. **Delete** all variables with `atelier_database_*` prefix
5. **Add** new variables with the correct names listed above
6. Select **Production**, **Preview**, and **Development** for each variable
7. Click **Save**
8. **Redeploy** your project

### Option 2: Via Vercel CLI

```bash
# Set individual variables
vercel env add DATABASE_URL production
# Then paste your Neon connection string when prompted

# Or import from file
vercel env pull .env.local
# Edit .env.local with correct values
vercel env push .env.local production
```

---

## After Setting Variables

1. Go to your project's **Deployments** page
2. Find the latest deployment
3. Click the **⋯** menu → **Redeploy**
4. Select **Use existing Build Cache** (faster)
5. Click **Redeploy**

Your backend should now connect to Neon successfully! ✅

---

## Troubleshooting

If you still see connection errors:

1. **Verify DATABASE_URL format**:
   - Must include `?sslmode=require` at the end
   - Must use `postgresql://` (not `postgres://`)

2. **Check Neon IP allowlist**:
   - Go to Neon dashboard → Project Settings → IP Allow
   - Add `0.0.0.0/0` to allow Vercel's dynamic IPs (or add Vercel's specific IP ranges)

3. **Test connection manually**:
   ```bash
   psql "your_database_url_here"
   ```

4. **Check Vercel Function Logs**:
   - Go to your deployment → Functions tab
   - Check the logs for connection errors

