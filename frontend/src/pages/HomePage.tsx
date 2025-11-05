import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { SEOHead } from '../components/SEO/SEOHead';
import { generateHomePageSchema } from '../utils/structuredData';
import ScrollingText from '../components/shared/ScrollingText';
import { OptimizedImage } from '../components/shared/OptimizedImage';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHungarian = i18n.language === 'hu';

  return (
    <>
      <SEOHead
        title={isHungarian ? "Stúdió Bérlés Budapest 11. Kerület" : "Photography Studio Rental Budapest"}
        description={isHungarian 
          ? "Professzionális fotóstúdió bérlés Budapesten, 11. kerület. 3 egyedi design stúdió (260 m²) Anna Illés építész tervezésében. Foglalj most!"
          : "Professional photography studio rental in Budapest. 3 unique design studios (260 m²) by architect Anna Illés. Book now!"
        }
        keywords="fotóstúdió bérlés budapest, stúdió bérlés, műterem bérlés, alkotótér, professzionális fotózás, természetes fény, design stúdió, 11 kerület, divatfotózás, termékfotó, katalógusfotó, lifestyle fotózás, családi fotózás, portré fotózás, forgatás, workshop helyszín, rendezvényhelyszín budapest"
        url="/"
        image="/images/studio-hero.jpg"
        structuredData={generateHomePageSchema()}
      />
      {/* Banner Section with Hero Image */}
      <section className="banner-section">
        <div className="banner-image-container">
          <div className="banner-image">
            <OptimizedImage
              src="/images/main-background.png"
              alt="Atelier Archilles fotóstúdió bérlés Budapest - professzionális stúdió tér"
              width={1600}
              height={1200}
              loading="eager"
              fetchPriority="high"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <ScrollingText 
          text="WHERE LIGHT MEETS ARTISTRY"
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
          <p className="about-studio-text">
            {t('home.about.description3')}
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
                <OptimizedImage
                  src="/images/atelier/title.png"
                  alt="Atelier stúdió - rusztikus fotóstúdió bérlés Budapest"
                  width={600}
                  height={800}
                  loading="lazy"
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
                <OptimizedImage
                  src="/images/frigyes/title.png"
                  alt="Frigyes stúdió - modern fotóstúdió bérlés Budapest"
                  width={600}
                  height={800}
                  loading="lazy"
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
                <OptimizedImage
                  src="/images/karinthy/title.png"
                  alt="Karinthy stúdió - tágas fotóstúdió bérlés Budapest"
                  width={600}
                  height={800}
                  loading="lazy"
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
          
          {/* Secure Payment Badge */}
          {/* <div className="payment-methods-section" style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-shield" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{t('footer.securePayment')}</span>
              </div>
              <img 
                src="/images/barion/barion-smart-payment-banner-EU/barion-banner-lightmode.svg" 
                alt="Barion - Accepted Payment Methods" 
                style={{ height: '50px', maxWidth: '100%' }} 
              />
            </div>
          </div> */}
        </div>
      </section>

      {/* Banner Section */}
      <section className="banner-section">
        <ScrollingText 
          text="BOOK YOUR SESSION TODAY"
        />
      </section>
    </>
  );
};


