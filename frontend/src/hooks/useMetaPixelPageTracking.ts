import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { metaPixel } from '../utils/metaPixel';

export const useMetaPixelPageTracking = () => {
  const location = useLocation();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    metaPixel.trackPageView();
  }, [location.pathname, location.search]);
};
