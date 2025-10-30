# SEO Meta Tags for All Pages - Atelier Archilles

## 🏠 Homepage (/)

### Hungarian (Primary)
```tsx
<SEOHead
  title="Stúdió Bérlés Budapest | Professional Photography Studio Rental"
  description="Professzionális fotóstúdió bérlés Budapesten, 11. kerület. 3 egyedi design stúdió (260 m²) Anna Illés építész tervezésében. Tökéletes portré, divat, termék és commercial fotózáshoz. Foglalj órán keresztül!"
  keywords="stúdió bérlés budapest, fotóstúdió bérlés, stúdió kiadó budapest, professzionális stúdió bérlés, fotózás helyszín budapest, design stúdió budapest, modern fotóstúdió, stúdió bérlés óránként, portré fotózás stúdió, 11. kerület stúdió"
  url="/"
  image="/images/studio-hero.jpg"
  structuredData={generateHomePageSchema()}
/>
```

### English
```tsx
<SEOHead
  title="Photography Studio Rental Budapest | Professional Photo Studio"
  description="Professional photography studio rental in Budapest. 3 unique design studios (260 m²) by architect Anna Illés. Perfect for portrait, fashion, product, and commercial photography. Book by the hour!"
  keywords="photography studio rental budapest, photo studio for rent budapest, professional photo studio, studio space rental, photography location budapest"
  url="/en"
  image="/images/studio-hero.jpg"
  structuredData={generateHomePageSchema()}
/>
```

---

## 📅 Booking Page (/booking)

### Hungarian
```tsx
<SEOHead
  title="Stúdió Foglalás | Fotóstúdió Bérlés Online Budapesten"
  description="Foglalj stúdiót online Budapesten! 3 egyedi terem: Atelier (120m²), Frigyes (80m²), Karinthy (60m²). Óránkénti bérlés, rugalmas időpontok, professzionális felszerelés. Azonnali foglalás!"
  keywords="stúdió foglalás budapest, fotóstúdió bérlés online, stúdió időpontfoglalás, fotó helyszín bérlés, design stúdió kiadó"
  url="/booking"
  structuredData={generateServiceSchema({
    name: 'Stúdió Bérlés Szolgáltatás',
    description: 'Professzionális fotóstúdió bérlés óránként vagy teljes napra',
    price: '15000'
  })}
/>
```

### English
```tsx
<SEOHead
  title="Studio Booking | Photography Studio Rental Online Budapest"
  description="Book a photography studio online in Budapest! 3 unique rooms: Atelier (120m²), Frigyes (80m²), Karinthy (60m²). Hourly rental, flexible times, professional equipment. Instant booking!"
  keywords="studio booking budapest, photography studio rental online, photo studio booking, studio space for rent, design studio rental"
  url="/en/booking"
  structuredData={generateServiceSchema({
    name: 'Studio Rental Service',
    description: 'Professional photography studio rental by the hour or full day',
    price: '15000'
  })}
/>
```

---

## ❓ FAQ Page (/faq)

### Hungarian
```tsx
<SEOHead
  title="Gyakori Kérdések | Stúdió Bérlés GYIK - Atelier Archilles"
  description="Válaszok a fotóstúdió bérléssel kapcsolatos gyakori kérdésekre. Árak, felszerelés, foglalási folyamat, lemondási feltételek és minden amit tudnod kell a stúdióbérlésről."
  keywords="stúdió bérlés gyik, fotóstúdió árak, stúdió bérlés feltételek, fotóstúdió felszerelés, foglalás menete"
  url="/faq"
  structuredData={generateFAQSchema(faqItems)}
/>
```

---

## 📞 Contact Page (/contact)

### Hungarian
```tsx
<SEOHead
  title="Kapcsolat | Fotóstúdió Elérhetőség Budapest 11. kerület"
  description="Lépj kapcsolatba velünk! Atelier Archilles stúdió: Karinthy Frigyes út 19, Budapest 1111. Tel: +36 30 974 7362. Email: anna@archilles.hu. Móricz Zsigmond körtér közelében."
  keywords="fotóstúdió kapcsolat budapest, stúdió elérhetőség, atelier archilles cím, 11 kerület fotóstúdió, karinthy frigyes út stúdió"
  url="/contact"
  structuredData={generatePlaceSchema()}
/>
```

---

## 🏢 Studio Room Pages (Individual Studios)

### Atelier Room
```tsx
<SEOHead
  title="Atelier Stúdió (120m²) - Legnagyobb Fotóstúdió Bérlés Budapest"
  description="Az Atelier a legnagyobb stúdiónk (120 m²) rusztikus berendezéssel és természetes színekkel. Tökéletes nagyobb projektek, csoportos fotózások és fashion shootok számára."
  keywords="legnagyobb stúdió budapest, 120m2 fotóstúdió, rusztikus stúdió, fashion fotózás stúdió, csoportos fotózás"
  url="/studios/atelier"
/>
```

### Frigyes Room
```tsx
<SEOHead
  title="Frigyes Stúdió (80m²) - Modern Design Fotóstúdió Budapest"
  description="A Frigyes stúdió (80 m²) modern, minimalista designnal. Ideális portré, divat és commercial fotózásokhoz. Professzionális világítás és háttér opciók."
  keywords="modern stúdió budapest, 80m2 fotóstúdió, minimalista stúdió, portré fotózás, divat fotózás"
  url="/studios/frigyes"
/>
```

