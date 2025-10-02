# Deployment Guide — Vercel

## Overview
This guide covers deploying **Atelier Archilles** photo studio booking system to Vercel.

## Architecture on Vercel

Since this is a **monorepo** with separate frontend and backend, you'll need to deploy them as **two separate Vercel projects**:

1. **Frontend** (React + Vite) → `atelier-archilles.vercel.app`
2. **Backend** (Node.js + Express) → `atelier-archilles-api.vercel.app`

## Prerequisites

- [x] GitHub repository created
- [x] Code pushed to GitHub
- [x] Vercel account (free tier works great)
- [x] PostgreSQL database (Vercel Postgres, Supabase, or Railway)

## Step 1: Prepare Your Database

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string
4. Run the schema:
```bash
psql YOUR_DATABASE_URL < backend/src/database/schema.sql
```

### Option B: Supabase (Free tier)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the connection string (Transaction pooler)
4. Use SQL Editor to run the schema

### Option C: Railway
1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string
4. Run migrations

## Step 2: Deploy Backend API

### Create Backend Project on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important:** Set root directory to `backend`
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Add Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Barion Payment
BARION_ENVIRONMENT=prod
BARION_POS_KEY=your_production_barion_key
BARION_PIXEL_ID=your_barion_pixel_id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@atelierarchilles.com
FROM_NAME=Atelier Archilles

# Frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app

# Studios Config
STUDIOS=[{"id":"studio-a","name":"Studio A"},{"id":"studio-b","name":"Studio B"},{"id":"studio-c","name":"Studio C"},{"id":"makeup","name":"Makeup Studio"}]
```

### Deploy Backend
1. Click "Deploy"
2. Wait for deployment
3. Copy the deployment URL (e.g., `atelier-archilles-api.vercel.app`)
4. Test: `https://your-api.vercel.app/api/health`

## Step 3: Deploy Frontend

### Create Frontend Project on Vercel

1. Go back to Vercel dashboard
2. Click "Add New" → "Project"
3. Import the **same** GitHub repository
4. **Important:** Set root directory to `frontend`
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Add Environment Variables

In Vercel project settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Update API Configuration

Make sure `frontend/src/services/api.ts` uses the environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### Deploy Frontend
1. Click "Deploy"
2. Wait for deployment
3. Your site will be live at `https://your-frontend.vercel.app`

## Step 4: Update Backend with Frontend URL

1. Go to backend Vercel project
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your frontend's actual URL
4. Redeploy backend

## Step 5: Configure Custom Domain (Optional)

### For Frontend
1. Go to frontend Vercel project
2. Settings → Domains
3. Add your domain (e.g., `atelierarchilles.com`)
4. Follow DNS configuration instructions

### For Backend
1. Go to backend Vercel project
2. Settings → Domains
3. Add subdomain (e.g., `api.atelierarchilles.com`)
4. Update frontend environment variable with new API URL

## Step 6: Set Up Barion Webhooks

1. Log into Barion dashboard
2. Go to My Shops → Settings → Webhooks
3. Add webhook URL: `https://your-api.vercel.app/api/webhooks/barion`
4. Enable payment status notifications

## Vercel Configuration Files

### Root `vercel.json` (if deploying as monorepo)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    }
  ]
}
```

### Frontend `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Backend `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ]
}
```

## Important Notes

### Backend Considerations
- ⚠️ **Serverless Functions:** Vercel runs backend as serverless functions
- ⚠️ **Cold Starts:** First request after inactivity may be slower
- ⚠️ **10-second timeout:** Keep requests under 10s (25s on Pro plan)
- ⚠️ **File uploads:** Consider using external storage (AWS S3, Cloudinary)

### Database Connections
- Use connection pooling (included in our setup)
- Keep connection pool size reasonable for serverless
- Consider using PostgreSQL transaction pooler

### Environment Variables
- Never commit `.env` files
- Always use Vercel's Environment Variables UI
- Test with preview deployments first

## Testing Your Deployment

### Backend Health Check
```bash
curl https://your-backend.vercel.app/api/health
```

### Frontend Test
1. Visit `https://your-frontend.vercel.app`
2. Navigate to booking page
3. Try selecting time slots
4. Test language switching (EN/HU)

### Full Booking Flow Test
1. Select time slots
2. Go to checkout
3. Fill in details
4. Test Barion payment (use test card in test mode)
5. Verify email notifications work

## Troubleshooting

### Backend "Module not found" errors
- Ensure `package.json` dependencies are complete
- Check build logs in Vercel dashboard
- Verify `tsconfig.json` is correct

### CORS errors
- Check `FRONTEND_URL` environment variable
- Verify CORS configuration in `backend/src/server.ts`
- Make sure frontend URL matches exactly (no trailing slash)

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Test connection string locally first

### Build failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

## Monitoring & Logs

### Vercel Dashboard
- Real-time logs: Deployments → Select deployment → Logs
- Analytics: See traffic, performance metrics
- Edge Network: Global CDN for fast loading

### Set Up Monitoring
1. Enable Vercel Analytics (free on all plans)
2. Consider adding error tracking (Sentry, LogRocket)
3. Set up uptime monitoring (UptimeRobot, Pingdom)

## Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

### Preview Deployments
- Every commit gets a unique preview URL
- Perfect for testing before merging to main
- Shares environment variables with production

## Cost Estimate

### Free Tier (Hobby)
- **Frontend:** FREE (static files + bandwidth)
- **Backend:** FREE (serverless functions, 100GB-hrs/month)
- **Database:** Consider external (Supabase free tier, Railway)
- **Total:** $0/month for low-medium traffic

### Pro Tier ($20/month per member)
- Longer function timeout (25s)
- More bandwidth
- Advanced analytics
- Team collaboration

## Security Checklist

- [x] All secrets in environment variables (not in code)
- [x] CORS properly configured
- [x] HTTPS enabled (automatic on Vercel)
- [x] Rate limiting implemented
- [x] SQL injection protection (using parameterized queries)
- [x] Input validation on all endpoints
- [x] Webhook signature verification (Barion)

## Next Steps After Deployment

1. **Test everything thoroughly**
2. **Set up custom domain**
3. **Configure email DNS (SPF, DKIM)**
4. **Monitor error logs for first few days**
5. **Set up backup strategy for database**
6. **Document any production-specific configuration**

---

## Quick Reference

### Deployment Commands
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from CLI
cd frontend && vercel
cd backend && vercel

# Check deployment status
vercel ls
```

### Important URLs After Deployment
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`
- Health Check: `https://your-backend.vercel.app/api/health`

---

**Your Atelier Archilles booking system is ready for the world! 🚀**

Need help with deployment? Check the [Vercel documentation](https://vercel.com/docs) or contact support.

