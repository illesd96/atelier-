import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useCart } from '../hooks/useCart';

export const PaymentResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Simulate checking payment status
    // In a real app, you would poll the backend to check payment status
    const timer = setTimeout(() => {
      setLoading(false);
      // For demo purposes, randomly set result
      // In production, this would be determined by actual payment status
      const results = ['success', 'failed', 'cancelled'] as const;
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setResult(randomResult);
      
      if (randomResult === 'success') {
        clearCart();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [clearCart]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="payment-result-page flex justify-content-center align-items-center min-h-screen">
        <Card className="text-center p-6">
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
          <h2 className="mt-4 mb-2">{t('payment.processing')}</h2>
          <p className="text-gray-600 m-0">
            Please wait while we process your payment...
          </p>
        </Card>
      </div>
    );
  }

  const getResultContent = () => {
    switch (result) {
      case 'success':
        return {
          icon: 'pi pi-check-circle',
          iconColor: 'text-green-500',
          title: t('payment.success'),
          message: t('payment.successMessage'),
          actions: (
            <Button
              label={t('payment.returnToHome')}
              onClick={handleReturnHome}
              size="large"
              icon="pi pi-home"
            />
          ),
        };
      
      case 'failed':
        return {
          icon: 'pi pi-times-circle',
          iconColor: 'text-red-500',
          title: t('payment.failed'),
          message: t('payment.failedMessage'),
          actions: (
            <div className="flex gap-2 justify-content-center">
              <Button
                label={t('payment.tryAgain')}
                onClick={handleTryAgain}
                size="large"
                icon="pi pi-refresh"
              />
              <Button
                label={t('payment.returnToHome')}
                onClick={handleReturnHome}
                size="large"
                severity="secondary"
                outlined
                icon="pi pi-home"
              />
            </div>
          ),
        };
      
      case 'cancelled':
        return {
          icon: 'pi pi-exclamation-triangle',
          iconColor: 'text-yellow-500',
          title: t('payment.cancelled'),
          message: t('payment.cancelledMessage'),
          actions: (
            <div className="flex gap-2 justify-content-center">
              <Button
                label={t('payment.tryAgain')}
                onClick={handleTryAgain}
                size="large"
                icon="pi pi-refresh"
              />
              <Button
                label={t('payment.returnToHome')}
                onClick={handleReturnHome}
                size="large"
                severity="secondary"
                outlined
                icon="pi pi-home"
              />
            </div>
          ),
        };
      
      default:
        return null;
    }
  };

  const content = getResultContent();

  if (!content) {
    return (
      <div className="payment-result-page flex justify-content-center align-items-center min-h-screen">
        <Card className="text-center p-6">
          <h2 className="text-red-500 mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 mb-4">Invalid payment result</p>
          <Button
            label={t('payment.returnToHome')}
            onClick={handleReturnHome}
            severity="secondary"
            outlined
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="payment-result-page flex justify-content-center align-items-center min-h-screen">
      <Card className="text-center p-6 max-w-md">
        <i className={`${content.icon} text-8xl ${content.iconColor} mb-4`}></i>
        <h1 className="text-3xl font-bold mb-3">{content.title}</h1>
        <p className="text-gray-600 mb-6 line-height-3">{content.message}</p>
        
        {orderId && (
          <div className="mb-4 p-3 bg-gray-50 border-round">
            <p className="text-sm text-gray-600 m-0">
              <strong>{t('payment.orderId')}:</strong> {orderId}
            </p>
            {paymentId && (
              <p className="text-sm text-gray-600 m-0">
                <strong>{t('payment.bookingCode')}:</strong> {paymentId.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        )}
        
        {content.actions}
      </Card>
    </div>
  );
};


