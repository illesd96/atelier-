import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Optimized image component with proper attributes for SEO and performance
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  fetchPriority = 'auto',
}) => {
  // For external images (Unsplash), add format and quality parameters
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&fm=webp&q=80&auto=format` 
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
};

