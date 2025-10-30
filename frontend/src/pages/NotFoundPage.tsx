import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { SEOHead } from '../components/SEO/SEOHead';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="404 - Oldal nem található"
        description="A keresett oldal nem található. Látogasson el a főoldalra vagy használja a navigációt."
        noindex={true}
      />
      <div className="not-found-page">
        <div className="not-found-container">
          <div className="not-found-content">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">
              {t('notFound.title', 'Oldal nem található')}
            </h2>
            <p className="not-found-text">
              {t('notFound.message', 'Sajnáljuk, a keresett oldal nem létezik vagy áthelyezésre került.')}
            </p>
            
            <div className="not-found-actions">
              <Button
                label={t('notFound.goHome', 'Vissza a főoldalra')}
                icon="pi pi-home"
                onClick={() => navigate('/')}
                className="p-button-lg"
              />
              <Button
                label={t('notFound.goBack', 'Vissza az előző oldalra')}
                icon="pi pi-arrow-left"
                onClick={() => navigate(-1)}
                className="p-button-lg p-button-outlined"
              />
            </div>

            <div className="not-found-links">
              <h3>{t('notFound.helpfulLinks', 'Hasznos linkek:')}</h3>
              <ul>
                <li>
                  <Button
                    label={t('nav.studios', 'Stúdiók')}
                    link
                    onClick={() => navigate('/')}
                  />
                </li>
                <li>
                  <Button
                    label={t('nav.booking', 'Foglalás')}
                    link
                    onClick={() => navigate('/booking')}
                  />
                </li>
                <li>
                  <Button
                    label={t('nav.faq', 'GYIK')}
                    link
                    onClick={() => navigate('/faq')}
                  />
                </li>
                <li>
                  <Button
                    label={t('nav.contact', 'Kapcsolat')}
                    link
                    onClick={() => navigate('/contact')}
                  />
                </li>
              </ul>
            </div>
          </div>

          <div className="not-found-illustration">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
              <circle cx="75" cy="85" r="10" fill="#333" />
              <circle cx="125" cy="85" r="10" fill="#333" />
              <path
                d="M 60 130 Q 100 110 140 130"
                stroke="#333"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

