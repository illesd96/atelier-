import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { StudioGrid } from '../components/StudioGrid';
import { CartDrawer } from '../components/CartDrawer';
import { FixedCart } from '../components/FixedCart';
import { useCart } from '../contexts/CartContext';
import './BookingPage.css';

export const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items } = useCart();
  const [cartVisible, setCartVisible] = useState(false);

  const handleCartUpdate = () => {
    // Cart state is automatically synchronized via Context
  };

  const handleCheckout = () => {
    setCartVisible(false);
    navigate('/checkout');
  };

  const cartItemCount = items.length;

  return (
    <div className="booking-page-container">
      <div className="booking-page-main">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 m-0">
            {t('booking.title')}
          </h1>
          
          {/* Mobile cart button - only visible on small screens */}
          <Button
            icon="pi pi-shopping-cart"
            label={t('booking.cart')}
            onClick={() => setCartVisible(true)}
            severity="secondary"
            outlined
            className="relative cart-button mobile-cart-button"
            size="large"
          >
            {cartItemCount > 0 && (
              <Badge 
                value={cartItemCount} 
                severity="danger" 
                className="absolute cart-badge"
                style={{
                  top: '-8px',
                  right: '-8px',
                  zIndex: 10
                }}
              />
            )}
          </Button>
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
      </div>

      {/* Fixed Cart - Desktop only */}
      <div className="booking-page-cart">
        <FixedCart onCheckout={handleCheckout} />
      </div>

      {/* Mobile Cart Drawer */}
      <CartDrawer
        visible={cartVisible}
        onHide={() => setCartVisible(false)}
        onCheckout={handleCheckout}
      />

      <Toast />
    </div>
  );
};


