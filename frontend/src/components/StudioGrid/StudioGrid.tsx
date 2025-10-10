import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { format, addDays, subDays } from 'date-fns';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { AvailabilityResponse, CartItem, TimeSlot } from '../../types';
import { DateNavigation } from './DateNavigation';
import { Legend } from './Legend';
import { GridHeader } from './GridHeader';
import { GridBody } from './GridBody';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { Studio, StudioGridProps } from './types';
import { getHungarianToday } from '../../utils/timezone';
import './StudioGrid.css';

const STUDIOS: Studio[] = [
  { id: 'studio-a', name: 'Studio A' },
  { id: 'studio-b', name: 'Studio B' },
  { id: 'studio-c', name: 'Studio C' },
  { id: 'makeup', name: 'Makeup Studio' },
];

const HOURLY_RATE = 15000;

export const StudioGrid: React.FC<StudioGridProps> = ({ onCartUpdate }) => {
  const { t } = useTranslation();
  const { addItem, removeItem, isInCart } = useCart();
  const toast = useRef<Toast>(null);
  
  // Always start with today's date in Hungarian timezone
  const [selectedDate, setSelectedDate] = useState<Date>(getHungarianToday());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRenderKey] = useState(0);

  useEffect(() => {
    loadAvailabilityForDate();
  }, [selectedDate]);

  const loadAvailabilityForDate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await api.getAvailability(dateStr);
      setAvailability(data);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    // Always use Hungarian timezone for "today"
    setSelectedDate(getHungarianToday());
  };

  const handleSlotClick = (studio: Studio, slot: TimeSlot) => {
    if (slot.status !== 'available') return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const endTime = `${(parseInt(slot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
    
    if (isInCart(studio.id, dateStr, slot.time)) {
      // Remove from cart
      removeItem(studio.id, dateStr, slot.time);
      toast.current?.show({
        severity: 'info',
        summary: t('booking.removeFromCart'),
        detail: `${studio.name} - ${slot.time}`,
        life: 3000,
      });
    } else {
      // Add to cart
      const cartItem: CartItem = {
        room_id: studio.id,
        room_name: studio.name,
        date: dateStr,
        start_time: slot.time,
        end_time: endTime,
        price: HOURLY_RATE,
      };
      
      addItem(cartItem);
      toast.current?.show({
        severity: 'success',
        summary: t('booking.addToCart'),
        detail: `${studio.name} - ${slot.time}`,
        life: 3000,
      });
    }
    
    onCartUpdate?.();
    
    // Trigger re-render to update visual state
    setRenderKey(prev => prev + 1);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadAvailabilityForDate} />;
  }

  return (
    <div className="studio-grid">
      <Toast ref={toast} />
      
      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
      />

      <Legend />

      {availability && (
        <Card>
          <div className="studio-booking-grid">
            <GridHeader studios={STUDIOS} hourlyRate={HOURLY_RATE} />
            <GridBody
              availability={availability}
              studios={STUDIOS}
              isInCart={isInCart}
              onSlotClick={handleSlotClick}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
