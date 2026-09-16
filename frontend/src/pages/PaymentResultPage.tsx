import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useCart } from '../hooks/useCart';
import { OrderItem } from '../types';
import api from '../services/api';
import { format } from 'date-fns';
import { metaPixel } from '../utils/metaPixel';
import { trackPurchase } from '../utils/gtm';

// How long to keep asking the backend before showing the "still processing"
// screen. Confirming a payment involves Barion, invoicing and email, so it can
// take considerably longer than a couple of seconds.
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 90000;

type PaymentOutcome = 'success' | 'failed' | 'cancelled' | 'processing';

export const PaymentResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [recheckCount, setRecheckCount] = useState(0);

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
    if (!orderId) {
      setError('Missing order ID');
      setLoading(false);
      return;
    }

    let abandoned = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    const finish = (outcome: PaymentOutcome) => {
      if (abandoned) return;
      setResult(outcome);
      setLoading(false);
    };

    const scheduleRetry = (poll: () => void) => {
      if (abandoned) return;
      if (Date.now() < deadline) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        // Time is up and the payment was never reported as failed. It may well
        // have succeeded and still be finishing, so never claim it failed.
        finish('processing');
      }
    };

    const pollStatus = async (): Promise<void> => {
      if (abandoned) return;

      try {
        const response = await api.getOrderStatus(orderId);
        if (abandoned) return;

        if (!response.success || !response.order) {
          throw new Error('Failed to get order status');
        }

        const status = response.order.status;
        setOrderItems(response.items || []);

        if (status === 'paid') {
          finish('success');
          clearCart();

          // Track purchase with Meta Pixel and GTM
          if (response.items && response.items.length > 0) {
            const trackingItems = response.items.map((item: OrderItem) => ({
              id: item.room_id?.toString() || item.id,
              name: item.room_name || 'Studio Booking',
              quantity: 1,
              price: item.price || 0,
            }));
            const total = response.items.reduce(
              (sum: number, item: OrderItem) => sum + (item.price || 0),
              0
            );

            // Meta Pixel tracking
            metaPixel.trackPurchase(orderId, trackingItems, total);

            // Google Tag Manager tracking
            trackPurchase(
              orderId,
              total,
              trackingItems.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
              }))
            );
          }
          return;
        }

        // Only the payment provider's own verdict counts as a failure
        if (status === 'failed') {
          finish('failed');
          return;
        }

        if (status === 'cancelled' || status === 'expired') {
          finish('cancelled');
          return;
        }

        // Still pending: the webhook has not confirmed the payment yet
        scheduleRetry(pollStatus);

      } catch (err) {
        if (abandoned) return;
        console.error('Error checking payment status:', err);
        // A network error tells us nothing about the payment, so keep trying
        scheduleRetry(pollStatus);
      }
    };

    setLoading(true);
    setResult(null);
    setError(null);
    pollStatus();

    return () => {
      abandoned = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, clearCart, recheckCount]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/checkout');
  };

  const handleCheckAgain = () => {
    setRecheckCount(count => count + 1);
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

      case 'processing':
        return {
          icon: 'pi pi-clock',
          iconColor: 'text-blue-500',
          title: t('payment.stillProcessing'),
          message: t('payment.stillProcessingMessage'),
          actions: (
            <div className="flex gap-2 justify-content-center">
              <Button
                label={t('payment.checkAgain')}
                onClick={handleCheckAgain}
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

        {orderId && orderItems.length > 0 && result === 'success' && (
          <div className="mb-4">
            {orderItems.map((item) => (
              <div key={item.id} className="mb-3 p-4 bg-gray-50 border-round">
                <div className="text-sm text-gray-700 mb-3">
                  <strong className="text-lg">{item.room_name || 'Studio'}</strong>
                  <br />
                  📅 {formatDate(item.booking_date)} &nbsp; 🕒 {item.start_time}
                </div>

                <div className="p-4" style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}>
                  <div style={{color: 'white', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>
                    ✅ {t('payment.orderId')}
                  </div>
                  <div style={{fontFamily: 'monospace', color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', wordBreak: 'break-all', padding: '0 10px'}}>
                    {orderId}
                  </div>
                  <div style={{color: 'rgba(255,255,255,0.9)', fontSize: '11px', marginTop: '8px'}}>
                    {t('payment.showOnArrival')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {orderId && result === 'processing' && (
          <div className="mb-4 p-3 bg-gray-50 border-round text-sm text-gray-700">
            <div style={{fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>
              {t('payment.orderId')}
            </div>
            <div style={{fontFamily: 'monospace', wordBreak: 'break-all'}}>{orderId}</div>
          </div>
        )}

        {content.actions}
      </Card>
    </div>
  );
};
