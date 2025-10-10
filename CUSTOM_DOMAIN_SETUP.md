# Custom Domain Setup Guide

## Issue: www.atelier-archilles.hu not working but atelier-frontend-mu.vercel.app is working

This means your custom domain is not properly configured or pointing to the wrong deployment.

## Solution: Configure Custom Domain in Vercel

### Step 1: Check Which Projects You Have in Vercel

You should have TWO separate Vercel projects:

1. **Frontend Project** (`atelier-frontend-mu.vercel.app`)
   - Contains: React/Vite frontend code
   - Should be linked to: `www.atelier-archilles.hu` and `atelier-archilles.hu`

2. **Backend Project** (`atelier-backend-ivory.vercel.app`)
   - Contains: Express.js backend API
   - Should remain as: `atelier-backend-ivory.vercel.app` (API endpoint)

### Step 2: Add Custom Domain to Frontend Project

1. **Go to Vercel Dashboard:**
   - Visit [https://vercel.com](https://vercel.com)
   - Select your **FRONTEND** project (`atelier-frontend-mu`)

2. **Go to Settings → Domains:**
   - Click on "Domains" in the left sidebar
   - Click "Add" button

3. **Add Your Domain:**
   - Enter: `atelier-archilles.hu`
   - Click "Add"
   - Vercel will also automatically suggest adding `www.atelier-archilles.hu`
   - Add both domains

4. **Configure DNS:**
   You'll see instructions to add DNS records. You need to add these records to your domain registrar (where you bought the domain):

   **For `atelier-archilles.hu` (root domain):**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `76.76.21.21` (Vercel's IP)

   **For `www.atelier-archilles.hu` (www subdomain):**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

5. **Wait for DNS Propagation:**
   - DNS changes can take 24-48 hours to propagate worldwide
   - Usually happens in 5-15 minutes
   - You can check status on the Vercel Domains page

### Step 3: Update Frontend Configuration

I've already updated your `frontend/vercel.json` to point to the correct backend:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://atelier-backend-ivory.vercel.app/api/:path*"
    }
  ]
}
```

### Step 4: Set Environment Variables for Frontend

1. Go to Vercel → **Frontend Project** → Settings → Environment Variables

2. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://atelier-backend-ivory.vercel.app/api
   Environments: Production, Preview, Development (check all)
   ```

3. Click "Save"

### Step 5: Redeploy Frontend

After adding the domain and environment variables:

1. Go to the "Deployments" tab
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"
4. Select "Use existing Build Cache: No"
5. Click "Redeploy"

### Step 6: Configure CORS on Backend

Make sure your backend allows requests from your custom domain.

1. Go to Vercel → **Backend Project** → Settings → Environment Variables

2. Check if you have a `CORS_ORIGIN` or similar variable. If not, add:
   ```
   Name: FRONTEND_URL
   Value: https://www.atelier-archilles.hu
   ```

3. Or update your backend CORS configuration to allow your domain:
   ```typescript
   // In backend/src/server.ts
   app.use(cors({
     origin: [
       'https://www.atelier-archilles.hu',
       'https://atelier-archilles.hu',
       'https://atelier-frontend-mu.vercel.app',
       'http://localhost:5173'
     ],
     credentials: true
   }));
   ```

### Step 7: Verify Setup

After DNS propagates and redeployment:

1. **Check Domain Status:**
   - Go to Vercel → Frontend Project → Settings → Domains
   - Both domains should show a green checkmark and "Valid Configuration"

2. **Test the Website:**
   - Visit: `https://www.atelier-archilles.hu`
   - Visit: `https://atelier-archilles.hu`
   - Both should redirect to `www` and work properly

3. **Test API Calls:**
   - Go to: `https://www.atelier-archilles.hu/booking`
   - Open browser DevTools (F12) → Network tab
   - You should see API calls going to: `https://atelier-backend-ivory.vercel.app/api/...`

## Common Issues and Solutions

### Issue 1: "Domain is not configured"
**Solution:** Wait for DNS propagation (can take up to 48 hours)

### Issue 2: "Invalid SSL Certificate"
**Solution:** Vercel automatically provisions SSL certificates. Wait a few minutes after adding the domain.

### Issue 3: "API calls failing with CORS errors"
**Solution:** Update backend CORS configuration to allow your custom domain.

### Issue 4: "404 Not Found on refresh"
**Solution:** The `vercel.json` rewrite rules should handle this. Make sure the frontend `vercel.json` has:
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

### Issue 5: Custom domain shows old content
**Solution:** Clear browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## DNS Records Summary

Add these to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

| Type  | Name | Value                    | TTL  |
|-------|------|--------------------------|------|
| A     | @    | 76.76.21.21             | 3600 |
| CNAME | www  | cname.vercel-dns.com    | 3600 |

## Verification Commands

Check if DNS is propagated:
```bash
# Check root domain
nslookup atelier-archilles.hu

# Check www subdomain
nslookup www.atelier-archilles.hu
```

Or use online tools:
- [https://www.whatsmydns.net/](https://www.whatsmydns.net/)
- [https://dnschecker.org/](https://dnschecker.org/)

## Final Checklist

- [ ] Custom domain added to Vercel frontend project
- [ ] DNS records added to domain registrar
- [ ] DNS propagated (check with nslookup or online tool)
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] Frontend redeployed after adding environment variables
- [ ] Backend CORS configured to allow custom domain
- [ ] SSL certificate provisioned (automatic, shows green lock icon)
- [ ] Website loads on both `atelier-archilles.hu` and `www.atelier-archilles.hu`
- [ ] API calls work on custom domain (check Network tab in DevTools)

## Need Help?

If you're still having issues:
1. Check Vercel deployment logs for errors
2. Check browser console (F12) for JavaScript errors
3. Check browser Network tab for failed API requests
4. Verify DNS records are correct using DNS lookup tools

