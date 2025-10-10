import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/images/og-default.jpg',
  url,
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'hu';
  
  const siteUrl = 'https://atelier-archilles.hu';
  const siteName = 'Atelier Archilles';
  const defaultTitle = 'Atelier Archilles - Professional Photography Studio in Budapest';
  const defaultDescription = 'Book your photography session at Atelier Archilles. Modern studio spaces in Budapest with professional equipment, perfect for portraits, fashion, product photography, and more.';
  
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
  const pageImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLanguage} />
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Language Alternates */}
      <link rel="alternate" hrefLang="hu" href={`${siteUrl}/hu${url || ''}`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en${url || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLanguage === 'hu' ? 'hu_HU' : 'en_US'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Additional SEO Tags */}
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="theme-color" content="#667eea" />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="HU-BU" />
      <meta name="geo.placename" content="Budapest" />
      <meta name="geo.position" content="47.497912;19.040235" />
      <meta name="ICBM" content="47.497912, 19.040235" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

