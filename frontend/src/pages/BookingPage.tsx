import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { StudioGrid } from '../components/StudioGrid';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../contexts/CartContext';
import { barionPixel } from '../utils/barionPixel';
import './BookingPage.css';

export const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removePastAppointments } = useCart();
  const [cartVisible, setCartVisible] = useState(false);

  // Clean up past appointments when page opens
  useEffect(() => {
    const removedCount = removePastAppointments();
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} past appointment(s) from cart`);
    }
    
    // Track page view with Barion Pixel
    barionPixel.trackPageView();
  }, [removePastAppointments]);

  const handleCartUpdate = () => {
    // Cart state is automatically synchronized via Context
  };

  const handleCheckout = () => {
    setCartVisible(false);
    navigate('/checkout');
  };

  const cartItemCount = items.length;

  return (
    <div className="booking-page">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900 m-0">
          {t('booking.title')}
        </h1>
      </div>

      {/* Rental Information Section */}
      <div className="rental-info-section">
        <h2 className="rental-info-title">{t('booking.rentalDetails.title')}</h2>
        <div className="rental-info-grid">
          <div className="rental-info-card">
            <h3>{t('booking.rentalDetails.basicInfo.title')}</h3>
            <p>{t('booking.rentalDetails.basicInfo.description')}</p>
          </div>

          <div className="rental-info-card">
            <h3>{t('booking.rentalDetails.workshop.title')}</h3>
            <p>{t('booking.rentalDetails.workshop.description')}</p>
          </div>

          <div className="rental-info-card rental-info-card-wide">
            <h3>{t('booking.rentalDetails.process.title')}</h3>
            <div className="rental-process-content">
              <p>{t('booking.rentalDetails.process.intro')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('booking.rentalDetails.process.cartInfo') }} />
              <p>{t('booking.rentalDetails.process.personalInfo')}</p>
              <p>{t('booking.rentalDetails.process.payment')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('booking.rentalDetails.process.confirmation') }} />
              <p dangerouslySetInnerHTML={{ __html: t('booking.rentalDetails.process.questions') }} />
            </div>
          </div>
        </div>
      </div>

      <StudioGrid onCartUpdate={handleCartUpdate} />

      {/* Floating Cart Button */}
      <Button
        icon="pi pi-shopping-cart"
        onClick={() => setCartVisible(true)}
        className="floating-cart-button"
        severity="secondary"
        rounded
        size="large"
        aria-label={`${t('booking.cart')} (${cartItemCount})`}
      >
        {cartItemCount > 0 && (
          <Badge 
            value={cartItemCount} 
            severity="danger" 
            className="floating-cart-badge"
          />
        )}
      </Button>

      <CartDrawer
        visible={cartVisible}
        onHide={() => setCartVisible(false)}
        onCheckout={handleCheckout}
      />

      <Toast />
    </div>
  );
};


