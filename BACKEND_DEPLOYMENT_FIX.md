# 🔧 Backend Deployment Fix - PDF Files Issue

## Problem Identified
Backend deployment was failing with "An unexpected error happened" during the "Deploying outputs..." phase.

## Root Cause
When the Barion payment section and PDF documents were added to `frontend/public/documents/`, the **backend** Vercel deployment started failing because:

1. **4 large PDF files** (several MB total) were added:
   - `Atelier-Archilles_Cookie_Policy_v251020.pdf`
   - `Atelier-Archilles_Impressum_v251020.pdf`
   - `Atelier-Archilles_Privacy_Policy_v251020.pdf`
   - `Atelier-Archilles_Terms_and_Conditions_v251020.pdf`

2. The backend Vercel project was pulling the **entire repository**, including frontend files and PDFs
3. This pushed the serverless function size **over Vercel's limits** (50MB max)
4. Deployment failed silently during the "Deploying outputs" phase

## Solution

### Created `.vercelignore` in Backend
**File:** `backend/.vercelignore`

This file tells Vercel to **exclude** frontend files when deploying the backend:
- Ignores `../frontend/` directory entirely
- Ignores all markdown documentation files
- Ignores SQL files and other non-backend files
- Prevents PDFs from being bundled into backend serverless function

## Verification Steps

### 1. Check Backend Vercel Project Settings
In Vercel Dashboard → Backend Project → Settings:

**Root Directory:** `backend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### 2. After Deployment
Monitor the build logs for:
- ✅ No frontend files being included
- ✅ Smaller bundle size
- ✅ Successful deployment completion

### 3. Check Function Size
After successful deployment:
- Go to Functions tab in Vercel
- Check serverless function size
- Should be < 50MB (ideally < 10MB)

## Files Changed
- ✅ `backend/.vercelignore` (NEW)
- ✅ `backend/scripts/copy-templates.js` (for email templates)
- ✅ `backend/package.json` (updated build script)
- ✅ `backend/vercel.json` (added includeFiles)

## Expected Behavior After Fix
1. ✅ Backend only builds from `backend/` directory
2. ✅ Frontend files (including PDFs) are excluded
3. ✅ Serverless function size stays within limits
4. ✅ Deployment completes successfully
5. ✅ All backend APIs work normally

---

**Issue:** PDFs in frontend breaking backend deployment  
**Fix:** Added `.vercelignore` to exclude frontend files from backend build  
**Status:** Ready for deployment

**Created:** 2025-10-20

