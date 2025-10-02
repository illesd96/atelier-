import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';
import './CartDrawer.css';

interface CartDrawerProps {
  visible: boolean;
  onHide: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ visible, onHide, onCheckout }) => {
  const { t, i18n } = useTranslation();
  const { items, removeItem, getTotal, getItemsByDate } = useCart();
  
  const dateLocale = i18n.language === 'hu' ? hu : enUS;
  const itemsByDate = getItemsByDate();
  const total = getTotal();

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.room_id, item.date, item.start_time);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMMM d', { locale: dateLocale });
  };

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  if (items.length === 0) {
    return (
      <Sidebar visible={visible} onHide={onHide} position="right" className="w-full md:w-20rem lg:w-25rem">
        <div className="flex flex-column h-full">
          <div className="mb-4">
            <h3 className="m-0">{t('booking.cart')}</h3>
          </div>
          
          <div className="flex-1 flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="pi pi-shopping-cart text-6xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 m-0">{t('booking.cartEmpty')}</p>
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar visible={visible} onHide={onHide} position="right" className="w-full md:w-20rem lg:w-25rem cart-sidebar">
      <div className="flex flex-column h-full" style={{ padding: 0 }}>
        <div className="cart-header">
          <h3 className="m-0 cart-title">
            <i className="pi pi-shopping-cart mr-2"></i>
            {t('booking.cart')} ({items.length})
          </h3>
        </div>
        
        <div className="flex-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          {Object.entries(itemsByDate).map(([date, dateItems]) => (
            <div key={date} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {formatDate(date)}
              </h4>
              
              {dateItems.map((item) => (
                <Card key={`${item.room_id}-${item.date}-${item.start_time}`} className="mb-2 p-3 cart-item">
                  <div className="flex justify-content-between align-items-start">
                    <div className="flex-1">
                      <h5 className="m-0 mb-1 text-sm font-semibold">
                        {t(`booking.studios.${item.room_id}`, item.room_name)}
                      </h5>
                      <p className="m-0 text-xs text-gray-600 mb-2">
                        {formatTime(item.start_time, item.end_time)}
                      </p>
                      <p className="m-0 text-sm font-semibold text-primary">
                        {item.price.toLocaleString()} {t('common.currency')}
                      </p>
                    </div>
                    
                    <Button
                      icon="pi pi-trash"
                      onClick={() => handleRemoveItem(item)}
                      severity="danger"
                      text
                      rounded
                      size="small"
                      className="ml-2 remove-button"
                    />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
        
        <Divider />
        
        <div className="pt-3">
          <div className="flex justify-content-between align-items-center mb-4 cart-total">
            <span className="text-lg font-semibold">{t('booking.cartTotal')}:</span>
            <span className="text-xl font-bold">
              {total.toLocaleString()} {t('common.currency')}
            </span>
          </div>
          
          <Button
            label={t('booking.checkout')}
            onClick={onCheckout}
            className="w-full checkout-button"
            size="large"
            icon="pi pi-credit-card"
          />
        </div>
      </div>
    </Sidebar>
  );
};