### Karinthy Room
```tsx
<SEOHead
  title="Karinthy Stúdió (60m²) - Intim Fotóstúdió Bérlés Budapest"
  description="A Karinthy (60 m²) intim, barátságos terem személyes projektekhez. Tökéletes portré, termék és kisebb csoportos fotózásokhoz."
  keywords="kis stúdió budapest, 60m2 fotóstúdió, portré stúdió, termék fotózás, intim fotóstúdió"
  url="/studios/karinthy"
/>
```

---

## 📝 Terms & Privacy Pages

### Terms
```tsx
<SEOHead
  title="Általános Szerződési Feltételek | Atelier Archilles"
  description="Atelier Archilles stúdióbérlés általános szerződési feltételei, foglalási szabályzat és lemondási feltételek."
  url="/terms"
  noindex={false}  // Important for transparency
/>
```

### Privacy
```tsx
<SEOHead
  title="Adatvédelmi Tájékoztató | Atelier Archilles"
  description="Atelier Archilles adatvédelmi szabályzata és GDPR megfelelési információk."
  url="/privacy"
  noindex={false}
/>
```

---

## 📱 User Pages (Should be noindex)

### Login
```tsx
<SEOHead
  title="Bejelentkezés | Atelier Archilles"
  description="Jelentkezz be a fiókodba a foglalásaid kezeléséhez."
  url="/login"
  noindex={true}
/>
```

### Register
```tsx
<SEOHead
  title="Regisztráció | Atelier Archilles"
  description="Hozz létre fiókot a gyorsabb foglaláshoz és kedvezmények eléréséhez."
  url="/register"
  noindex={true}
/>
```

### Profile
```tsx
<SEOHead
  title="Fiókom | Atelier Archilles"
  description="Kezeld foglalásaidat és fiókbeállításaidat."
  url="/profile"
  noindex={true}
/>
```

### Checkout
```tsx
<SEOHead
  title="Fizetés | Atelier Archilles"
  description="Foglalás véglegesítése és fizetés."
  url="/checkout"
  noindex={true}
/>
```

---

## 📊 Blog Posts (Example Template)

```tsx
<SEOHead
  title="[Blog Title] | Atelier Archilles Blog"
  description="[Blog excerpt/summary - 150-160 characters]"
  keywords="[blog-specific keywords]"
  url="/blog/[slug]"
  type="article"
  structuredData={generateArticleSchema({
    title: '[Blog Title]',
    description: '[Description]',
    image: '[Featured Image URL]',
    datePublished: '2025-10-30',
    author: 'Atelier Archilles'
  })}
/>
```

---

## 🎯 SEO Best Practices Applied

### ✅ Title Tags (50-60 characters)
- Include primary keyword
- Brand name at end
- Hungarian first, English secondary
- Compelling and descriptive

### ✅ Meta Descriptions (150-160 characters)
- Include primary and secondary keywords naturally
- Call-to-action included
- Unique for each page
- Compelling value proposition

### ✅ Keywords
- Focus on studio rental terms
- Include location (Budapest, 11. kerület)
- Mix of Hungarian and English
- Long-tail keywords included

### ✅ Structured Data
- Organization schema on every page
- Service schema on booking pages
- Local business schema on contact page
- FAQ schema on FAQ page

---

## 📍 Local SEO Focus

### Priority Keywords by Search Intent:

**Transactional (Highest Priority - People ready to book):**
1. stúdió bérlés budapest
2. fotóstúdió bérlés
3. stúdió kiadó budapest
4. stúdió foglalás budapest

**Informational (Medium Priority - People researching):**
5. fotóstúdió árak budapest
6. professzionális stúdió budapest
7. legjobb fotóstúdió budapest
8. design stúdió budapest

**Navigational (Lower Priority - Brand searches):**
9. atelier archilles
10. karinthy fotóstúdió
11. anna illés stúdió

---

## 🌐 Multi-Language Strategy

### URL Structure:
- **Default (Hungarian):** `https://www.atelier-archilles.hu/`
- **English:** `https://www.atelier-archilles.hu/en/`

### Hreflang Implementation:
Already included in SEOHead component:
```html
<link rel="alternate" hreflang="hu" href="https://www.atelier-archilles.hu/" />
<link rel="alternate" hreflang="en" href="https://www.atelier-archilles.hu/en/" />
<link rel="alternate" hreflang="x-default" href="https://www.atelier-archilles.hu/" />
```

---

## 📈 Expected Results

### Month 1-2:
- Rank for brand name "Atelier Archilles"
- Appear for "stúdió bérlés budapest 11 kerület"
- Google My Business active and appearing

### Month 3-4:
- Top 20 for "stúdió bérlés budapest"
- Top 10 for "fotóstúdió bérlés 11 kerület"
- Multiple page 1 rankings for long-tail keywords

### Month 6+:
- Top 10 for "stúdió bérlés budapest"
- Top 5 for "fotóstúdió bérlés 11 kerület"
- Consistent organic traffic: 50-100 visits/month
- 5-10 booking inquiries from SEO per month

---

## 🚀 Next Steps

1. **Implement SEOHead on all pages** ✅
2. **Submit sitemap to Google Search Console**
3. **Create and verify Google My Business**
4. **Get first 5 Google reviews**
5. **Create 1-2 blog posts per month**
6. **Monitor rankings weekly**
7. **Optimize based on search console data**

Remember: SEO is a long-term investment. Consistency is key! 🎯

