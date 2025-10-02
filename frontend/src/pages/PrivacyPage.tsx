import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{t('legal.privacy.title')}</h1>
        <p className="legal-updated">{t('legal.lastUpdated')}: October 2, 2025</p>

        <section>
          <h2>1. {t('legal.privacy.intro.title')}</h2>
          <p>{t('legal.privacy.intro.content')}</p>
        </section>

        <section>
          <h2>2. {t('legal.privacy.collect.title')}</h2>
          <p>{t('legal.privacy.collect.content')}</p>
          <ul>
            <li>{t('legal.privacy.collect.item1')}</li>
            <li>{t('legal.privacy.collect.item2')}</li>
            <li>{t('legal.privacy.collect.item3')}</li>
            <li>{t('legal.privacy.collect.item4')}</li>
          </ul>
        </section>

        <section>
          <h2>3. {t('legal.privacy.use.title')}</h2>
          <p>{t('legal.privacy.use.content')}</p>
        </section>

        <section>
          <h2>4. {t('legal.privacy.cookies.title')}</h2>
          <p>{t('legal.privacy.cookies.content')}</p>
        </section>

        <section>
          <h2>5. {t('legal.privacy.rights.title')}</h2>
          <p>{t('legal.privacy.rights.content')}</p>
        </section>

        <section>
          <h2>6. {t('legal.privacy.security.title')}</h2>
          <p>{t('legal.privacy.security.content')}</p>
        </section>

        <section>
          <h2>7. {t('legal.privacy.contact.title')}</h2>
          <p>{t('legal.privacy.contact.content')}</p>
        </section>
      </div>
    </div>
  );
};

