import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Galleria } from 'primereact/galleria';
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

  const itemTemplate = (item: string) => {
    return <img src={item} alt={room.name} style={{ width: '100%', display: 'block' }} />;
  };

  const thumbnailTemplate = (item: string) => {
    return <img src={item} alt={room.name} style={{ width: '100%', display: 'block' }} />;
  };

  const responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

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

      {/* Lightbox Viewer */}
      <div style={{ display: displayCustom ? 'block' : 'none' }}>
        <Galleria
          value={room.galleryImages}
          activeIndex={activeIndex}
          onItemChange={(e) => setActiveIndex(e.index)}
          responsiveOptions={responsiveOptions}
          numVisible={7}
          style={{ maxWidth: '95vw', display: displayCustom ? 'block' : 'none' }}
          circular
          fullScreen
          showItemNavigators
          showThumbnails={false}
          item={itemTemplate}
          thumbnail={thumbnailTemplate}
        />
      </div>
      
      {/* Close button overlay for gallery */}
      {displayCustom && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}
          onClick={() => {
            console.log('Close button clicked');
            setDisplayCustom(false);
          }}
        >
          ×
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

