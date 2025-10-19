import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { removePastAppointments } = useCart();

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

      <Toast ref={toast} />
    </div>
  );
};


