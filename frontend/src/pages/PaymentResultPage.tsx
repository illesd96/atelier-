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
import { format } from 'date-fns';

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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

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
        
        {orderId && orderItems.length > 0 && (
          <div className="mb-4">
            {orderItems.map((item) => (
              <div key={item.id} className="mb-3 p-4 bg-gray-50 border-round">
                <div className="text-sm text-gray-700 mb-3">
                  <strong className="text-lg">{item.room_name || 'Studio'}</strong>
                  <br />
                  📅 {formatDate(item.booking_date)} &nbsp; 🕒 {item.start_time}
                </div>
                
                {item.checkin_code ? (
                  <div className="p-4" style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}>
                    <div style={{color: 'white', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>
                      ✅ {t('payment.checkinCode')}
                    </div>
                    <div style={{fontFamily: 'monospace', color: 'white', fontSize: '36px', fontWeight: 'bold', letterSpacing: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                      {item.checkin_code}
                    </div>
                    <div style={{color: 'rgba(255,255,255,0.9)', fontSize: '11px', marginTop: '8px'}}>
                      {t('payment.showOnArrival')}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-yellow-50 border-round">
                    <span className="text-yellow-700">{t('payment.bookingPending')}</span>
                  </div>
                )}
                
                {item.booking_id && (
                  <div className="mt-2 p-2 bg-white border-round text-center">
                    <small className="text-gray-500" style={{fontSize: '10px'}}>
                      {t('payment.reference')}: <span className="font-mono text-gray-400">{item.booking_id}</span>
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {content.actions}
      </Card>
    </div>
  );
};


