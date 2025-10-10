# 🖼️ Image Optimization for SEO

## Why Images Matter for SEO

- Google Images drives 20-30% of web traffic
- Alt tags help accessibility and SEO
- Optimized images = faster load times = better rankings
- Rich media improves user engagement

---

## ✅ Image SEO Checklist

### **1. File Names**
❌ **Bad:** `IMG_1234.jpg`, `DSC00056.jpg`, `photo.png`  
✅ **Good:** `studio-a-portrait-photography.jpg`, `budapest-photography-studio.jpg`

### **2. Alt Tags (MOST IMPORTANT)**
❌ **Bad:** `<img src="photo.jpg" alt="photo">`  
✅ **Good:** `<img src="studio-a.jpg" alt="Studio A photography space with professional lighting in Budapest">`

### **3. File Size**
- Hero images: < 200KB
- Studio photos: < 150KB  
- Thumbnails: < 50KB
- Icons: < 10KB

### **4. Dimensions**
- Hero images: 1920x1080px
- Studio photos: 1200x800px
- Thumbnails: 400x300px
- Open Graph: 1200x630px

### **5. Format**
- Photos: WebP (with JPG fallback)
- Logos/Icons: SVG or PNG
- Complex images: JPG
- Transparency: PNG

---

## 🔧 Implementation Examples

### **Basic Image with SEO**
```tsx
<img 
  src="/images/studios/studio-a.jpg"
  alt="Studio A - Professional portrait photography studio with professional lighting equipment in Budapest"
  width="1200"
  height="800"
  loading="lazy"
/>
```

### **Lazy Loading for Performance**
```tsx
// Images below the fold
<img 
  src="/images/studio-b.jpg"
  alt="Studio B for product photography"
  loading="lazy"
  width="800"
  height="600"
/>

// Images above the fold (hero)
<img 
  src="/images/hero.jpg"
  alt="Atelier Archilles Photography Studio"
  loading="eager"
  width="1920"
  height="1080"
/>
```

### **Responsive Images**
```tsx
<picture>
  <source 
    srcSet="/images/studio-a-large.webp" 
    type="image/webp"
    media="(min-width: 1200px)"
  />
  <source 
    srcSet="/images/studio-a-medium.webp" 
    type="image/webp"
    media="(min-width: 768px)"
  />
  <source 
    srcSet="/images/studio-a-small.webp" 
    type="image/webp"
  />
  <img 
    src="/images/studio-a.jpg"
    alt="Studio A with natural lighting and white backdrop"
    loading="lazy"
    width="1200"
    height="800"
  />
</picture>
```

### **Background Images with SEO**
```tsx
// BAD - search engines can't see background images
<div style={{ backgroundImage: 'url(/images/hero.jpg)' }}>
  <h1>Welcome</h1>
</div>

// GOOD - use img tag with semantic HTML
<div className="hero">
  <img 
    src="/images/hero.jpg" 
    alt="Professional photography studio in Budapest"
    className="hero-image"
  />
  <div className="hero-content">
    <h1>Welcome to Atelier Archilles</h1>
  </div>
</div>
```

---

## 📝 Alt Tag Writing Guide

### **Formula:**
`[What it is] + [Key Details] + [Context/Location]`

### **Examples:**

**Studio Photos:**
```tsx
alt="Studio A with professional portrait lighting setup"
alt="Studio B product photography table with overhead lighting"
alt="Makeup station with professional mirrors and lighting"
alt="Studio C fashion photography space with white backdrop"
```

**Equipment:**
```tsx
alt="Professional studio lighting equipment at Atelier Archilles"
alt="Backdrop system with multiple color options"
alt="Photography softbox lighting setup"
```

**Location:**
```tsx
alt="Atelier Archilles photography studio entrance in Budapest"
alt="Reception area at Budapest's premier photo studio"
```

**People (if you add team photos):**
```tsx
alt="Professional photographer setting up studio lights at Atelier Archilles"
alt="Client during portrait photography session"
```

### **DO:**
✅ Be descriptive and specific
✅ Include keywords naturally
✅ Mention location (Budapest)
✅ Describe what's in the image
✅ Keep under 125 characters
✅ Write for blind users (accessibility)

### **DON'T:**
❌ Keyword stuff ("studio photo studio Budapest studio")
❌ Start with "Image of" or "Photo of"
❌ Leave blank
❌ Use "img123.jpg" type descriptions
❌ Copy the same alt tag everywhere

---

## 🎯 Image Optimization Tools

### **Compress Images (Before Upload)**
1. **TinyPNG** - https://tinypng.com
   - Drag & drop
   - Reduces file size 50-80%
   - Maintains quality

2. **Squoosh** - https://squoosh.app
   - Google's tool
   - WebP conversion
   - Side-by-side comparison

3. **ImageOptim** (Mac) - https://imageoptim.com
   - Desktop app
   - Batch processing
   - Removes metadata

### **Convert to WebP**
```bash
# Using online tool
1. Go to https://cloudconvert.com/jpg-to-webp
2. Upload images
3. Download WebP versions

# Or use cwebp (command line)
cwebp studio-a.jpg -o studio-a.webp -q 80
```

