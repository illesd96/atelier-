# 🚀 Quick SEO Implementation - Start Here!

## Step 1: Install Dependencies (5 minutes)

```bash
cd frontend
npm install
```

This will install `react-helmet-async` from the updated package.json.

## Step 2: Update App.tsx (2 minutes)

Add HelmetProvider wrapper:

```tsx
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <PrimeReactProvider>
      <HelmetProvider>  {/* ADD THIS */}
        <AuthProvider>
          <CartProvider>
            <Router>
              {/* ...rest of your app */}
            </Router>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>  {/* ADD THIS */}
    </PrimeReactProvider>
  );
}
```

## Step 3: Update Your Domain (5 minutes)

Replace `https://atelierarchilles.com` with YOUR actual domain in:

1. **frontend/src/components/SEO/SEOHead.tsx** (line 16)
2. **frontend/src/utils/structuredData.ts** (line 6)  
3. **frontend/public/sitemap.xml** (all URLs)
4. **frontend/public/robots.txt** (line 10)

## Step 4: Update Business Info (10 minutes)

In **frontend/src/utils/structuredData.ts**, update:

```typescript
"address": {
  "@type": "PostalAddress",
  "streetAddress": "YOUR ACTUAL STREET ADDRESS",  // UPDATE THIS
  "addressLocality": "Budapest",
  "postalCode": "YOUR POSTAL CODE",  // UPDATE THIS
  "addressCountry": "HU"
},
"geo": {
  "@type": "GeoCoordinates",
  "latitude": "47.497912",  // UPDATE WITH YOUR COORDINATES
  "longitude": "19.040235"  // UPDATE WITH YOUR COORDINATES
},
"telephone": "+36-XX-XXX-XXXX",  // UPDATE THIS
"email": "info@atelierarchilles.com",  // UPDATE THIS
"sameAs": [
  "https://www.facebook.com/YOUR-PAGE",  // UPDATE THIS
  "https://www.instagram.com/YOUR-PAGE",  // UPDATE THIS
  "https://www.linkedin.com/company/YOUR-PAGE"  // UPDATE THIS
]
```

**How to get your coordinates:**
1. Go to Google Maps
2. Right-click on your location
3. Copy the coordinates (first number = latitude, second = longitude)

## Step 5: Add SEO to HomePage (5 minutes)

Update **frontend/src/pages/HomePage.tsx**:

```tsx
import { SEOHead } from '../components/SEO/SEOHead';
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData';

export const HomePage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema()
    ]
  };

  return (
    <>
      <SEOHead
        title="Professional Photography Studio in Budapest"
        description="Book your photography session at Atelier Archilles. Modern studio spaces with professional equipment for portraits, fashion, and product photography."
        keywords="photography studio Budapest, photo studio rental, portrait photography"
        url="/"
        structuredData={structuredData}
      />
      
      {/* Your existing HomePage content */}
    </>
  );
};
```

## Step 6: Add SEO to Other Pages (10 minutes each)

### BookingPage
```tsx
import { SEOHead } from '../components/SEO/SEOHead';
import { getServiceSchema } from '../utils/structuredData';

export const BookingPage = () => {
  return (
    <>
      <SEOHead
        title="Book Photography Studio"
        description="Reserve your time at Atelier Archilles Budapest. Choose from modern studios with professional equipment."
        url="/booking"
        structuredData={getServiceSchema()}
      />
      {/* existing content */}
    </>
  );
};
```

### ContactPage
```tsx
import { SEOHead } from '../components/SEO/SEOHead';
import { getLocalBusinessSchema } from '../utils/structuredData';

export const ContactPage = () => {
  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Atelier Archilles photography studio in Budapest. Phone, email, and location info."
        url="/contact"
        structuredData={getLocalBusinessSchema()}
      />
      {/* existing content */}
    </>
  );
};
```

