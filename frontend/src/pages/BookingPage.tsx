import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { StudioGrid } from '../components/StudioGrid';
import { CartDrawer } from '../components/CartDrawer';
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
    <div className="booking-page">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900 m-0">
          {t('booking.title')}
        </h1>
        
        <Button
          icon="pi pi-shopping-cart"
          label={t('booking.cart')}
          onClick={() => setCartVisible(true)}
          severity="secondary"
          outlined
          className="relative cart-button"
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

      <StudioGrid onCartUpdate={handleCartUpdate} />

      <CartDrawer
        visible={cartVisible}
        onHide={() => setCartVisible(false)}
        onCheckout={handleCheckout}
      />

      <Toast />
    </div>
  );
};


