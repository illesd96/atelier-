import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useCart } from '../hooks/useCart';
import { OrderItem } from '../types';
import api from '../services/api';
import { barionPixel } from '../utils/barionPixel';

export const PaymentResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setError('Missing order ID');
        setLoading(false);
        return;
      }

      try {
        // Poll for payment status (check up to 10 times with 2 second intervals)
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollStatus = async (): Promise<void> => {
          attempts++;
          
          try {
            const response = await api.getOrderStatus(orderId);
            
            if (response.success && response.order) {
              const status = response.order.status;
              
              // Store order items
              setOrderItems(response.items || []);
              
              if (status === 'paid') {
                setResult('success');
                clearCart();
                setLoading(false);
                
                // Track successful purchase with Barion Pixel
                const pixelItems = (response.items || []).map(item => ({
                  id: item.room_id || 'studio',
                  name: `${item.room_name || 'Studio'} - ${item.booking_date}`,
                  quantity: 1,
                  price: 15000, // Default hourly rate
                }));
                const total = response.order.total_amount || 0;
                barionPixel.trackPurchase(response.order.id, pixelItems, total);
              } else if (status === 'failed') {
                setResult('failed');
                setLoading(false);
              } else if (status === 'cancelled' || status === 'expired') {
                setResult('cancelled');
                setLoading(false);
              } else if (status === 'pending' && attempts < maxAttempts) {
                // Still pending, poll again after 2 seconds
                setTimeout(pollStatus, 2000);
              } else {
                // Max attempts reached or unknown status
                setResult('failed');
                setLoading(false);
              }
            } else {
              throw new Error('Failed to get order status');
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
            if (attempts < maxAttempts) {
              // Retry on error
              setTimeout(pollStatus, 2000);
            } else {
              setError('Unable to verify payment status');
              setResult('failed');
              setLoading(false);
            }
          }
        };
        
        // Start polling
        pollStatus();
        
      } catch (err) {
        console.error('Error in payment status check:', err);
        setError('Unable to verify payment status');
        setResult('failed');
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, clearCart]);

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
            {error || 'Please wait while we process your payment...'}
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
            <p className="text-sm text-gray-600 mb-2">
              <strong>{t('payment.orderId')}:</strong> {orderId}
            </p>
            {orderItems.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {t('payment.bookingCodes')}:
                </p>
                {orderItems.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600 mb-1 pl-2">
                    <strong>{item.room_name || 'Studio'}</strong> - {item.booking_date} {item.start_time}
                    <br />
                    <span className="font-mono text-primary">
                      {item.booking_id || t('payment.bookingPending')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {content.actions}
      </Card>
    </div>
  );
};


