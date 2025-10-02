import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{t('legal.terms.title')}</h1>
        <p className="legal-updated">{t('legal.lastUpdated')}: October 2, 2025</p>

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

