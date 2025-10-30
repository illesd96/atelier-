/**
 * Structured Data (Schema.org JSON-LD) for SEO
 * Atelier Archilles - Photography Studio Rental Budapest
 */

const SITE_URL = 'https://www.atelier-archilles.hu';
const BUSINESS_NAME = 'Atelier Archilles';

// Business Information
export const businessInfo = {
  name: BUSINESS_NAME,
  alternateName: 'Atelier Archilles Fotóstúdió',
  description: 'Professional photography studio rental in Budapest. 3 unique design studios (260 m²) designed by architect Anna Illés. Perfect for portrait, fashion, product and commercial photography.',
  url: SITE_URL,
  telephone: '+36309747362',
  email: 'anna@archilles.hu',
  address: {
    streetAddress: 'Karinthy Frigyes út 19',
    addressLocality: 'Budapest',
    addressRegion: 'Budapest',
    postalCode: '1111',
    addressCountry: 'HU',
  },
  geo: {
    latitude: 47.476205,
    longitude: 19.052146,
  },
  openingHours: 'Mo-Su 08:00-20:00',
  priceRange: '€€',
  image: `${SITE_URL}/images/studio-hero.jpg`,
  logo: `${SITE_URL}/fav/favicon.svg`,
  founder: {
    name: 'Anna Illés',
    jobTitle: 'Architect & Designer',
  },
};

/**
 * Organization Schema - Main business entity
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organization`,
  name: businessInfo.name,
  alternateName: businessInfo.alternateName,
  url: businessInfo.url,
  logo: businessInfo.logo,
  image: businessInfo.image,
  description: businessInfo.description,
  telephone: businessInfo.telephone,
  email: businessInfo.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.streetAddress,
    addressLocality: businessInfo.address.addressLocality,
    addressRegion: businessInfo.address.addressRegion,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: businessInfo.geo.latitude,
    longitude: businessInfo.geo.longitude,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '08:00',
    closes: '20:00',
  },
  priceRange: businessInfo.priceRange,
  sameAs: [
    'https://www.facebook.com/atelierarchilles',
    'https://www.instagram.com/atelier_archilles/',
    'https://www.archilles.hu/',
  ],
  founder: {
    '@type': 'Person',
    name: businessInfo.founder.name,
    jobTitle: businessInfo.founder.jobTitle,
  },
  areaServed: {
    '@type': 'City',
    name: 'Budapest',
    '@id': 'https://www.wikidata.org/wiki/Q1781',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Photography Studio Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Studio Rental',
          description: 'Hourly rental of professional photography studios',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Portrait Photography Studio',
          description: 'Studio space for portrait photography sessions',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fashion Photography Studio',
          description: 'Professional studio for fashion photography',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Product Photography Studio',
          description: 'Studio space for commercial product photography',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Commercial Photography Studio',
          description: 'Professional studio for commercial photography projects',
        },
      },
    ],
  },
});

/**
 * Local Business Schema - For Google Maps and local search
 */
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#localbusiness`,
  name: businessInfo.name,
  image: businessInfo.image,
  url: businessInfo.url,
  telephone: businessInfo.telephone,
  email: businessInfo.email,
  priceRange: businessInfo.priceRange,
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.streetAddress,
    addressLocality: businessInfo.address.addressLocality,
    addressRegion: businessInfo.address.addressRegion,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: businessInfo.geo.latitude,
    longitude: businessInfo.geo.longitude,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '08:00',
    closes: '20:00',
  },
  paymentAccepted: 'Card, Online Payment',
  currenciesAccepted: 'HUF',
});

/**
 * Website Schema
 */
export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: businessInfo.name,
  description: businessInfo.description,
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/booking?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['hu-HU', 'en-US'],
});

/**
 * Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`,
  })),
});

/**
 * Service Schema - For specific services
 */
export const generateServiceSchema = (service: {
  name: string;
  description: string;
  price?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: service.name,
  description: service.description,
  provider: {
    '@id': `${SITE_URL}/#organization`,
  },
  areaServed: {
    '@type': 'City',
    name: 'Budapest',
  },
  ...(service.price && {
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'HUF',
    },
  }),
});

/**
 * FAQ Schema - For FAQ page
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Article Schema - For blog posts
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    '@type': 'Person',
    name: article.author || 'Atelier Archilles',
  },
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': SITE_URL,
  },
});

/**
 * Place Schema - For location-specific pages
 */
export const generatePlaceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: businessInfo.name,
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.streetAddress,
    addressLocality: businessInfo.address.addressLocality,
    addressRegion: businessInfo.address.addressRegion,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: businessInfo.geo.latitude,
    longitude: businessInfo.geo.longitude,
  },
  hasMap: `https://www.google.com/maps?q=${businessInfo.geo.latitude},${businessInfo.geo.longitude}`,
  additionalProperty: {
    '@type': 'PropertyValue',
    name: 'Nearest Metro',
    value: 'Móricz Zsigmond körtér',
  },
});

/**
 * Event Schema - For special events or workshops
 */
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    '@type': 'Place',
    name: event.location || businessInfo.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address.streetAddress,
      addressLocality: businessInfo.address.addressLocality,
      postalCode: businessInfo.address.postalCode,
      addressCountry: businessInfo.address.addressCountry,
    },
  },
  organizer: {
    '@id': `${SITE_URL}/#organization`,
  },
});

/**
 * Combined schema for home page
 */
export const generateHomePageSchema = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateLocalBusinessSchema(),
    generatePlaceSchema(),
  ],
});
