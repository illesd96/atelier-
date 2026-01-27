import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pushPageView } from '../utils/gtm';

/**
 * Hook to automatically track page views in Google Tag Manager
 * when the route changes in a React SPA
 */
export const useGTMPageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Get the full URL path
    const url = location.pathname + location.search + location.hash;
    
    // Push pageview to GTM
    pushPageView(url);
  }, [location]);
};
