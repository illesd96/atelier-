import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface BusinessConfig {
  hourlyRate: number;
  currency: string;
  openingHours: { start: number; end: number };
  studios: Array<{ id: string; name: string }>;
}

interface ConfigContextType {
  config: BusinessConfig | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await api.getConfig();
        setConfig(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        // Set default fallback config
        setConfig({
          hourlyRate: 15000,
          currency: 'HUF',
          openingHours: { start: 8, end: 20 },
          studios: [
            { id: 'studio-a', name: 'Atelier' },
            { id: 'studio-b', name: 'Frigyes' },
            { id: 'studio-c', name: 'Karinthy' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

