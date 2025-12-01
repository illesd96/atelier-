import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import './SpecialEventBookingPage.css';

interface SpecialEvent {
  id: string;
  name: string;
  description?: string;
  room_id: string;
  room_name?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  price_per_slot: number;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export const SpecialEventBookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = React.useRef<Toast>(null);

  const [event, setEvent] = useState<SpecialEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (selectedDate && event) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, event]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/special-events/${eventId}`);
      setEvent(response.data.event);
      
      // Set default date to start date of event
      const startDate = parseISO(response.data.event.start_date);
      const today = new Date();
      const defaultDate = startDate > today ? startDate : today;
      setSelectedDate(defaultDate);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hiba',
        detail: 'Nem sikerült betölteni az eseményt'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (date: Date) => {
    if (!event) return;
    
    setLoadingAvailability(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`/api/special-events/${eventId}/availability`, {
        params: { date: dateStr }
      });
      setAvailableSlots(response.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hiba',
        detail: 'Nem sikerült betölteni az elérhető időpontokat'
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    const slotKey = `${slot.start_time}`;
    if (selectedSlots.includes(slotKey)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotKey));
    } else {
      setSelectedSlots([...selectedSlots, slotKey]);
    }
  };

  const handleAddToCart = () => {
    if (!event || !selectedDate || selectedSlots.length === 0) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    selectedSlots.forEach(slotTime => {
      const slot = availableSlots.find(s => s.start_time === slotTime);
      if (slot) {
        addItem({
          room_id: event.room_id,
          room_name: event.room_name || event.room_id,
          date: dateStr,
          start_time: slot.start_time.substring(0, 5),
          end_time: slot.end_time.substring(0, 5),
          price: event.price_per_slot,
          special_event_id: event.id,
          special_event_name: event.name
        });
      }
    });
    
    toast.current?.show({
      severity: 'success',
      summary: 'Sikerült!',
      detail: `${selectedSlots.length} időpont hozzáadva a kosárhoz`
    });
    
    setSelectedSlots([]);
    navigate('/checkout');
  };

  const getAvailableDates = (): { minDate: Date; maxDate: Date } | null => {
    if (!event) return null;
    
    const startDate = parseISO(event.start_date);
    const endDate = parseISO(event.end_date);
    const today = new Date();
    
    return { 
      minDate: startDate > today ? startDate : today,
      maxDate: endDate
    };
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
  };

  // Split slots into two columns (morning and afternoon)
  const splitSlotsIntoColumns = () => {
    const morningSlots: TimeSlot[] = [];
    const afternoonSlots: TimeSlot[] = [];
    
    availableSlots.forEach(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      if (hour < 14) {
        morningSlots.push(slot);
      } else {
        afternoonSlots.push(slot);
      }
    });
    
    return { morningSlots, afternoonSlots };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container">
        <Card>
          <h2>Esemény nem található</h2>
          <Button label="Vissza" onClick={() => navigate('/')} />
        </Card>
      </div>
    );
  }

  const { morningSlots, afternoonSlots } = splitSlotsIntoColumns();
  const dates = getAvailableDates();

  return (
    <div className="special-event-booking-page">
      <Toast ref={toast} />
      
      <div className="container">
        {/* Event Header */}
        <div className="event-header">
          <h1>{event.name}</h1>
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}
          <div className="event-details">
            <div className="detail-item">
              <i className="pi pi-home"></i>
              <span>{event.room_name || event.room_id}</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-clock"></i>
              <span>{event.slot_duration_minutes} perc / időpont</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-money-bill"></i>
              <span>{event.price_per_slot.toLocaleString()} Ft / időpont</span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <Card className="date-selection-card">
          <h2>Válassz dátumot</h2>
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value as Date)}
            inline
            minDate={dates?.minDate}
            maxDate={dates?.maxDate}
            locale="hu"
            dateFormat="yy.mm.dd"
          />
        </Card>

        {/* Time Slots - Two Column Layout */}
        {selectedDate && (
          <div className="time-slots-section">
            <div className="section-header">
              <h2>Elérhető időpontok - {format(selectedDate, 'yyyy. MMMM d.', { locale: hu })}</h2>
              {selectedSlots.length > 0 && (
                <div className="selected-info">
                  <span>{selectedSlots.length} időpont kiválasztva</span>
                  <span className="total-price">
                    Összesen: {(selectedSlots.length * event.price_per_slot).toLocaleString()} Ft
                  </span>
                </div>
              )}
            </div>

            {loadingAvailability ? (
              <div className="loading-slots">
                <ProgressSpinner />
              </div>
            ) : (
              <div className="time-slots-grid">
                {/* Morning Column (8:00 - 14:00) */}
                <div className="time-column">
                  <h3 className="column-header">
                    <i className="pi pi-sun"></i>
                    Délelőtt (8:00 - 14:00)
                  </h3>
                  <div className="slots-list">
                    {morningSlots.length > 0 ? (
                      morningSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`time-slot ${!slot.available ? 'unavailable' : ''} ${
                            selectedSlots.includes(slot.start_time) ? 'selected' : ''
                          }`}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!slot.available}
                        >
                          <span className="slot-time">
                            {formatTimeSlot(slot.start_time, slot.end_time)}
                          </span>
                          <span className="slot-status">
                            {slot.available ? 
                              (selectedSlots.includes(slot.start_time) ? '✓ Kiválasztva' : 'Elérhető') : 
                              'Foglalt'
                            }
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="no-slots">Nincs elérhető időpont</p>
                    )}
                  </div>
                </div>

                {/* Afternoon Column (14:00 - 20:00) */}
                <div className="time-column">
                  <h3 className="column-header">
                    <i className="pi pi-moon"></i>
                    Délután (14:00 - 20:00)
                  </h3>
                  <div className="slots-list">
                    {afternoonSlots.length > 0 ? (
                      afternoonSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`time-slot ${!slot.available ? 'unavailable' : ''} ${
                            selectedSlots.includes(slot.start_time) ? 'selected' : ''
                          }`}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!slot.available}
                        >
                          <span className="slot-time">
                            {formatTimeSlot(slot.start_time, slot.end_time)}
                          </span>
                          <span className="slot-status">
                            {slot.available ? 
                              (selectedSlots.includes(slot.start_time) ? '✓ Kiválasztva' : 'Elérhető') : 
                              'Foglalt'
                            }
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="no-slots">Nincs elérhető időpont</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {selectedSlots.length > 0 && (
          <div className="action-buttons">
            <Button
              label="Kiválasztás törlése"
              icon="pi pi-times"
              onClick={() => setSelectedSlots([])}
              className="p-button-secondary"
              outlined
            />
            <Button
              label={`Tovább a fizetéshez (${selectedSlots.length} időpont)`}
              icon="pi pi-shopping-cart"
              onClick={handleAddToCart}
              className="p-button-success"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialEventBookingPage;

