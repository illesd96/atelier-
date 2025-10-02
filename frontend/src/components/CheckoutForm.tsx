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
import { Message } from 'primereact/message';
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
  address: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
}).refine((data) => {
  if (data.invoiceRequired) {
    return data.company && data.taxNumber && data.address;
  }
  return true;
}, {
  message: 'Invoice details are required when requesting an invoice',
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
      address: '',
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
          address: data.address,
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
      <Card className="text-center p-4">
        <i className="pi pi-shopping-cart text-6xl text-gray-300 mb-3"></i>
        <h3 className="text-gray-500">{t('booking.cartEmpty')}</h3>
        <p className="text-gray-400">{t('booking.addItemsFirst')}</p>
      </Card>
    );
  }

  return (
    <div className="grid">
      <div className="col-12 lg:col-8">
        <Card title={t('checkout.customerInfo')}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid">
              <div className="col-12">
                <label htmlFor="name" className="block text-900 font-medium mb-2">
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

              <div className="col-12 md:col-6">
                <label htmlFor="email" className="block text-900 font-medium mb-2">
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

              <div className="col-12 md:col-6">
                <label htmlFor="phone" className="block text-900 font-medium mb-2">
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

              <div className="col-12">
                <Divider />
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
                  <div className="col-12 md:col-6">
                    <label htmlFor="company" className="block text-900 font-medium mb-2">
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

                  <div className="col-12 md:col-6">
                    <label htmlFor="taxNumber" className="block text-900 font-medium mb-2">
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

                  <div className="col-12">
                    <label htmlFor="address" className="block text-900 font-medium mb-2">
                      {t('checkout.address')} *
                    </label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          id="address"
                          {...field}
                          className={`w-full ${errors.address ? 'p-invalid' : ''}`}
                          placeholder={t('checkout.address')}
                        />
                      )}
                    />
                    {errors.address && (
                      <small className="p-error">{errors.address.message}</small>
                    )}
                  </div>
                </>
              )}

              <div className="col-12">
                <Divider />
                <div className="flex flex-column gap-3">
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
                        <label htmlFor="termsAccepted" className="cursor-pointer text-sm">
                          {t('checkout.acceptTerms')} *
                        </label>
                      </div>
                    )}
                  />
                  {errors.termsAccepted && (
                    <small className="p-error ml-4">{errors.termsAccepted.message}</small>
                  )}

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
                        <label htmlFor="privacyAccepted" className="cursor-pointer text-sm">
                          {t('checkout.acceptPrivacy')} *
                        </label>
                      </div>
                    )}
                  />
                  {errors.privacyAccepted && (
                    <small className="p-error ml-4">{errors.privacyAccepted.message}</small>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <div className="col-12 lg:col-4">
        <Card title={t('checkout.orderSummary')}>
          <div className="flex flex-column gap-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-content-between align-items-start">
                <div className="flex-1">
                  <p className="m-0 font-medium text-sm">
                    {t(`booking.studios.${item.room_id}`, item.room_name)}
                  </p>
                  <p className="m-0 text-xs text-gray-600">
                    {item.date} • {item.start_time} - {item.end_time}
                  </p>
                </div>
                <span className="font-semibold">
                  {item.price.toLocaleString()} {t('common.currency')}
                </span>
              </div>
            ))}

            <Divider />

            <div className="flex justify-content-between align-items-center">
              <span className="text-lg font-semibold">{t('checkout.total')}:</span>
              <span className="text-xl font-bold text-primary">
                {total.toLocaleString()} {t('common.currency')}
              </span>
            </div>

            <Button
              type="submit"
              label={loading ? t('checkout.processing') : t('checkout.proceedToPayment')}
              onClick={handleSubmit(onSubmit)}
              className="w-full"
              size="large"
              disabled={loading}
              icon={loading ? undefined : 'pi pi-credit-card'}
            >
              {loading && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};


