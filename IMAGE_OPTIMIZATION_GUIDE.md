# Image Optimization Guide

## Overview
This guide explains how to optimize images for the photo studio website to reduce data usage and improve loading times.

## Installation

### Step 1: Install Image Optimization Plugin

```bash
cd frontend
npm install --save-dev vite-plugin-imagemin @vheemstra/vite-plugin-imagemin
```

### Step 2: Install Image Compression Tools

```bash
npm install --save-dev imagemin-mozjpeg imagemin-pngquant imagemin-webp imagemin-svgo
```

## Configuration

The `vite.config.ts` has been updated to include:
- **JPEG Optimization**: Compresses JPEG images with quality 80
- **PNG Optimization**: Reduces PNG file sizes
- **WebP Conversion**: Creates modern WebP versions
- **SVG Optimization**: Minifies SVG files

## Build Process

When you run `npm run build`, images in the `public/images/` folder will be:
1. Compressed automatically
2. Converted to WebP format (alongside originals)
3. Optimized for web delivery

## Manual Image Optimization (Alternative)

If the plugin doesn't work on Windows, you can use online tools or manual compression:

### Option 1: Use Sharp (Node.js script)
```bash
npm install --save-dev sharp
node scripts/optimize-images.js
```

### Option 2: Online Tools
- **TinyPNG**: https://tinypng.com/ (PNG/JPEG)
- **Squoosh**: https://squoosh.app/ (All formats)
- **CompressJPEG**: https://compressjpeg.com/

### Option 3: Batch Processing
Use tools like:
- **ImageMagick**: Command-line batch processing
- **XnConvert**: GUI batch converter

## Recommended Image Sizes

### Studio Gallery Images
- Original: Max 1920x1440px
- Thumbnail: 400x300px
- Quality: 80-85%

### Special Event Images
- Original: Max 1600x1200px
- Quality: 80%

### Hero Images
- Original: Max 2560x1440px
- Quality: 85%

## WebP Support

Modern browsers support WebP format which is 25-35% smaller than JPEG.

**Browser Fallback:**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

## Current Image Sizes

### Before Optimization
- `/images/atelier/`: ~1.5-2.5MB per image
- `/images/special/`: ~1.7-2.4MB per image
- **Total**: ~50-70MB

### After Optimization (Expected)
- Gallery images: ~150-250KB per image
- Hero images: ~300-400KB
- **Total**: ~10-15MB (70-80% reduction)

## Best Practices

1. **Always optimize before deploying**
2. **Use WebP for modern browsers**
3. **Implement lazy loading** (already done)
4. **Use responsive images** for different screen sizes
5. **Cache optimized images** in CDN if available

## Vercel Automatic Image Optimization

Vercel has built-in image optimization. To use it:

```jsx
import Image from 'next/image'  // If using Next.js

// Or for Vite, use the optimized images from build
```

## Build Command

```bash
npm run build
```

This will automatically optimize all images in the `public/` directory during build time.

## Verification

After build, check the `dist/` folder:
- Look for `.webp` files alongside originals
- Compare file sizes in `dist/images/` vs `public/images/`
- Test loading times in browser DevTools

## Monitoring

Use Chrome DevTools > Network tab to check:
- Image sizes being transferred
- Total page size
- Load time improvements

## Next Steps

1. Run the optimization build
2. Test on production/preview deployment
3. Monitor bandwidth usage
4. Consider implementing a CDN for global users

