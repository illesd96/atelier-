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
  room_id: string | null;
  room_name?: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  price_per_slot: number;
  use_custom_slots?: boolean;
  custom_slots?: Array<{ start: string; end: string; price?: number; max_capacity?: number }>;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  remaining_capacity?: number;
  max_capacity?: number;
  price?: number;
}

export const SpecialEventBookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { addItem, removeItem, items } = useCart();
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
  const [maxCapacityPerSlot, setMaxCapacityPerSlot] = useState<number>(1);

  // Gallery images for special event (19 images total)
  const galleryImages = [
    '/images/special/01.JPG',
    '/images/special/02.JPG',
    '/images/special/03.JPG',
    '/images/special/04.JPG',
    '/images/special/05.JPG',
    '/images/special/06.JPG',
    '/images/special/07.JPG',
    '/images/special/08.JPG',
    '/images/special/10.JPG',
    '/images/special/11.JPG',
    '/images/special/12.JPG',
    '/images/special/13.JPG',
    '/images/special/14.JPG',
    '/images/special/15.JPG',
    '/images/special/16.JPG',
    '/images/special/17.JPG',
    '/images/special/18.JPG',
    '/images/special/19.JPG'
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
      // Use event.id (UUID) instead of eventId (slug/UUID from URL) for reliability
      const response = await axios.get(`/api/special-events/${event.id}/availability`, {
        params: { date: dateStr }
      });
      setAvailableSlots(response.data.availableSlots || []);
      setMaxCapacityPerSlot(response.data.maxCapacityPerSlot || 1);
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
    // Get unique slot times that have at least one booking
    const uniqueSlotTimes = [...new Set(
      items
        .filter(item => 
          item.special_event_id === event.id && 
          item.date === dateStr
        )
        .map(item => `${item.start_time}:00`)
    )];
    
    setSelectedSlots(uniqueSlotTimes);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    if (!event || !selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = slot.start_time.substring(0, 5);
    
    // Base room_id (use event room or create placeholder)
    const baseRoomId = event.room_id || `special-event-${event.id}`;
    
    // Count how many times this slot is already in cart
    const bookingsInCart = items.filter(item => 
      item.special_event_id === event.id && 
      item.date === dateStr && 
      item.start_time === startTime
    ).length;
    
    // remaining_capacity from server already accounts for other bookings
    // We can only add to cart up to what's remaining on the server
    const slotMaxCapacity = slot.max_capacity || maxCapacityPerSlot;
    const remainingSpots = slot.remaining_capacity !== undefined ? slot.remaining_capacity : slotMaxCapacity;
    
    // If we've already added all available spots to cart, remove the last one
    if (bookingsInCart >= remainingSpots) {
      // Cart has all available spots, remove the most recent booking
      const lastBooking = items.filter(item => 
        item.special_event_id === event.id && 
        item.date === dateStr && 
        item.start_time === startTime
      ).pop();
      
      if (lastBooking) {
        removeItem(lastBooking.room_id, dateStr, startTime);
        toast.current?.show({
          severity: 'info',
          summary: 'Eltávolítva',
          detail: 'Időpont eltávolítva a kosárból'
        });
      }
      return;
    }
    
    // Add to cart with unique room_id (append booking number)
    const uniqueRoomId = `${baseRoomId}-booking-${bookingsInCart + 1}`;
    
    // Use per-slot price if available, otherwise event-level price
    const slotPrice = slot.price !== undefined ? slot.price : parseFloat(event.price_per_slot.toString());

    addItem({
      room_id: uniqueRoomId,
      room_name: event.room_name || event.name,
      date: dateStr,
      start_time: startTime,
      end_time: slot.end_time.substring(0, 5),
      price: slotPrice,
      special_event_id: event.id,
      special_event_name: event.name
    });
    
    toast.current?.show({
      severity: 'success',
      summary: 'Hozzáadva',
      detail: `Időpont hozzáadva (${bookingsInCart + 1}/${remainingSpots})`
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
      if (hour < 12) {
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
            {event.room_name && (
              <div className="detail-item">
                <i className="pi pi-home"></i>
                <span>{event.room_name}</span>
              </div>
            )}
            <div className="detail-item">
              <i className="pi pi-clock"></i>
              <span>{event.use_custom_slots ? 'Egyedi időpontok' : `${event.slot_duration_minutes} perc / időpont`}</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-money-bill"></i>
              <span>
                {event.use_custom_slots && event.custom_slots && event.custom_slots.some(s => s.price !== undefined) ? (
                  (() => {
                    const prices = event.custom_slots!.map(s => s.price !== undefined ? s.price : event.price_per_slot);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    if (minPrice === maxPrice) return `${Math.round(minPrice).toLocaleString()} Ft`;
                    if (minPrice === 0) return `Ingyenes - ${Math.round(maxPrice).toLocaleString()} Ft`;
                    return `${Math.round(minPrice).toLocaleString()} - ${Math.round(maxPrice).toLocaleString()} Ft`;
                  })()
                ) : (
                  `${Math.round(event.price_per_slot).toLocaleString()} Ft`
                )}
              </span>
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
                    Összesen: {(() => {
                      const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                      const total = items
                        .filter(item => item.special_event_id === event.id && item.date === dateStr)
                        .reduce((sum, item) => sum + item.price, 0);
                      return Math.round(total).toLocaleString();
                    })()} Ft
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
                    Délelőtt
                  </h3>
                  <div className="slots-list">
                    {morningSlots.length > 0 ? (
                      morningSlots.map((slot, index) => {
                        const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                        const startTime = slot.start_time.substring(0, 5);

                        // Count bookings in cart for this specific slot
                        const bookingsInCart = items.filter(item =>
                          item.special_event_id === event?.id &&
                          item.date === dateStr &&
                          item.start_time === startTime
                        ).length;

                        const slotMaxCapacity = slot.max_capacity || maxCapacityPerSlot;
                        const remainingSpots = slot.remaining_capacity !== undefined ? slot.remaining_capacity : slotMaxCapacity;
                        const isSelected = bookingsInCart > 0;
                        const canAddMore = bookingsInCart < remainingSpots;
                        const slotPrice = slot.price !== undefined ? slot.price : event.price_per_slot;

                        return (
                          <button
                            key={index}
                            className={`time-slot ${!slot.available && !canAddMore ? 'unavailable' : ''} ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => handleSlotClick(slot)}
                            disabled={!slot.available && !canAddMore}
                          >
                            <span className="slot-time">
                              {formatTimeSlot(slot.start_time, slot.end_time)}
                            </span>
                            <span className="slot-price">
                              {slotPrice === 0 ? 'Ingyenes' : `${Math.round(slotPrice).toLocaleString()} Ft`}
                            </span>
                            <span className="slot-status">
                              {bookingsInCart > 0 ? (
                                `✓ ${bookingsInCart} kosárban ${canAddMore ? `(+${remainingSpots - bookingsInCart} hely)` : ''}`
                              ) : !slot.available ? (
                                'Betelt'
                              ) : slotMaxCapacity > 1 ? (
                                `${remainingSpots} hely maradt`
                              ) : (
                                'Elérhető'
                              )}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="no-slots">Nincs elérhető időpont</p>
                    )}
                  </div>
                </div>

                {/* Afternoon Column (14:00 - 20:00) */}
                <div className="time-column">
                  <h3 className="column-header">
                    <i className="pi pi-moon"></i>
                    Délután 
                  </h3>
                  <div className="slots-list">
                    {afternoonSlots.length > 0 ? (
                      afternoonSlots.map((slot, index) => {
                        const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                        const startTime = slot.start_time.substring(0, 5);

                        // Count bookings in cart for this specific slot
                        const bookingsInCart = items.filter(item =>
                          item.special_event_id === event?.id &&
                          item.date === dateStr &&
                          item.start_time === startTime
                        ).length;

                        const slotMaxCapacity = slot.max_capacity || maxCapacityPerSlot;
                        const remainingSpots = slot.remaining_capacity !== undefined ? slot.remaining_capacity : slotMaxCapacity;
                        const isSelected = bookingsInCart > 0;
                        const canAddMore = bookingsInCart < remainingSpots;
                        const slotPrice = slot.price !== undefined ? slot.price : event.price_per_slot;

                        return (
                          <button
                            key={index}
                            className={`time-slot ${!slot.available && !canAddMore ? 'unavailable' : ''} ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => handleSlotClick(slot)}
                            disabled={!slot.available && !canAddMore}
                          >
                            <span className="slot-time">
                              {formatTimeSlot(slot.start_time, slot.end_time)}
                            </span>
                            <span className="slot-price">
                              {slotPrice === 0 ? 'Ingyenes' : `${Math.round(slotPrice).toLocaleString()} Ft`}
                            </span>
                            <span className="slot-status">
                              {bookingsInCart > 0 ? (
                                `✓ ${bookingsInCart} kosárban ${canAddMore ? `(+${remainingSpots - bookingsInCart} hely)` : ''}`
                              ) : !slot.available ? (
                                'Betelt'
                              ) : slotMaxCapacity > 1 ? (
                                `${remainingSpots} hely maradt`
                              ) : (
                                'Elérhető'
                              )}
                            </span>
                          </button>
                        );
                      })
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

