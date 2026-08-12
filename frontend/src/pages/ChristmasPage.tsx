import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { SEOHead } from '../components/SEO/SEOHead';
import './ChristmasPage.css';

const CHRISTMAS_BOARDS = [
  { room: 'Atelier', image: '/images/christmas/christmas-atelier.jpg' },
  { room: 'Frigyes', image: '/images/christmas/christmas-frigyes.jpg' },
  { room: 'Karinthy', image: '/images/christmas/christmas-karinthy.jpg' },
  { room: 'Terasz', image: '/images/christmas/christmas-terasz.jpg' },
  { room: 'Vitrin', image: '/images/christmas/christmas-vitrin.jpg' },
];

export const ChristmasPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const handlePrev = () =>
    setActiveIndex(prev => (prev === 0 ? CHRISTMAS_BOARDS.length - 1 : prev - 1));
  const handleNext = () =>
    setActiveIndex(prev => (prev === CHRISTMAS_BOARDS.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  return (
    <div className="christmas-page">
      <SEOHead
        title={t('christmas.title')}
        description={t('christmas.intro')}
        url="/christmas"
        image="/images/christmas/christmas-atelier.jpg"
      />

      <div className="christmas-hero">
        <h1>{t('christmas.title')}</h1>
        <p className="christmas-subtitle">{t('christmas.subtitle')}</p>
        <p className="christmas-intro">{t('christmas.intro')}</p>
        <Button
          label={t('christmas.cta')}
          icon="pi pi-calendar"
          className="christmas-cta"
          onClick={() => navigate('/booking')}
        />
      </div>

      <div className="christmas-board-grid">
        {CHRISTMAS_BOARDS.map((board, index) => (
          <div
            key={board.room}
            className="christmas-board"
            role="button"
            tabIndex={0}
            onClick={() => {
              setActiveIndex(index);
              setLightboxOpen(true);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveIndex(index);
                setLightboxOpen(true);
              }
            }}
          >
            <img
              src={board.image}
              alt={`${board.room} - ${t('christmas.title')}`}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
            <div className="christmas-board-overlay">
              <i className="pi pi-search-plus"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="christmas-footer-cta">
        <Button
          label={t('christmas.cta')}
          icon="pi pi-calendar"
          size="large"
          className="christmas-cta"
          onClick={() => navigate('/booking')}
        />
      </div>

      {lightboxOpen && (
        <div className="custom-lightbox">
          <div className="custom-lightbox-overlay" onClick={() => setLightboxOpen(false)} />
          <button
            className="custom-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <i className="pi pi-times"></i>
          </button>
          <button className="custom-lightbox-prev" onClick={handlePrev} aria-label="Previous">
            <i className="pi pi-chevron-left"></i>
          </button>
          <button className="custom-lightbox-next" onClick={handleNext} aria-label="Next">
            <i className="pi pi-chevron-right"></i>
          </button>
          <div className="custom-lightbox-content">
            <img
              src={CHRISTMAS_BOARDS[activeIndex].image}
              alt={CHRISTMAS_BOARDS[activeIndex].room}
              className="custom-lightbox-image"
            />
            <div className="custom-lightbox-counter">
              {activeIndex + 1} / {CHRISTMAS_BOARDS.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChristmasPage;
