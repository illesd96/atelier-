import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { format, parseISO, addDays, subDays, isToday, isTomorrow } from 'date-fns';
import { hu } from 'date-fns/locale';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { CartDrawer } from '../components/CartDrawer';
import './SpecialEventBookingPage.css';

interface SpecialEvent {
  id: string;
  name: string;
  description?: string;
  slug?: string;
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
  const { addItem, removeItem, items, isInCart } = useCart();
  const toast = React.useRef<Toast>(null);

  const [event, setEvent] = useState<SpecialEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState<number>(0);
  const [displayGallery, setDisplayGallery] = useState<boolean>(false);

  // Gallery images for special event
  const galleryImages = [
    '/images/special/1.jpg',
    '/images/special/2.jpg',
    '/images/special/3.jpg',
    '/images/special/4.jpg'
  ];

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (selectedDate && event) {
      fetchAvailability(selectedDate);
      updateSelectedSlotsFromCart();
    }
  }, [selectedDate, event]);

  // Update selected slots when cart changes
  useEffect(() => {
    updateSelectedSlotsFromCart();
  }, [items]);

  // Gallery navigation handlers
  const handlePrevImage = () => {
    setGalleryActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setGalleryActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleGalleryKeyDown = (e: KeyboardEvent) => {
    if (!displayGallery) return;
    if (e.key === 'Escape') setDisplayGallery(false);
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleGalleryKeyDown);
    return () => window.removeEventListener('keydown', handleGalleryKeyDown);
  }, [displayGallery, galleryActiveIndex]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/special-events/${eventId}`);
      const eventData = response.data.event;
      setEvent(eventData);
      
      // Set default date: event start or today (whichever is later)
      const startDate = parseISO(eventData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
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

  // Update selected slots based on cart items for current date
  const updateSelectedSlotsFromCart = () => {
    if (!event || !selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotsInCart = items
      .filter(item => 
        item.special_event_id === event.id && 
        item.date === dateStr
      )
      .map(item => `${item.start_time}:00`);
    
    setSelectedSlots(slotsInCart);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    if (!event || !selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = slot.start_time.substring(0, 5);
    
    // Check if already in cart - if yes, remove it
    if (isInCart(event.room_id, dateStr, startTime)) {
      removeItem(event.room_id, dateStr, startTime);
      toast.current?.show({
        severity: 'info',
        summary: 'Eltávolítva',
        detail: 'Időpont eltávolítva a kosárból'
      });
      return;
    }
    
    // Add to cart immediately
    addItem({
      room_id: event.room_id,
      room_name: event.room_name || event.room_id,
      date: dateStr,
      start_time: startTime,
      end_time: slot.end_time.substring(0, 5),
      price: parseFloat(event.price_per_slot.toString()),
      special_event_id: event.id,
      special_event_name: event.name
    });
    
    toast.current?.show({
      severity: 'success',
      summary: 'Hozzáadva',
      detail: 'Időpont hozzáadva a kosárhoz'
    });
  };


  const getAvailableDates = (): { minDate: Date; maxDate: Date } | null => {
    if (!event) return null;
    
    const startDate = parseISO(event.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseISO(event.end_date);
    endDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return { 
      minDate: startDate > today ? startDate : today,
      maxDate: endDate
    };
  };

  const goToPreviousDay = () => {
    if (!selectedDate) return;
    const dates = getAvailableDates();
    if (!dates) return;
    
    const newDate = subDays(selectedDate, 1);
    newDate.setHours(0, 0, 0, 0);
    
    // Compare using getTime() for accurate date comparison
    if (newDate.getTime() >= dates.minDate.getTime()) {
      setSelectedDate(newDate);
    }
  };

  const goToNextDay = () => {
    if (!selectedDate) return;
    const dates = getAvailableDates();
    if (!dates) return;
    
    const newDate = addDays(selectedDate, 1);
    newDate.setHours(0, 0, 0, 0);
    
    // Compare using getTime() for accurate date comparison
    if (newDate.getTime() <= dates.maxDate.getTime()) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    if (!event) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = parseISO(event.start_date);
    startDate.setHours(0, 0, 0, 0);
    setSelectedDate(startDate > today ? startDate : today);
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return 'Ma';
    }
    if (isTomorrow(date)) {
      return 'Holnap';
    }
    return format(date, 'EEEE, MMMM d', { locale: hu });
  };

  const handleCheckout = () => {
    setCartVisible(false);
    navigate('/checkout');
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
              <span>{Math.round(event.price_per_slot).toLocaleString()} Ft</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-images"></i>
              <span>5 db szerkesztett kép</span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="special-event-gallery-section">
          <h2>Galéria</h2>
          <div className="special-event-gallery-grid">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className="special-gallery-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setGalleryActiveIndex(index);
                  setDisplayGallery(true);
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setGalleryActiveIndex(index);
                    setDisplayGallery(true);
                  }
                }}
              >
                <img src={image} alt={`${event.name} ${index + 1}`} />
                <div className="special-gallery-item-overlay">
                  <i className="pi pi-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Navigation */}
        <div className="date-navigation-section">
          <div className="date-nav-left">
            <Button 
              icon="pi pi-chevron-left" 
              onClick={goToPreviousDay}
              className="date-nav-button"
              outlined
              disabled={selectedDate && dates ? selectedDate.getTime() <= dates.minDate.getTime() : false}
            />
            <h2 className="date-header">
              {selectedDate && formatDateHeader(selectedDate)}
            </h2>
            <Button 
              icon="pi pi-chevron-right" 
              onClick={goToNextDay}
              className="date-nav-button"
              outlined
              disabled={selectedDate && dates ? selectedDate.getTime() >= dates.maxDate.getTime() : false}
            />
          </div>
          
          <div className="date-nav-right">
            <Button 
              label="Ma"
              onClick={goToToday}
              className="today-button"
              outlined
              disabled={selectedDate ? isToday(selectedDate) : false}
            />
            <Calendar
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.value as Date)}
              showIcon
              icon="pi pi-calendar"
              dateFormat="yy-mm-dd"
              minDate={dates?.minDate}
              maxDate={dates?.maxDate}
              className="date-picker-with-icon"
            />
          </div>
        </div>

        {/* Time Slots - Two Column Layout */}
        {selectedDate && (
          <div className="time-slots-section">
            <div className="section-header">
              <h2>Elérhető időpontok - {format(selectedDate, 'yyyy. MMMM d.', { locale: hu })}</h2>
              {selectedSlots.length > 0 && (
                <div className="selected-info">
                  <span>{selectedSlots.length} időpont kiválasztva</span>
                  <span className="total-price">
                    Összesen: {Math.round(selectedSlots.length * event.price_per_slot).toLocaleString()} Ft
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

      </div>

      {/* Floating Cart Button */}
      <Button
        icon="pi pi-shopping-cart"
        onClick={() => setCartVisible(true)}
        className="floating-cart-button"
        severity="secondary"
        rounded
        size="large"
        aria-label={`Kosár (${items.length})`}
      >
        {items.length > 0 && (
          <Badge 
            value={items.length} 
            severity="danger" 
            className="floating-cart-badge"
          />
        )}
      </Button>

      <CartDrawer
        visible={cartVisible}
        onHide={() => setCartVisible(false)}
        onCheckout={handleCheckout}
      />

      {/* Gallery Lightbox */}
      {displayGallery && (
        <div className="custom-lightbox">
          {/* Background overlay */}
          <div 
            className="custom-lightbox-overlay"
            onClick={() => setDisplayGallery(false)}
          />
          
          {/* Close button */}
          <button 
            className="custom-lightbox-close"
            onClick={() => setDisplayGallery(false)}
            aria-label="Close"
          >
            <i className="pi pi-times"></i>
          </button>
          
          {/* Previous button */}
          <button 
            className="custom-lightbox-prev"
            onClick={handlePrevImage}
            aria-label="Previous"
          >
            <i className="pi pi-chevron-left"></i>
          </button>
          
          {/* Next button */}
          <button 
            className="custom-lightbox-next"
            onClick={handleNextImage}
            aria-label="Next"
          >
            <i className="pi pi-chevron-right"></i>
          </button>
          
          {/* Image container */}
          <div className="custom-lightbox-content">
            <img 
              src={galleryImages[galleryActiveIndex]} 
              alt={`${event.name} ${galleryActiveIndex + 1}`}
              className="custom-lightbox-image"
            />
            <div className="custom-lightbox-counter">
              {galleryActiveIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialEventBookingPage;

