import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { format, addDays, subDays } from 'date-fns';
import { useCart } from '../../contexts/CartContext';
import { useConfig } from '../../contexts/ConfigContext';
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
import { fromMinutes, toMinutes } from './slotUtils';
import './StudioGrid.css';

const FALLBACK_STUDIOS: Studio[] = [
  { id: 'studio-a', name: 'Atelier', price: 13000 },
  { id: 'studio-b', name: 'Frigyes', price: 13000 },
  { id: 'studio-c', name: 'Karinthy', price: 13000 },
  { id: 'studio-d', name: 'Terasz', price: 13000 },
  { id: 'studio-e', name: 'Vitrin', price: 16000 },
  { id: 'makeup-1', name: 'Smink hely 1', price: 2000, slotMinutes: 30 },
  { id: 'makeup-2', name: 'Smink hely 2', price: 2000, slotMinutes: 30 },
];

export const StudioGrid: React.FC<StudioGridProps> = ({ onCartUpdate }) => {
  const { t } = useTranslation();
  const { addItem, removeItem, isInCart } = useCart();
  const { config } = useConfig();
  const toast = useRef<Toast>(null);

  const studios: Studio[] =
    config?.studios && config.studios.length > 0 ? config.studios : FALLBACK_STUDIOS;

  const getStudioPrice = (studio: Studio) =>
    studio.price ?? config?.hourlyRate ?? 13000;
  
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
    // Studios sell whole hours, the makeup rooms half hours
    const endTime = fromMinutes(toMinutes(slot.time) + (studio.slotMinutes ?? 60));


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
        price: getStudioPrice(studio),
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
          <div
            className="studio-booking-grid"
            style={{ '--studio-count': studios.length } as React.CSSProperties}
          >
            <GridHeader studios={studios} hourlyRate={config?.hourlyRate || 13000} />
            <GridBody
              availability={availability}
              studios={studios}
              isInCart={isInCart}
              onSlotClick={handleSlotClick}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
