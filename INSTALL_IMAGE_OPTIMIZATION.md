# Install Image Optimization

## Quick Setup

Follow these steps to enable automatic image optimization:

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

This will install:
- `vite-plugin-image-optimizer` - Vite plugin for image compression
- `sharp` - Node.js image processing library

### Step 2: Build with Optimization

```powershell
npm run build
```

Images in `public/images/` will be automatically optimized during the build process.

### Step 3: Verify Optimization

Check the `dist/` folder after build:
- Images should be smaller in size
- Quality should still be good (80-85%)

---

## Alternative: Manual Optimization Script

If the automatic build optimization doesn't work, you can run the manual optimization script:

```powershell
npm run optimize-images
```

This will:
1. Create an `images-optimized/` folder
2. Process all images from `public/images/`
3. Generate optimized JPEG/PNG versions
4. Create WebP versions for modern browsers

After running:
1. Compare file sizes
2. Check image quality
3. Replace original images if satisfied
4. Delete the `images-optimized` folder

---

## Expected Results

### Current Image Sizes
```
/images/atelier/1.jpg     ~2.0 MB
/images/atelier/2.jpg     ~2.2 MB
/images/special/1.jpg     ~1.8 MB
/images/special/2.jpg     ~2.4 MB
...
Total: ~50-70 MB
```

### After Optimization
```
/images/atelier/1.jpg     ~200 KB (90% reduction)
/images/atelier/1.webp    ~150 KB (WebP version)
/images/atelier/2.jpg     ~220 KB
/images/atelier/2.webp    ~170 KB
...
Total: ~10-15 MB (70-80% reduction)
```

---

## Troubleshooting

### Issue: Sharp installation fails on Windows

**Solution 1: Use pre-built binaries**
```powershell
npm install --ignore-scripts=false --verbose sharp
```

**Solution 2: Install Visual Studio Build Tools**
- Download from: https://visualstudio.microsoft.com/downloads/
- Install "Desktop development with C++"
- Restart terminal and run `npm install` again

**Solution 3: Use online tools**
- Upload images to https://tinypng.com/
- Download optimized versions
- Replace original images

### Issue: Build is slow

This is normal! Image optimization takes time.
- First build: 2-5 minutes (optimizing all images)
- Subsequent builds: Fast (only changed images)

### Issue: Images look blurry

Increase quality settings in `vite.config.ts`:
```typescript
jpg: { quality: 85 },  // was 80
png: { quality: 90 },  // was 85
```

---

## Testing

### Before Deployment
1. Build locally: `npm run build`
2. Preview: `npm run preview`
3. Open browser DevTools > Network
4. Check image sizes being loaded
5. Verify images look good

### After Deployment (Vercel)
1. Check deployment build logs
2. Verify images are optimized in production
3. Test loading speed on slow connection
4. Monitor bandwidth usage

---

## Maintenance

### When Adding New Images
1. Add to `public/images/` folder
2. Run `npm run build` - they'll be auto-optimized
3. Deploy to Vercel

### Periodic Optimization
Re-optimize existing images every few months:
```powershell
npm run optimize-images
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Build project: `npm run build`
3. ✅ Deploy to Vercel
4. ✅ Monitor bandwidth savings
5. Consider adding a CDN for global users

