import { useMetaPixelPageTracking } from '../hooks/useMetaPixelPageTracking';

export const MetaPixelPageTracker: React.FC = () => {
  useMetaPixelPageTracking();
  return null;
};
