import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{t('legal.terms.title')}</h1>
        <p className="legal-updated">{t('legal.lastUpdated')}: October 20, 2025</p>
        
        <div className="legal-download" style={{
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <a 
            href="/documents/Atelier-Archilles_Terms_and_Conditions_v251020.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-button p-button-primary"
            style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}
          >
            <i className="pi pi-file-pdf"></i>
            {t('legal.downloadPDF')}
          </a>
        </div>

        <section>
          <h2>1. {t('legal.terms.acceptance.title')}</h2>
          <p>{t('legal.terms.acceptance.content')}</p>
        </section>

        <section>
          <h2>2. {t('legal.terms.bookings.title')}</h2>
          <p>{t('legal.terms.bookings.content1')}</p>
          <p>{t('legal.terms.bookings.content2')}</p>
        </section>

        <section>
          <h2>3. {t('legal.terms.payment.title')}</h2>
          <p>{t('legal.terms.payment.content1')}</p>
          <p>{t('legal.terms.payment.content2')}</p>
          
          <h3>{t('legal.terms.payment.barion.title')}</h3>
          <p>{t('legal.terms.payment.barion.description')}</p>
          <div className="payment-logo" style={{display: 'flex', justifyContent: 'center', margin: '1.5rem 0'}}>
            <img 
              src="/images/barion/barion-smart-payment-banner-EU/barion-banner-lightmode.svg" 
              alt="Barion - Accepted Payment Methods" 
              style={{height: '50px', maxWidth: '100%'}} 
            />
          </div>
          <p><strong>{t('legal.terms.payment.barion.security')}</strong></p>
          <p>{t('legal.terms.payment.barion.securityDetails')}</p>
          
          <h3>{t('legal.terms.payment.fulfillment.title')}</h3>
          <p>{t('legal.terms.payment.fulfillment.description')}</p>
        </section>

        <section>
          <h2>4. {t('legal.terms.cancellation.title')}</h2>
          <p>{t('legal.terms.cancellation.content1')}</p>
          <p>{t('legal.terms.cancellation.content2')}</p>
        </section>

        <section>
          <h2>5. {t('legal.terms.studio.title')}</h2>
          <p>{t('legal.terms.studio.content')}</p>
        </section>

        <section>
          <h2>6. {t('legal.terms.liability.title')}</h2>
          <p>{t('legal.terms.liability.content')}</p>
        </section>

        <section>
          <h2>7. {t('legal.terms.contact.title')}</h2>
          <p>{t('legal.terms.contact.content')}</p>
        </section>
      </div>
    </div>
  );
};

