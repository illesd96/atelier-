import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
// import { Toast } from 'primereact/toast';
import { format, addDays, subDays, isToday, isTomorrow } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import api from '../services/api';
import { useCart } from '../hooks/useCart';
import { AvailabilityResponse, TimeSlot, RoomAvailability } from '../types';

interface BookingGridProps {
  onCartUpdate?: () => void;
}

const HOURLY_RATE = 15000; // HUF per hour

export const BookingGrid: React.FC<BookingGridProps> = ({ onCartUpdate }) => {
  const { t, i18n } = useTranslation();
  const { addItem, removeItem, isInCart } = useCart();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLocale = i18n.language === 'hu' ? hu : enUS;

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate]);

  const loadAvailability = async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await api.getAvailability(dateStr);
      setAvailability(data);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleSlotClick = (room: RoomAvailability, slot: TimeSlot) => {
    if (slot.status !== 'available') return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const endTime = `${(parseInt(slot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
    
    const cartItem = {
      room_id: room.id,
      room_name: room.name,
      date: dateStr,
      start_time: slot.time,
      end_time: endTime,
      price: HOURLY_RATE,
    };

    if (isInCart(room.id, dateStr, slot.time)) {
      removeItem(room.id, dateStr, slot.time);
    } else {
      addItem(cartItem);
    }

    onCartUpdate?.();
  };

  const getSlotClassName = (room: RoomAvailability, slot: TimeSlot) => {
    const baseClass = 'slot-cell';
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const inCart = isInCart(room.id, dateStr, slot.time);
    
    switch (slot.status) {
      case 'available':
        return `${baseClass} slot-available ${inCart ? 'slot-selected' : ''}`;
      case 'booked':
        return `${baseClass} slot-booked`;
      case 'unavailable':
        return `${baseClass} slot-unavailable`;
      default:
        return baseClass;
    }
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return t('booking.today');
    }
    if (isTomorrow(date)) {
      return t('booking.tomorrow');
    }
    return format(date, 'EEEE, MMMM d', { locale: dateLocale });
  };

  if (loading) {
    return (
      <Card className="booking-grid-container">
        <div className="grid">
          <div className="col-12">
            <Skeleton height="3rem" className="mb-3" />
            <Skeleton height="400px" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="booking-grid-container">
        <div className="text-center p-4">
          <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-3"></i>
          <h3 className="text-red-500 mb-3">{t('common.error')}</h3>
          <p className="mb-4">{error}</p>
          <Button 
            label={t('common.tryAgain')} 
            onClick={() => loadAvailability(selectedDate)}
            severity="secondary"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="booking-grid-container">
      {/* Date Navigation */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4">
        <div className="flex align-items-center gap-2 mb-3 md:mb-0">
          <Button 
            icon="pi pi-chevron-left" 
            onClick={goToPreviousDay}
            severity="secondary"
            outlined
            size="small"
          />
          <h2 className="text-xl font-semibold mx-3">
            {formatDateHeader(selectedDate)}
          </h2>
          <Button 
            icon="pi pi-chevron-right" 
            onClick={goToNextDay}
            severity="secondary"
            outlined
            size="small"
          />
        </div>
        
        <div className="flex align-items-center gap-2">
          <Button 
            label={t('booking.today')}
            onClick={goToToday}
            severity="secondary"
            outlined
            size="small"
            disabled={isToday(selectedDate)}
          />
          <Calendar
            value={selectedDate}
            onChange={(e) => handleDateChange(e.value as Date)}
            showIcon
            dateFormat="yy-mm-dd"
            minDate={new Date()}
            maxDate={addDays(new Date(), 90)}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 border-round">
        <div className="flex align-items-center gap-1">
          <div className="slot-legend slot-available"></div>
          <span className="text-sm">{t('booking.available')}</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="slot-legend slot-booked"></div>
          <span className="text-sm">{t('booking.booked')}</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="slot-legend slot-selected"></div>
          <span className="text-sm">{t('booking.selected')}</span>
        </div>
        <div className="flex align-items-center gap-1">
          <div className="slot-legend slot-unavailable"></div>
          <span className="text-sm">{t('booking.unavailable')}</span>
        </div>
      </div>

      {/* Booking Grid */}
      {availability && (
        <div className="booking-grid">
          <div className="grid-header">
            <div className="time-column-header">{t('booking.selectTime')}</div>
            {availability.rooms.map(room => (
              <div key={room.id} className="room-header">
                <h4>{t(`booking.studios.${room.id}`, room.name)}</h4>
              </div>
            ))}
          </div>
          
          <div className="grid-body">
            {availability.rooms[0]?.slots.map((_, timeIndex) => (
              <div key={timeIndex} className="grid-row">
                <div className="time-cell">
                  {availability.rooms[0].slots[timeIndex].time}
                </div>
                {availability.rooms.map(room => {
                  const slot = room.slots[timeIndex];
                  return (
                    <div
                      key={`${room.id}-${timeIndex}`}
                      className={getSlotClassName(room, slot)}
                      onClick={() => handleSlotClick(room, slot)}
                      role="button"
                      tabIndex={slot.status === 'available' ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSlotClick(room, slot);
                        }
                      }}
                    >
                      <span className="slot-status">
                        {slot.status === 'available' && (
                          <i className="pi pi-check text-green-600"></i>
                        )}
                        {slot.status === 'booked' && (
                          <i className="pi pi-times text-red-600"></i>
                        )}
                        {slot.status === 'unavailable' && (
                          <i className="pi pi-minus text-gray-400"></i>
                        )}
                      </span>
                      <span className="slot-price">
                        {slot.status === 'available' && (
                          <small>{HOURLY_RATE.toLocaleString()} {t('common.currency')}</small>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .booking-grid {
          overflow-x: auto;
          min-width: 100%;
        }
        
        .grid-header {
          display: grid;
          grid-template-columns: 100px repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          background-color: #f8f9fa;
          border-radius: 8px 8px 0 0;
          padding: 1px;
        }
        
        .time-column-header {
          background: white;
          padding: 1rem;
          font-weight: 600;
          text-align: center;
          border-radius: 8px 0 0 0;
        }
        
        .room-header {
          background: white;
          padding: 1rem;
          text-align: center;
          border-radius: 0 8px 0 0;
        }
        
        .room-header:last-child {
          border-radius: 0 8px 0 0;
        }
        
        .room-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .grid-body {
          background-color: #f8f9fa;
          padding: 1px;
          border-radius: 0 0 8px 8px;
        }
        
        .grid-row {
          display: grid;
          grid-template-columns: 100px repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          margin-bottom: 1px;
        }
        
        .time-cell {
          background: white;
          padding: 1rem;
          font-weight: 500;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .slot-cell {
          background: white;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          position: relative;
        }
        
        .slot-available {
          background: #f0f9ff;
          border: 2px solid #22c55e;
        }
        
        .slot-available:hover {
          background: #dcfce7;
          transform: scale(1.02);
        }
        
        .slot-selected {
          background: #22c55e;
          color: white;
        }
        
        .slot-booked {
          background: #fef2f2;
          border: 2px solid #ef4444;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .slot-unavailable {
          background: #f9fafb;
          border: 2px solid #d1d5db;
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .slot-legend {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid;
        }
        
        .slot-legend.slot-available {
          background: #f0f9ff;
          border-color: #22c55e;
        }
        
        .slot-legend.slot-selected {
          background: #22c55e;
          border-color: #22c55e;
        }
        
        .slot-legend.slot-booked {
          background: #fef2f2;
          border-color: #ef4444;
        }
        
        .slot-legend.slot-unavailable {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        
        .slot-status {
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }
        
        .slot-price {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .booking-grid {
            font-size: 0.875rem;
          }
          
          .grid-header {
            grid-template-columns: 80px repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .grid-row {
            grid-template-columns: 80px repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .slot-cell {
            padding: 0.75rem 0.5rem;
            min-height: 50px;
          }
          
          .time-cell, .time-column-header, .room-header {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </Card>
  );
};


