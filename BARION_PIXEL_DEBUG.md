# Debug Barion Pixel Issue

## 🔍 Check If Pixel ID Was Built Correctly

### Step 1: View Page Source

1. Go to https://www.atelier-archilles.hu
2. Right-click → **View Page Source** (NOT Inspect Element)
3. Search for: `pixelId`
4. Look at line ~28

**What do you see?**

#### ✅ **If you see:**
```javascript
var pixelId = 'BP-12345-67890';  // Real pixel ID
```
→ Environment variable is working! Go to Step 2.

#### ❌ **If you see:**
```javascript
var pixelId = '%VITE_BARION_PIXEL_ID%';  // Literal text, NOT replaced
```
→ **Environment variable was NOT set before build!** Go to Fix A.

---

## Fix A: Environment Variable Not Set (Most Common)

### The Problem:
Vite replaces `%VITE_BARION_PIXEL_ID%` at **BUILD TIME**, not runtime. If the variable wasn't set when the build happened, it stays as literal text.

### The Solution:

#### 1. Add Environment Variable in Vercel

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your **frontend project** (atelier-frontend-mu or whatever it's called)
3. Click **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Fill in:
   - **Name:** `VITE_BARION_PIXEL_ID`
   - **Value:** `BP-xxxxx-xxxxx` (your actual Barion Pixel ID from https://secure.barion.com)
   - **Environments:** Check ALL THREE: ✅ Production ✅ Preview ✅ Development
6. Click **Save**

**Via Vercel CLI:**
```bash
cd frontend

# Add for production
vercel env add VITE_BARION_PIXEL_ID production
# Paste your BP-xxxxx-xxxxx when prompted

# Add for preview
vercel env add VITE_BARION_PIXEL_ID preview
# Paste same value

# Add for development
vercel env add VITE_BARION_PIXEL_ID development
# Paste same value
```

#### 2. Force Rebuild

After setting the environment variable, you MUST rebuild:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments**
2. Find the latest deployment
3. Click the **three dots** (•••)
4. Click **"Redeploy"**
5. **IMPORTANT:** Click **"Redeploy"** again in the popup (don't use existing build cache)

**Option B: Via CLI**
```bash
cd frontend
vercel --prod --force
```

This forces a fresh build that will use the new environment variable.

#### 3. Wait for Build to Complete

Watch the build in Vercel Dashboard. Should take 1-2 minutes.

#### 4. Clear Browser Cache & Test

**CRITICAL:** After rebuild completes:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Or do hard refresh (Ctrl + Shift + R)
3. Visit https://www.atelier-archilles.hu
4. Check page source again - should now show real Pixel ID

---

## Fix B: Browser Cache Issue

If page source shows the real Pixel ID but you still see errors:

### 1. Clear ALL Browser Data
- Press Ctrl + Shift + Delete
- Select "All time"
- Check:
  - ✅ Cached images and files
  - ✅ Cookies and other site data
- Click "Clear data"

### 2. Try Incognito/Private Window
- Chrome: Ctrl + Shift + N
- Edge: Ctrl + Shift + P
- Visit your site in private window
- If it works there → it's a cache issue

### 3. Try Different Browser
- If works in different browser → cache issue in original browser

---

## Fix C: Barion Pixel Script Not Loading

### 1. Check Network Tab
1. Open site
2. Press F12
3. Go to **Network** tab
4. Refresh page (F5)
5. Look for: `bp.js` from `pixel.barion.com`

**Should see:**
```
bp.js  |  200  |  script  |  pixel.barion.com
```

**If you see 404 or error:**
- Barion servers might be down (rare)
- Check https://status.barion.com
- Wait and try again later

---

## Fix D: Pixel ID Invalid

### Check Your Pixel ID Format

Valid format: `BP-12345-67890`

**Get your real Pixel ID:**
1. Login to https://secure.barion.com
2. Go to **Pixel** section (left sidebar)
3. Copy the Pixel ID
4. Should start with `BP-`
5. Make sure pixel status is "Active"

---

## 🧪 Test Commands

After applying fixes, test in browser console (F12):

```javascript
// 1. Check if bp function exists
window.bp
// Should show: ƒ bp() { ... }
// NOT: undefined

// 2. Check if pixel ID was loaded
document.querySelector('script[src*="pixel.barion.com"]')
// Should show: <script async src="https://pixel.barion.com/bp.js"></script>

// 3. Manual test tracking
window.bp('track', 'contentView')
// Should not throw error
```

---

## ✅ Success Indicators

After fixes are applied correctly:

1. **Page source shows:**
   ```javascript
   var pixelId = 'BP-xxxxx-xxxxx';  // Real ID
   ```

2. **Console shows:**
   - ✅ NO "Barion Pixel: Base code implementation not found"
   - ✅ NO errors at all related to Barion

3. **Network tab shows:**
   - ✅ `bp.js` loaded successfully (200 status)

4. **Console test:**
   ```javascript
   window.bp
   // Returns: ƒ bp() { ... }
   ```

---

## 📋 Quick Checklist

If still having issues, verify:

- [ ] `VITE_BARION_PIXEL_ID` is set in Vercel (Settings → Environment Variables)
- [ ] Environment variable is set for **Production** environment
- [ ] You clicked **"Redeploy"** after setting the variable (not just saved it)
- [ ] Build completed successfully (check Vercel logs)
- [ ] Cleared browser cache after redeploy
- [ ] Page source shows real Pixel ID (not `%VITE_BARION_PIXEL_ID%`)
- [ ] `bp.js` script loads in Network tab
- [ ] Pixel ID format is correct (starts with `BP-`)
- [ ] Pixel is "Active" in Barion Dashboard

---

## 🆘 Still Not Working?

### Share This Info:

1. **View page source at your site**
2. **Find line ~28** (search for "pixelId")
3. **What does it show?**
   - A) `var pixelId = 'BP-xxxxx-xxxxx';` (real ID)
   - B) `var pixelId = '%VITE_BARION_PIXEL_ID%';` (literal text)
   - C) Something else

**If B:** Environment variable not set → Follow Fix A above

**If A:** Browser cache or Barion script issue → Follow Fix B and C above

---

**Most likely issue: Environment variable not set before build. Follow Fix A!** 🎯

