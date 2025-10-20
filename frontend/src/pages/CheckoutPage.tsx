import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { barionPixel } from '../utils/barionPixel';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { items, removePastAppointments } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Clean up past appointments when checkout page opens
  useEffect(() => {
    const removedCount = removePastAppointments();
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} past appointment(s) from cart`);
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: t('common.warning'),
          detail: t('checkout.pastAppointmentsRemoved', { count: removedCount }),
          life: 5000,
        });
      }
    }
    
    // Track checkout initiation with Barion Pixel
    if (items.length > 0) {
      const pixelItems = items.map(item => ({
        id: item.room_id,
        name: `${item.room_id} - ${item.date} ${item.start_time}`,
        quantity: 1,
        price: 15000, // Default hourly rate
      }));
      const total = pixelItems.reduce((sum, item) => sum + item.price, 0);
      barionPixel.trackInitiateCheckout(pixelItems, total);
    }
  }, [removePastAppointments, items, t]);

  // Show auth dialog for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Store current path to return after login
    sessionStorage.setItem('returnPath', '/checkout');
    navigate('/login');
  };

  const handleRegister = () => {
    // Store current path to return after registration
    sessionStorage.setItem('returnPath', '/checkout');
    navigate('/register');
  };

  const handleContinueAsGuest = () => {
    setShowAuthDialog(false);
  };

  const handleSuccess = (redirectUrl: string) => {
    // Redirect to Barion payment page
    window.location.href = redirectUrl;
  };

  const handleError = (error: string) => {
    if (toast.current) {
      toast.current.show({
        severity: 'error',
        summary: t('common.error'),
        detail: error,
        life: 5000,
      });
    }
  };

  const handleBack = () => {
    navigate('/booking');
  };

  return (
    <div className="checkout-page">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">
          {t('checkout.title')}
        </h1>
        
        <Button
          icon="pi pi-arrow-left"
          label={t('common.back')}
          onClick={handleBack}
          className="back-button"
        />
      </div>

      <CheckoutForm onSuccess={handleSuccess} onError={handleError} />

      {/* Auth Prompt Dialog */}
      <Dialog
        header={t('checkout.authPrompt.title')}
        visible={showAuthDialog}
        style={{ width: '500px', maxWidth: '90vw' }}
        onHide={() => setShowAuthDialog(false)}
        dismissableMask
        closeOnEscape
        className="auth-prompt-dialog"
      >
        <div className="text-center px-4 py-3">
          {/* Icon */}
          <div className="mb-4">
            <div className="inline-flex align-items-center justify-content-center bg-primary-50 border-circle" 
                 style={{ width: '80px', height: '80px' }}>
              <i className="pi pi-user text-5xl text-primary"></i>
            </div>
          </div>
          
          {/* Message */}
          <p className="text-lg mb-5 line-height-3 px-2" style={{ color: '#495057' }}>
            {t('checkout.authPrompt.message')}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-column gap-3 mb-5">
            <Button
              label={t('checkout.authPrompt.login')}
              icon="pi pi-sign-in"
              onClick={handleLogin}
              className="w-full"
              size="large"
              style={{ padding: '0.875rem 1.25rem' }}
            />
            <Button
              label={t('checkout.authPrompt.register')}
              icon="pi pi-user-plus"
              onClick={handleRegister}
              className="w-full"
              severity="success"
              size="large"
              style={{ padding: '0.875rem 1.25rem' }}
            />
            <Button
              label={t('checkout.authPrompt.continueAsGuest')}
              icon="pi pi-arrow-right"
              onClick={handleContinueAsGuest}
              className="w-full"
              severity="secondary"
              outlined
              size="large"
              style={{ padding: '0.875rem 1.25rem' }}
            />
          </div>

          {/* Benefits Card */}
          <div className="p-4 bg-gray-50 border-round-lg text-left">
            <div className="flex align-items-start mb-3">
              <i className="pi pi-check-circle text-green-500 mr-3 mt-1" style={{ fontSize: '1.1rem' }}></i>
              <span className="text-base line-height-3">{t('checkout.authPrompt.benefit1')}</span>
            </div>
            <div className="flex align-items-start mb-3">
              <i className="pi pi-check-circle text-green-500 mr-3 mt-1" style={{ fontSize: '1.1rem' }}></i>
              <span className="text-base line-height-3">{t('checkout.authPrompt.benefit2')}</span>
            </div>
            <div className="flex align-items-start">
              <i className="pi pi-check-circle text-green-500 mr-3 mt-1" style={{ fontSize: '1.1rem' }}></i>
              <span className="text-base line-height-3">{t('checkout.authPrompt.benefit3')}</span>
            </div>
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} />
    </div>
  );
};


