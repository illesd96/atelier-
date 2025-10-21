import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import ScrollingText from '../components/shared/ScrollingText';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {/* Banner Section with Hero Image */}
      <section className="banner-section">
        <div className="banner-image-container">
          <div className="banner-image">
            <img
              src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&h=1200&fit=crop"
              alt="Atelier Archilles Studio"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <ScrollingText 
          text="WHERE LIGHT MEETS ARTISTRY"
          speed={60}
        />
      </section>

      {/* About Studio Section */}
      <section className="about-studio-section">
        <div className="about-studio-content">
          <h1 className="about-studio-text">
            {t('home.about.heading')}
          </h1>
          <p className="about-studio-text">
            <span className="about-studio-bold-text uppercase">Atelier Archilles</span> {t('home.about.description1')}
          </p>
          <p className="about-studio-text">
            {t('home.about.description2')}
          </p>
        </div>
      </section>

      {/* Studios Section */}
      <section className="studios-section">
        <div className="container">
          <h2 className="studios-section-title">{t('home.studios.sectionTitle')}</h2>
          <div className="studios-grid">
            {/* Studio A - Rustic */}
            <div className="studio-card" onClick={() => navigate('/rooms/studio-a')}>
              <div className="studio-card-image">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=800&fit=crop"
                  alt="Rustic Studio"
                />
              </div>
              <div className="studio-card-content">
                <h3 className="studio-card-title">{t('studios.studioA.cardTitle')}</h3>
                <p className="studio-card-description">
                  {t('studios.studioA.cardDescription')}
                </p>
                <Button
                  label={t('common.viewDetails')}
                  className="studio-card-button"
                  text
                  icon="pi pi-arrow-right"
                  iconPos="right"
                />
              </div>
            </div>

            {/* Studio B - Clay */}
            <div className="studio-card" onClick={() => navigate('/rooms/studio-b')}>
              <div className="studio-card-image">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=800&fit=crop"
                  alt="Clay Studio"
                />
              </div>
              <div className="studio-card-content">
                <h3 className="studio-card-title">{t('studios.studioB.cardTitle')}</h3>
                <p className="studio-card-description">
                  {t('studios.studioB.cardDescription')}
                </p>
                <Button
                  label={t('common.viewDetails')}
                  className="studio-card-button"
                  text
                  icon="pi pi-arrow-right"
                  iconPos="right"
                />
              </div>
            </div>

            {/* Studio C - Lost */}
            <div className="studio-card" onClick={() => navigate('/rooms/studio-c')}>
              <div className="studio-card-image">
                <img
                  src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=600&h=800&fit=crop"
                  alt="Lost Studio"
                />
              </div>
              <div className="studio-card-content">
                <h3 className="studio-card-title">{t('studios.studioC.cardTitle')}</h3>
                <p className="studio-card-description">
                  {t('studios.studioC.cardDescription')}
                </p>
                <Button
                  label={t('common.viewDetails')}
                  className="studio-card-button"
                  text
                  icon="pi pi-arrow-right"
                  iconPos="right"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Studio Section */}
      <section className="about-studio-section">
        <div className="about-studio-content">
          <p className="about-studio-text">
            {t('home.closing.text1')}
          </p>
          <p className="about-studio-text">
            <span className="about-studio-bold-text uppercase">{t('home.closing.text2')}</span>
          </p>
        </div>
      </section>

      {/* Banner Section */}
      <section className="banner-section">
        <ScrollingText 
          text="BOOK YOUR SESSION TODAY"
          speed={60}
        />
      </section>
    </>
  );
};


