import { useGTMPageTracking } from '../hooks/useGTMPageTracking';

/**
 * Component that tracks page views in Google Tag Manager
 * Place this inside the Router component
 */
export const GTMPageTracker: React.FC = () => {
  useGTMPageTracking();
  return null;
};
