import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { getRoomById } from '../data/rooms';
import './RoomDetailPage.css';

export const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [displayCustom, setDisplayCustom] = useState<boolean>(false);

  const room = roomId ? getRoomById(roomId) : null;
  const currentLang = i18n.language as 'hu' | 'en';

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [roomId]);

  if (!room) {
    return (
      <div className="room-not-found">
        <h1>{t('common.notFound')}</h1>
        <Button label={t('common.backHome')} onClick={() => navigate('/')} />
      </div>
    );
  }

  const handlePrevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? room.galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveIndex((prev) => (prev === room.galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!displayCustom) return;
    if (e.key === 'Escape') setDisplayCustom(false);
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayCustom, activeIndex]);

  return (
    <div className="room-detail-page">
      {/* Hero Section */}
      <div 
        className="room-hero" 
        style={{ backgroundImage: `url(${room.heroImage})` }}
      >
        <div className="room-hero-overlay">
          <div className="room-hero-content">
            <div className="room-hero-text">
              <h1 className="room-hero-title">{room.title[currentLang]}</h1>
              <p className="room-hero-subtitle">{room.subtitle[currentLang]}</p>
              <Button 
                label={t('booking.title')}
                icon="pi pi-calendar"
                className="room-hero-button"
                onClick={() => navigate('/booking')}
              />
            </div>
            <div className="room-hero-features">
              {room.features[currentLang].map((feature, index) => (
                <div key={index} className="room-hero-feature">
                  <i className="pi pi-check"></i>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="room-description-section">
        <div className="container">
          <h2>{room.name}</h2>
          <p className="room-description">{room.description[currentLang]}</p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="room-gallery-section">
        <div className="container">
          <h2>{t('common.gallery')}</h2>
          <div className="room-gallery-grid">
            {room.galleryImages.map((image, index) => (
              <div 
                key={index} 
                className="gallery-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Gallery item clicked:', index);
                  setActiveIndex(index);
                  setDisplayCustom(true);
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveIndex(index);
                    setDisplayCustom(true);
                  }
                }}
              >
                <img src={image} alt={`${room.name} ${index + 1}`} />
                <div className="gallery-item-overlay">
                  <i className="pi pi-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Lightbox Viewer */}
      {displayCustom && (
        <div className="custom-lightbox">
          {/* Background overlay */}
          <div 
            className="custom-lightbox-overlay"
            onClick={() => setDisplayCustom(false)}
          />
          
          {/* Close button */}
          <button 
            className="custom-lightbox-close"
            onClick={() => setDisplayCustom(false)}
            aria-label="Close"
          >
            <i className="pi pi-times"></i>
          </button>
          
          {/* Previous button */}
          <button 
            className="custom-lightbox-prev"
            onClick={handlePrevImage}
            aria-label="Previous"
          >
            <i className="pi pi-chevron-left"></i>
          </button>
          
          {/* Next button */}
          <button 
            className="custom-lightbox-next"
            onClick={handleNextImage}
            aria-label="Next"
          >
            <i className="pi pi-chevron-right"></i>
          </button>
          
          {/* Image container */}
          <div className="custom-lightbox-content">
            <img 
              src={room.galleryImages[activeIndex]} 
              alt={`${room.name} ${activeIndex + 1}`}
              className="custom-lightbox-image"
            />
            <div className="custom-lightbox-counter">
              {activeIndex + 1} / {room.galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="room-cta-section-simple">
        <div className="container text-center">
          <Button
            label={t('booking.title')}
            icon="pi pi-calendar"
            size="large"
            onClick={() => navigate('/booking')}
            className="cta-button-simple"
          />
        </div>
      </div>
    </div>
  );
};

