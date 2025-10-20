# Final Deployment Checklist

## ⚠️ Current Errors (Before Deployment)

You're seeing these errors because the OLD code is still deployed:

1. ❌ **Barion Pixel error** - Fixed in code, not deployed yet
2. ❌ **Manifest syntax error** - False positive, will be fixed after deployment

---

## 🔍 CRITICAL: Check Barion Pixel ID in Vercel

**Before deploying frontend**, verify this environment variable exists:

### Step 1: Check in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your **frontend project** (atelier-frontend-mu or similar)
3. Go to: **Settings** → **Environment Variables**
4. Look for: `VITE_BARION_PIXEL_ID`

**Should be:**
- Name: `VITE_BARION_PIXEL_ID`
- Value: `BP-xxxxx-xxxxx` (your actual Barion Pixel ID)
- Environments: ✅ Production, ✅ Preview, ✅ Development

### Step 2: If Missing, Add It

**Get your Pixel ID:**
1. Login to Barion: https://secure.barion.com
2. Go to: **Pixel** section
3. Copy your Pixel ID (format: `BP-xxxxx-xxxxx`)

**Add to Vercel:**

**Via Dashboard:**
1. Vercel → Frontend Project → Settings → Environment Variables
2. Click **Add New**
3. Name: `VITE_BARION_PIXEL_ID`
4. Value: `BP-xxxxx-xxxxx` (paste your actual ID)
5. Select: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**

**Or via CLI:**
```bash
vercel env add VITE_BARION_PIXEL_ID production
# Paste your BP-xxxxx-xxxxx when prompted

vercel env add VITE_BARION_PIXEL_ID preview
# Paste your BP-xxxxx-xxxxx when prompted

vercel env add VITE_BARION_PIXEL_ID development
# Paste your BP-xxxxx-xxxxx when prompted
```

---

## 🚀 Deployment Steps (In Order)

### Step 1: Deploy Backend First

```bash
cd backend
git add .
git commit -m "fix: Enable trust proxy for Vercel"
git push origin main
```

**Wait for deployment to complete** (check Vercel dashboard)

### Step 2: Verify Backend Health

```bash
curl https://atelier-backend-ivory.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "...",
  "version": "1.0.0"
}
```

### Step 3: Deploy Frontend

```bash
cd frontend
git add .
git commit -m "feat: Add favicons, fix Barion Pixel, clean date format"
git push origin main
```

**Wait for deployment to complete**

### Step 4: Clear Browser Cache

**IMPORTANT:** After deployment, clear your browser cache:
- Chrome/Edge: Ctrl + Shift + Delete → Clear "Cached images and files"
- Or: Hard refresh with Ctrl + Shift + R

---

## ✅ Post-Deployment Verification

### 1. Check Website Loads

Visit: https://www.atelier-archilles.hu

**Expected:**
- ✅ Favicon appears in tab
- ✅ No errors in console (F12)
- ✅ NO Barion Pixel error
- ✅ NO manifest error

### 2. Check Barion Pixel

Open browser console (F12) and type:
```javascript
window.bp
```

**Expected:** Should show `function bp() { ... }`

**NOT:** `undefined`

### 3. Check Manifest

In console, type:
```javascript
fetch('/fav/site.webmanifest').then(r => r.json()).then(console.log)
```

**Expected:** Should show your manifest JSON without errors

### 4. Test Booking Flow

1. Navigate to booking page
2. Select a time slot
3. Add to cart
4. Go to checkout
5. Complete payment (use test card if in test mode)
6. Verify payment success page shows:
   - ✅ Clean date format (2025-10-20, NOT 2025-10-20T00:00:00.000Z)
   - ✅ Booking codes display correctly

### 5. Verify Backend Logs

```bash
vercel logs atelier-backend-ivory --follow
```

**Expected:**
- ✅ No "trust proxy" errors
- ✅ Database connection successful
- ✅ No rate limiting errors

---

## 🔧 If Barion Pixel Still Not Working After Deploy

### Troubleshooting Steps:

1. **Verify environment variable was set:**
   ```bash
   vercel env ls
   ```
   Should show `VITE_BARION_PIXEL_ID` for all environments

2. **Check deployed HTML source:**
   - Visit your site
   - Right-click → View Page Source
   - Search for `BP-` 
   - Should see: `var pixelId = 'BP-xxxxx-xxxxx';`
   - NOT: `var pixelId = '%VITE_BARION_PIXEL_ID%';`

3. **If you see `%VITE_BARION_PIXEL_ID%` (literal text):**
   - Environment variable was NOT set before build
   - Set the variable in Vercel
   - Force rebuild: `vercel --prod --force`

4. **Check Barion Pixel script loads:**
   - Open Network tab (F12)
   - Look for request to `pixel.barion.com/bp.js`
   - Should return 200 OK

5. **Verify Pixel ID is valid:**
   - Login to Barion Dashboard
   - Go to Pixel section
   - Make sure pixel is "Active" status

---

## 📊 Complete Success Checklist

After deployment and testing:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Backend `/api/health` returns "connected"
- [ ] Website loads without errors
- [ ] Favicon appears in browser tab
- [ ] No console errors (F12)
- [ ] No Barion Pixel errors
- [ ] No manifest errors
- [ ] Booking page loads and shows availability
- [ ] Can add items to cart
- [ ] Cart badge shows correct count
- [ ] Checkout page works
- [ ] Payment redirects to Barion
- [ ] Payment success page shows clean dates
- [ ] Booking codes display correctly
- [ ] No CORS errors
- [ ] Mobile responsive works
- [ ] PWA installable (Add to Home Screen works)
- [ ] `window.bp` exists in console
- [ ] Barion Pixel tracking events (check Barion Dashboard)

---

## 🎯 Final Notes

**Most Common Issue:** Forgetting to set `VITE_BARION_PIXEL_ID` environment variable in Vercel.

**Solution:** 
1. Set the variable in Vercel Dashboard
2. Force redeploy: `vercel --prod --force`
3. Clear browser cache
4. Test again

**The errors you're seeing now are from the OLD deployed code. After deploying the fixes, they will be gone!**

---

## 🆘 If Still Having Issues

1. **Check Vercel build logs:**
   - Vercel Dashboard → Deployments → Latest → View Function Logs
   - Look for any build warnings or errors

2. **Verify all files are committed:**
   ```bash
   git status
   ```
   Should show "nothing to commit, working tree clean"

3. **Check git remote:**
   ```bash
   git remote -v
   ```
   Make sure it's pointing to the correct repository

4. **Force fresh deploy:**
   ```bash
   # Backend
   cd backend
   vercel --prod --force
   
   # Frontend
   cd frontend
   vercel --prod --force
   ```

---

**Ready to deploy!** Follow the steps above in order. 🚀

**Last Updated:** 2025-10-20  
**Status:** Ready for final deployment

