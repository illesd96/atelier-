/**
 * Structured Data (JSON-LD) generators for SEO
 * https://developers.google.com/search/docs/appearance/structured-data
 */

const siteUrl = 'https://atelier-archilles.hu';

/**
 * Organization structured data
 */
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "PhotographyBusiness",
  "@id": `${siteUrl}/#organization`,
  "name": "Atelier Archilles",
  "alternateName": "Atelier Archilles Photography Studio",
  "url": siteUrl,
  "logo": {
    "@type": "ImageObject",
    "url": `${siteUrl}/images/logo.png`,
    "width": "512",
    "height": "512"
  },
  "image": `${siteUrl}/images/studio-main.jpg`,
  "description": "Professional photography studio in Budapest offering studio rental, portrait photography, fashion shoots, product photography, and event photography services.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Vak Bottyán utca 3. 6. emelet 1. ajtó",
    "addressLocality": "Budapest",
    "postalCode": "1111",
    "addressCountry": "HU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "47.4797",
    "longitude": "19.0548"
  },
  "telephone": "+36309747362",
  "email": "info@atelierarchilles.com",
  "taxID": "32265105143",
  "legalName": "Archilles Studio Korlátolt Felelősségű Társaság",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "$$",
  "currenciesAccepted": "HUF",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "areaServed": {
    "@type": "City",
    "name": "Budapest"
  },
  "sameAs": [
    "https://www.facebook.com/atelierarchilles",
    "https://www.instagram.com/atelierarchilles",
    "https://www.linkedin.com/company/atelierarchilles"
  ]
});

/**
 * Website structured data
 */
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  "url": siteUrl,
  "name": "Atelier Archilles",
  "description": "Professional photography studio rental and photography services in Budapest",
  "publisher": {
    "@id": `${siteUrl}/#organization`
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": ["hu", "en"]
});

/**
 * Service structured data
 */
export const getServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Photography Studio Rental",
  "provider": {
    "@id": `${siteUrl}/#organization`
  },
  "areaServed": {
    "@type": "City",
    "name": "Budapest"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Photography Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Studio A Rental",
          "description": "Perfect for portrait photography"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Studio B Rental",
          "description": "Ideal for product photography"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Studio C Rental",
          "description": "Great for fashion shoots"
        }
      }
    ]
  }
});

/**
 * Breadcrumb structured data
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${siteUrl}${item.url}`
  }))
});

/**
 * FAQ structured data
 */
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

/**
 * Blog post structured data
 */
export const getBlogPostSchema = (post: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.description,
  "image": post.image,
  "datePublished": post.datePublished,
  "dateModified": post.dateModified || post.datePublished,
  "author": {
    "@type": "Person",
    "name": post.author
  },
  "publisher": {
    "@id": `${siteUrl}/#organization`
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${siteUrl}${post.url}`
  }
});

/**
 * Local Business Schema (for Google Maps)
 */
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#localbusiness`,
  "name": "Atelier Archilles",
  "image": `${siteUrl}/images/studio-exterior.jpg`,
  "description": "Professional photography studio in Budapest offering studio rental and photography services",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Budapest",
    "postalCode": "1000",
    "addressCountry": "HU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.497912,
    "longitude": 19.040235
  },
  "url": siteUrl,
  "telephone": "+36-XX-XXX-XXXX",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  ]
});