### FAQPage
```tsx
import { SEOHead } from '../components/SEO/SEOHead';
import { getFAQSchema } from '../utils/structuredData';

export const FAQPage = () => {
  const faqs = [
    { 
      question: "How do I book a studio?", 
      answer: "You can book online through our booking page. Select your date, time, and studio." 
    },
    { 
      question: "What equipment is included?", 
      answer: "All studios include professional lighting, backdrops, and photography equipment." 
    },
    // Add more FAQs
  ];

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions"
        description="Common questions about booking and using Atelier Archilles photography studio."
        url="/faq"
        structuredData={getFAQSchema(faqs)}
      />
      {/* existing content */}
    </>
  );
};
```

## Step 7: Test Your SEO (5 minutes)

### 1. Check Meta Tags
- Open your site in a browser
- Right-click → View Page Source
- Search for `<title>`, `<meta name="description">`
- Should see your updated titles and descriptions

### 2. Test Structured Data
Go to: https://search.google.com/test/rich-results
- Enter your URL
- Should see green checks for Organization, Local Business, etc.

### 3. Test Mobile-Friendly
Go to: https://search.google.com/test/mobile-friendly
- Enter your URL
- Should pass all tests

### 4. Check Page Speed
Go to: https://pagespeed.web.dev/
- Enter your URL
- Aim for 90+ score

## Step 8: Submit to Google (10 minutes)

### Google Search Console
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter your domain
4. Verify ownership (DNS TXT record or HTML file)
5. Once verified, submit sitemap:
   - Click "Sitemaps" in left menu
   - Enter: `sitemap.xml`
   - Click "Submit"

### Google My Business
1. Go to: https://business.google.com
2. Click "Add your business"
3. Fill in:
   - Business name: Atelier Archilles
   - Category: Photography Studio
   - Location: Your address
   - Phone: Your number
   - Website: Your URL
4. Verify by postcard/phone/email
5. Complete profile with:
   - Photos (10+ high-quality)
   - Services
   - Hours
   - Description

## Step 9: Monitor Results (Ongoing)

### Week 1-2
- Check if site appears in Google: `site:your-domain.com`
- Should see all your pages indexed

### Week 3-4
- Check rankings for your brand name
- Should appear #1 for "Atelier Archilles"

### Month 2-3
- Check rankings for "photography studio Budapest"
- Should start appearing in results

### Track in Google Search Console
- Click "Performance"
- See clicks, impressions, position
- Monitor which keywords bring traffic

## 🎯 Quick Wins Checklist

- [ ] Installed dependencies
- [ ] Added HelmetProvider to App.tsx
- [ ] Updated domain in all files
- [ ] Updated business info (address, phone, coordinates)
- [ ] Added SEO to HomePage
- [ ] Added SEO to BookingPage
- [ ] Added SEO to ContactPage
- [ ] Added SEO to FAQPage
- [ ] Tested structured data
- [ ] Tested mobile-friendly
- [ ] Tested page speed
- [ ] Submitted sitemap to Google
- [ ] Created Google My Business
- [ ] Added photos to Google My Business
- [ ] Verified Google My Business

## 🚨 Common Issues

**"HelmetProvider is not defined"**
- Run: `npm install` in frontend folder
- Make sure `react-helmet-async` is in package.json

**"Structured data not detected"**
- Check browser console for errors
- Make sure structuredData prop is passed to SEOHead
- Use Google's Rich Results Test to debug

**"Sitemap not found"**
- Check file exists at `frontend/public/sitemap.xml`
- Make sure it's deployed to production
- Test at: `https://your-domain.com/sitemap.xml`

**"Not ranking"**
- SEO takes 2-4 weeks to show results
- Keep creating content
- Get reviews on Google My Business
- Build backlinks

## 📞 Need More Help?

Check the full guide: **SEO_GUIDE.md**

---

**Total Setup Time: ~1 hour**  
**Expected Results: 2-4 weeks**  
**Long-term: Top rankings for your keywords** 🚀

