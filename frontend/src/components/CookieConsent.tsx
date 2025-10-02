import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import './CookieConsent.css';

export const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleAcceptRequired = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-popup">
        <div className="cookie-consent-content">
          <h3 className="cookie-consent-title">
            <i className="pi pi-info-circle"></i>
            {t('cookies.title')}
          </h3>
          <p className="cookie-consent-text">
            {t('cookies.message')}
          </p>
          <div className="cookie-consent-actions">
            <Button
              label={t('cookies.acceptAll')}
              onClick={handleAcceptAll}
              className="cookie-btn-accept"
            />
            <Button
              label={t('cookies.acceptRequired')}
              onClick={handleAcceptRequired}
              className="cookie-btn-required"
              outlined
            />
          </div>
        </div>
      </div>
    </div>
  );
};

