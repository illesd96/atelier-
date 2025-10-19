import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { removePastAppointments } = useCart();
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
  }, [removePastAppointments, t]);

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
        style={{ width: '450px' }}
        onHide={() => setShowAuthDialog(false)}
        dismissableMask
        closeOnEscape
      >
        <div className="text-center py-3">
          <i className="pi pi-user text-6xl text-primary mb-3"></i>
          <p className="text-lg mb-4 line-height-3">
            {t('checkout.authPrompt.message')}
          </p>
          
          <div className="flex flex-column gap-3">
            <Button
              label={t('checkout.authPrompt.login')}
              icon="pi pi-sign-in"
              onClick={handleLogin}
              className="w-full"
              size="large"
            />
            <Button
              label={t('checkout.authPrompt.register')}
              icon="pi pi-user-plus"
              onClick={handleRegister}
              className="w-full"
              severity="success"
              size="large"
            />
            <Button
              label={t('checkout.authPrompt.continueAsGuest')}
              icon="pi pi-arrow-right"
              onClick={handleContinueAsGuest}
              className="w-full"
              severity="secondary"
              outlined
              size="large"
            />
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              <i className="pi pi-check-circle mr-2"></i>
              {t('checkout.authPrompt.benefit1')}
            </p>
            <p className="mb-2">
              <i className="pi pi-check-circle mr-2"></i>
              {t('checkout.authPrompt.benefit2')}
            </p>
            <p className="m-0">
              <i className="pi pi-check-circle mr-2"></i>
              {t('checkout.authPrompt.benefit3')}
            </p>
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} />
    </div>
  );
};


