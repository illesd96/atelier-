import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import ScrollingText from '../components/shared/ScrollingText';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/booking');
  };

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
          speed={120}
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

      {/* Studios Section - Studio A */}
      <div className="section">
        <div className="container">
          <div className="grid grid-7-5 items-center">
            <div>
              <h2 className="title-medium uppercase">{t('studios.studioA.title')}</h2>
              <p className="text-content">
                {t('studios.studioA.description1')}
              </p>
              <p className="text-content">
                {t('studios.studioA.description2')}
              </p>
              <Button
                label={t('studios.bookStudio')}
                onClick={handleBookNow}
                className="mt-4"
                icon="pi pi-calendar"
              />
            </div>
            <div>
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop"
                  alt="Studio A"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studios Section - Studio B */}
      <div className="section">
        <div className="container">
          <div className="grid grid-5-7 items-center">
            <div>
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800&h=1000&fit=crop"
                  alt="Studio B"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div>
              <h2 className="title-medium uppercase">{t('studios.studioB.title')}</h2>
              <p className="text-content">
                {t('studios.studioB.description1')}
              </p>
              <p className="text-content">
                {t('studios.studioB.description2')}
              </p>
              <Button
                label={t('studios.bookStudio')}
                onClick={handleBookNow}
                className="mt-4"
                icon="pi pi-calendar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Studios Section - Studio C */}
      <div className="section">
        <div className="container">
          <div className="grid grid-7-5 items-center">
            <div>
              <h2 className="title-medium uppercase">{t('studios.studioC.title')}</h2>
              <p className="text-content">
                {t('studios.studioC.description1')}
              </p>
              <p className="text-content">
                {t('studios.studioC.description2')}
              </p>
              <Button
                label={t('studios.bookStudio')}
                onClick={handleBookNow}
                className="mt-4"
                icon="pi pi-calendar"
              />
            </div>
            <div>
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&h=1000&fit=crop"
                  alt="Studio C"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studios Section - Makeup Studio */}
      <div className="section">
        <div className="container">
          <div className="grid grid-5-7 items-center">
            <div>
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=1000&fit=crop"
                  alt="Makeup Studio"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div>
              <h2 className="title-medium uppercase">{t('studios.makeup.title')}</h2>
              <p className="text-content">
                {t('studios.makeup.description1')}
              </p>
              <p className="text-content">
                {t('studios.makeup.description2')}
              </p>
              <Button
                label={t('studios.bookStudio')}
                onClick={handleBookNow}
                className="mt-4"
                icon="pi pi-calendar"
              />
            </div>
          </div>
        </div>
      </div>

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
          speed={120}
        />
      </section>
    </>
  );
};


