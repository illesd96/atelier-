# Image Asset Guide

## 📁 Where to Put Your Images

Your frontend now has two locations for images, each with a specific purpose:

### 1. `frontend/public/images/` - For Static Images
**Use this for:**
- Images that don't need processing
- Large images or files
- Images referenced in HTML directly
- Favicons, logos that don't change
- Images used in email templates

**How to use:**
```tsx
// In your component
<img src="/images/your-image.jpg" alt="Description" />

// Or with full path
<img src={`${window.location.origin}/images/your-image.jpg`} alt="Description" />
```

**Example structure:**
```
frontend/public/images/
  ├── logo.png
  ├── favicon.ico
  ├── studios/
  │   ├── studio-a.jpg
  │   ├── studio-b.jpg
  │   └── studio-c.jpg
  └── hero/
      └── hero-background.jpg
```

### 2. `frontend/src/assets/images/` - For Imported Images
**Use this for:**
- Images imported directly in components
- Images that need optimization by Vite
- Images that are part of your component logic
- Smaller images that should be bundled

**How to use:**
```tsx
// Import at the top of your component
import studioImage from '@/assets/images/studio-a.jpg';

// Use in component
<img src={studioImage} alt="Studio A" />
```

**Example structure:**
```
frontend/src/assets/images/
  ├── icons/
  │   ├── check.svg
  │   └── arrow.svg
  ├── backgrounds/
  │   └── pattern.png
  └── team/
      ├── photographer-1.jpg
      └── photographer-2.jpg
```

## 🎯 Quick Reference

| Image Type | Location | Usage |
|------------|----------|-------|
| **Hero backgrounds** | `public/images/hero/` | `<img src="/images/hero/bg.jpg" />` |
| **Studio photos** | `public/images/studios/` | `<img src="/images/studios/studio-a.jpg" />` |
| **Icons (SVG)** | `src/assets/images/icons/` | `import icon from '@/assets/images/icons/...'` |
| **Logos** | `public/images/` | `<img src="/images/logo.png" />` |
| **Team photos** | `src/assets/images/team/` | `import photo from '@/assets/images/team/...'` |
| **Blog images** | `public/images/blog/` | `<img src="/images/blog/post-1.jpg" />` |

## 💡 Best Practices

### Image Optimization
1. **Use WebP format** when possible for better compression
2. **Compress images** before uploading (use tools like TinyPNG, Squoosh)
3. **Appropriate sizes**:
   - Hero images: max 1920px width
   - Studio photos: max 1200px width
   - Thumbnails: 400px width
   - Icons: 24px-64px

### File Naming
- Use lowercase
- Use hyphens (not spaces or underscores)
- Be descriptive: `studio-a-wide-angle.jpg` instead of `img1.jpg`

### Examples

#### Example 1: Using Public Images (HomePage)
```tsx
// frontend/src/pages/HomePage.tsx
export const HomePage: React.FC = () => {
  return (
    <div className="hero" style={{ backgroundImage: 'url(/images/hero/main-bg.jpg)' }}>
      <h1>Welcome to Atelier Archilles</h1>
    </div>
  );
};
```

#### Example 2: Using Imported Images (Studio Gallery)
```tsx
// frontend/src/components/StudioGallery.tsx
import studioA from '@/assets/images/studios/studio-a.jpg';
import studioB from '@/assets/images/studios/studio-b.jpg';

export const StudioGallery: React.FC = () => {
  const studios = [
    { id: 'a', name: 'Studio A', image: studioA },
    { id: 'b', name: 'Studio B', image: studioB },
  ];

  return (
    <div className="gallery">
      {studios.map(studio => (
        <img key={studio.id} src={studio.image} alt={studio.name} />
      ))}
    </div>
  );
};
```

#### Example 3: Dynamic Images from Data
```tsx
// For images stored in public/images/
const rooms = [
  { id: 'studio-a', name: 'Studio A', image: '/images/studios/studio-a.jpg' },
  { id: 'studio-b', name: 'Studio B', image: '/images/studios/studio-b.jpg' },
];

// In component
{rooms.map(room => (
  <div key={room.id}>
    <img src={room.image} alt={room.name} />
  </div>
))}
```

## 📝 Recommended Folder Structure

```
frontend/
├── public/
│   └── images/
│       ├── logo.png
│       ├── favicon.ico
│       ├── hero/
│       │   ├── main-bg.jpg
│       │   └── about-bg.jpg
│       ├── studios/
│       │   ├── studio-a-main.jpg
│       │   ├── studio-a-thumb.jpg
│       │   ├── studio-b-main.jpg
│       │   ├── studio-b-thumb.jpg
│       │   ├── studio-c-main.jpg
│       │   └── makeup-room.jpg
│       ├── blog/
│       │   └── [blog post images]
│       └── team/
│           └── [team member photos]
└── src/
    └── assets/
        └── images/
            ├── icons/
            │   └── [svg icons]
            └── patterns/
                └── [background patterns]
```

## 🚀 After Adding Images

1. **For public images**: Just save them, they're immediately available
2. **For src/assets images**: Vite will process them during build
3. **Test locally**: Run `npm run dev` and check if images load
4. **Before deployment**: Ensure all image paths are correct

## 📌 Current Image Locations Created

✅ **`frontend/public/images/`** - Put your studio photos, hero images, logos here
✅ **`frontend/src/assets/images/`** - Put imported images, icons here

Start by adding your images to these folders!

