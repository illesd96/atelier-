import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
// import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { CheckoutRequest } from '../types';
import './CheckoutForm.css';

interface CheckoutFormProps {
  onSuccess: (redirectUrl: string) => void;
  onError: (error: string) => void;
}

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  invoiceRequired: z.boolean(),
  company: z.string().optional(),
  taxNumber: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
}).refine((data) => {
  if (data.invoiceRequired) {
    return data.company && data.taxNumber && data.street && data.city && data.postalCode && data.country;
  }
  return true;
}, {
  message: 'All address fields are required when requesting an invoice',
  path: ['company'],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError }) => {
  const { t, i18n } = useTranslation();
  const { items, getTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      invoiceRequired: false,
      company: '',
      taxNumber: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Hungary',
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const invoiceRequired = watch('invoiceRequired');
  const total = getTotal();

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      onError(t('booking.cartEmpty'));
      return;
    }

    setLoading(true);

    try {
      // Validate cart first
      const validation = await api.validateCart(items);
      
      if (!validation.valid) {
        const invalidItems = validation.items.filter(item => !item.valid);
        const errorMessage = invalidItems.length > 0 
          ? invalidItems[0].error || t('errors.unavailable')
          : t('errors.unavailable');
        onError(errorMessage);
        return;
      }

      const address = data.invoiceRequired 
        ? `${data.street}, ${data.postalCode} ${data.city}, ${data.country}`
        : undefined;

      const checkoutRequest: CheckoutRequest = {
        items,
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
        },
        invoice: data.invoiceRequired ? {
          required: true,
          company: data.company,
          tax_number: data.taxNumber,
          address: address,
        } : { required: false },
        language: i18n.language as 'hu' | 'en',
        terms_accepted: data.termsAccepted,
        privacy_accepted: data.privacyAccepted,
      };

      const response = await api.createCheckout(checkoutRequest);
      onSuccess(response.redirectUrl);

    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.error || error.message || t('errors.payment');
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="empty-cart">
        <i className="pi pi-shopping-cart"></i>
        <h3>{t('booking.cartEmpty')}</h3>
        <p>{t('booking.addItemsFirst')}</p>
      </Card>
    );
  }

  return (
    <div className="checkout-form-container">
      <Card title={t('checkout.customerInfo')}>
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
          {/* Customer Information */}
          <div className="field-group">
            <label htmlFor="name" className="block">
              {t('checkout.name')} *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  id="name"
                  {...field}
                  className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                  placeholder={t('checkout.name')}
                />
              )}
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div className="field-group">
                <label htmlFor="email" className="block">
                  {t('checkout.email')} *
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      id="email"
                      {...field}
                      type="email"
                      className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                      placeholder={t('checkout.email')}
                    />
                  )}
                />
                {errors.email && (
                  <small className="p-error">{errors.email.message}</small>
                )}
              </div>
            </div>

            <div style={{ flex: '1', minWidth: '250px' }}>
              <div className="field-group">
                <label htmlFor="phone" className="block">
                  {t('checkout.phoneOptional')}
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      id="phone"
                      {...field}
                      type="tel"
                      className="w-full"
                      placeholder={t('checkout.phone')}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <Divider />
          
          <div className="field-group">
            <Controller
              name="invoiceRequired"
              control={control}
              render={({ field }) => (
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="invoiceRequired"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="invoiceRequired" className="cursor-pointer">
                    {t('checkout.invoiceRequired')}
                  </label>
                </div>
              )}
            />
          </div>

          {invoiceRequired && (
            <>
              <h3 style={{ 
                fontWeight: '600', 
                fontSize: '1rem', 
                letterSpacing: '0.025em', 
                textTransform: 'uppercase', 
                color: '#000000',
                margin: '1.5rem 0 1rem 0'
              }}>
                {t('checkout.invoice')}
              </h3>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="company" className="block">
                      {t('checkout.company')} *
                    </label>
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="company"
                          {...field}
                          className={`w-full ${errors.company ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.company')}
                        />
                      )}
                    />
                    {errors.company && (
                      <small className="p-error">{errors.company.message}</small>
                    )}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="taxNumber" className="block">
                      {t('checkout.taxNumber')} *
                    </label>
                    <Controller
                      name="taxNumber"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="taxNumber"
                          {...field}
                          className={`w-full ${errors.taxNumber ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.taxNumber')}
                        />
                      )}
                    />
                    {errors.taxNumber && (
                      <small className="p-error">{errors.taxNumber.message}</small>
                    )}
                  </div>
                </div>
              </div>

              <h3 style={{ 
                fontWeight: '600', 
                fontSize: '1rem', 
                letterSpacing: '0.025em', 
                textTransform: 'uppercase', 
                color: '#000000',
                margin: '1.5rem 0 1rem 0'
              }}>
                {t('checkout.address')}
              </h3>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="postalCode" className="block">
                      {t('checkout.postalCode')} *
                    </label>
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="postalCode"
                          {...field}
                          className={`w-full ${errors.postalCode ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.postalCode')}
                        />
                      )}
                    />
                    {errors.postalCode && (
                      <small className="p-error">{errors.postalCode.message}</small>
                    )}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="street" className="block">
                      {t('checkout.street')} *
                    </label>
                    <Controller
                      name="street"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="street"
                          {...field}
                          className={`w-full ${errors.street ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.street')}
                        />
                      )}
                    />
                    {errors.street && (
                      <small className="p-error">{errors.street.message}</small>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="city" className="block">
                      {t('checkout.city')} *
                    </label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="city"
                          {...field}
                          className={`w-full ${errors.city ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.city')}
                        />
                      )}
                    />
                    {errors.city && (
                      <small className="p-error">{errors.city.message}</small>
                    )}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div className="field-group">
                    <label htmlFor="country" className="block">
                      {t('checkout.country')} *
                    </label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="country"
                          {...field}
                          className={`w-full ${errors.country ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.country')}
                        />
                      )}
                    />
                    {errors.country && (
                      <small className="p-error">{errors.country.message}</small>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Terms and Conditions */}
          <Divider />
          
          <div className="flex flex-column gap-3">
            <div className="field-group">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <div className="flex align-items-start">
                    <Checkbox
                      inputId="termsAccepted"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.checked)}
                      className={`mr-2 ${errors.termsAccepted ? 'p-invalid' : ''}`}
                    />
                    <label htmlFor="termsAccepted" className="cursor-pointer">
                      {t('checkout.acceptTerms')} * <a href="/terms" target="_blank" style={{ textDecoration: 'underline' }}>{t('navigation.terms')}</a>
                    </label>
                  </div>
                )}
              />
              {errors.termsAccepted && (
                <small className="p-error ml-4">{errors.termsAccepted.message}</small>
              )}
            </div>

            <div className="field-group">
              <Controller
                name="privacyAccepted"
                control={control}
                render={({ field }) => (
                  <div className="flex align-items-start">
                    <Checkbox
                      inputId="privacyAccepted"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.checked)}
                      className={`mr-2 ${errors.privacyAccepted ? 'p-invalid' : ''}`}
                    />
                    <label htmlFor="privacyAccepted" className="cursor-pointer">
                      {t('checkout.acceptPrivacy')} * <a href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>{t('navigation.privacy')}</a>
                    </label>
                  </div>
                )}
              />
              {errors.privacyAccepted && (
                <small className="p-error ml-4">{errors.privacyAccepted.message}</small>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <Divider />
          
          <div className="order-summary-section">
            <h3 className="summary-title">{t('checkout.orderSummary')}</h3>
            
            {items.map((item, index) => (
              <div key={index} className="order-summary-item">
                <div className="flex justify-content-between align-items-start">
                  <div className="flex-1">
                    <p className="m-0 studio-name">
                      {t(`booking.studios.${item.room_id}`, item.room_name)}
                    </p>
                    <p className="m-0 booking-details">
                      {item.date} • {item.start_time} - {item.end_time}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {item.price.toLocaleString()} {t('common.currency')}
                  </span>
                </div>
              </div>
            ))}

            <div className="order-total">
              <div className="flex justify-content-between align-items-center">
                <span className="text-lg font-semibold">{t('checkout.total')}:</span>
                <span className="text-xl font-bold">
                  {total.toLocaleString()} {t('common.currency')}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            label={loading ? t('checkout.processing') : t('checkout.proceedToPayment')}
            className="submit-button"
            disabled={loading}
            icon={loading ? undefined : 'pi pi-credit-card'}
          >
            {loading && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
          </Button>
        </form>
      </Card>
    </div>
  );
};