### **Batch Rename**
```bash
# PowerShell (Windows)
Get-ChildItem *.jpg | Rename-Item -NewName { $_.Name -replace "IMG_", "studio-" }
```

---

## 📂 Recommended Folder Structure

```
frontend/public/images/
├── logo.png (512x512)
├── logo.svg
├── favicon.ico
├── og-default.jpg (1200x630)
│
├── hero/
│   ├── main-bg.jpg (1920x1080, < 200KB)
│   ├── main-bg.webp
│   └── main-bg-mobile.jpg (800x600)
│
├── studios/
│   ├── studio-a-main.jpg (1200x800, < 150KB)
│   ├── studio-a-main.webp
│   ├── studio-a-thumb.jpg (400x300, < 50KB)
│   ├── studio-b-main.jpg
│   ├── studio-b-main.webp
│   └── ...
│
├── equipment/
│   ├── lighting-setup.jpg
│   ├── backdrop-system.jpg
│   └── ...
│
├── blog/
│   ├── post-1-featured.jpg
│   ├── post-2-featured.jpg
│   └── ...
│
└── team/
    ├── photographer-1.jpg
    └── photographer-2.jpg
```

---

## 🚀 Quick Start Checklist

For each image on your site:

- [ ] Rename file descriptively
- [ ] Compress image (TinyPNG)
- [ ] Upload to correct folder
- [ ] Add alt tag with keywords
- [ ] Set width and height attributes
- [ ] Use loading="lazy" (except hero images)
- [ ] Consider WebP format
- [ ] Test on mobile

---

## 📊 Image SEO Best Practices

### **1. Hero Images**
```tsx
<img 
  src="/images/hero/main-bg.jpg"
  alt="Modern photography studio spaces at Atelier Archilles Budapest"
  width="1920"
  height="1080"
  loading="eager"
  className="hero-image"
/>
```

### **2. Studio Gallery**
```tsx
{studios.map((studio) => (
  <img 
    key={studio.id}
    src={`/images/studios/${studio.id}-main.jpg`}
    alt={`${studio.name} - ${studio.description} at Atelier Archilles Budapest`}
    width="1200"
    height="800"
    loading="lazy"
  />
))}
```

### **3. Logo (Multiple Formats)**
```tsx
{/* Vector logo for crisp display */}
<img 
  src="/images/logo.svg"
  alt="Atelier Archilles Photography Studio Logo"
  width="150"
  height="40"
  loading="eager"
/>

{/* Fallback PNG */}
<img 
  src="/images/logo.png"
  alt="Atelier Archilles Photography Studio Logo"
  width="512"
  height="512"
/>
```

### **4. Blog Featured Images**
```tsx
<img 
  src="/images/blog/portrait-photography-tips.jpg"
  alt="Professional portrait photography setup with studio lighting tips"
  width="1200"
  height="630"
  loading="lazy"
/>
```

---

## 🎨 Image Guidelines by Page

### **Homepage**
- Hero image: Wide, high-quality, < 200KB
- Studio preview: 3-4 images, < 150KB each
- About section: 1-2 images, < 100KB
- **Total images: 5-7 max**

### **Booking Page**
- Studio thumbnails: 4 images, < 50KB each
- Equipment photos: Optional
- **Total images: 4-8 max**

### **Contact Page**
- Studio exterior: 1 image, < 150KB
- Map: Embed (Google Maps)
- Team photos: Optional
- **Total images: 1-3 max**

### **Blog Posts**
- Featured image: 1 per post, < 150KB
- In-content images: 2-4 per post, < 100KB
- **Total images: 3-5 per post**

---

## ⚡ Performance Tips

### **1. Lazy Loading**
```tsx
// Use native lazy loading
<img src="..." loading="lazy" />

// Or use Intersection Observer for more control
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  });
  
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);

{isVisible && <img src="..." />}
```

### **2. Preload Critical Images**
```tsx
// In your HTML head or SEOHead component
<link 
  rel="preload" 
  as="image" 
  href="/images/hero/main-bg.jpg"
  type="image/jpeg"
/>
```

### **3. CDN for Images** (Future optimization)
Use services like:
- Cloudinary
- Imgix
- Cloudflare Images

---

## 🏆 Success Metrics

### **Check These:**
- [ ] All images have descriptive alt tags
- [ ] All images are compressed
- [ ] Page load time < 3 seconds
- [ ] Largest Contentful Paint < 2.5s
- [ ] Images appear in Google Images search
- [ ] Mobile page speed score > 90

### **Tools:**
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Chrome DevTools (Lighthouse)

---

## 📱 Mobile Optimization

### **Test on:**
- iPhone (Safari)
- Android (Chrome)
- Tablet

### **Ensure:**
- Images scale properly
- Text remains readable
- Touch targets are large enough
- Images don't slow loading

---

## 🎯 Action Plan

**Today:**
- [ ] Audit all images on site
- [ ] Add missing alt tags
- [ ] Rename poorly named images

**This Week:**
- [ ] Compress all images
- [ ] Convert to WebP where possible
- [ ] Add lazy loading
- [ ] Test page speed

**Ongoing:**
- [ ] Optimize new images before upload
- [ ] Write descriptive alt tags
- [ ] Monitor Google Images traffic
- [ ] Replace poor quality images

---

**Remember:** Every image is an SEO opportunity! 📸

