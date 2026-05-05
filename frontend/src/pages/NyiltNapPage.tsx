import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { CartDrawer } from '../components/CartDrawer';
import './SpecialEventBookingPage.css';

const EVENT_SLUG = 'nyiltnap';
const EVENT_NAME = 'Nyílt nap 2.0.';

const EVENT_DESCRIPTION = `📸 Nyílt nap – júniusban is folytatjuk!

Az áprilisi sikeres nyílt napunk után júniusban újra megnyitjuk a stúdiót – ha lemaradtál, most itt az alkalom, ha pedig ott voltál, tudod, miért érdemes visszajönni 😉

✨ Mire számíthatsz?
– 4 különböző karakterű modell, fejenként több szettben
– 4 különböző helyszín, sokféle hangulat
→ tökéletes lehetőség portfólióbővítésre

Mi mindent biztosítunk, neked csak annyi a dolgod, hogy megérkezz a fényképezőgépeddel és alkoss!

🕓 Program:
16:00–18:00 → 2 óra fotózás (max. 8 fő)
18:00–20:00 → kötetlen beszélgetés, tapasztalatmegosztás és "szakmázás" egy kis harapnivaló és egy pohár bor társaságában 🍷

💸 Ár: 30.000 Ft

Kezdőket és profikat is várunk:
– ha már tapasztalt vagy, szabadon kipróbálhatsz mindent, önállóan dolgozhatsz a modellekkel
– ha most indulsz, segítünk a stúdióeszközök használatában

A cél ugyanaz, mint legutóbb: jó hangulat, inspiráló közeg és egy erősödő fotós közösség 🤍

Még nem győztünk meg?
A nyíltnap után 2 héttel képértékelést tartunk, ahol a stúdió tulaja, Illés Anna, személyesen ad tanácsot a nyílt napon készült képekkel kapcsolatban. Anna olyan neves cégekkel dolgozott korábban együtt, mint Nikon Magyarország, Xiaomi Magyarország és Four Seasons Hotel Budapest. Mi nem csak helyszínt és modelleket biztosítunk, hanem valódi lehetőséget a fejlődésre és a közös tanulásra. Kár lenne kihagyni, ezt a lehetőséget! 😉

Várunk szeretettel!
`;

interface FixedSlot {
  start_time: string;
  end_time: string;
  price: number;
  max_capacity: number;
}

const FIXED_SLOTS: FixedSlot[] = [
  { start_time: '16:00:00', end_time: '18:00:00', price: 30000, max_capacity: 8 },
  { start_time: '18:00:00', end_time: '20:00:00', price: 0, max_capacity: 50 },
];

const MODEL_GALLERY_IMAGES = [
  '/images/special/nyiltmodel/01.JPG',
  '/images/special/nyiltmodel/02.jpg',
  '/images/special/nyiltmodel/03.jpg',
  '/images/special/nyiltmodel/04.jpg',
  '/images/special/nyiltmodel/05.png',
  '/images/special/nyiltmodel/06.JPG',
  '/images/special/nyiltmodel/07.png',
  '/images/special/nyiltmodel/08.png',
];

const GALLERY_IMAGES = [
  '/images/special/nyilt/01.jpg',
  '/images/special/nyilt/02.jpg',
  '/images/special/nyilt/03.jpg',
  '/images/special/nyilt/04.jpg',
  '/images/special/nyilt/05.jpg',
  '/images/special/nyilt/06.jpg',
  '/images/special/nyilt/07.jpg',
  '/images/special/nyilt/08.jpg',
  '/images/special/nyilt/10.jpg',
  '/images/special/nyilt/11.jpg',
];

interface ApiSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  remaining_capacity?: number;
  max_capacity?: number;
  price?: number;
}

interface FetchedEvent {
  id: string;
  start_date: string;
  room_id: string | null;
  room_name?: string | null;
}

export const NyiltNapPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, removeItem, items } = useCart();
  const toast = React.useRef<Toast>(null);

  const [event, setEvent] = useState<FetchedEvent | null>(null);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiSlots, setApiSlots] = useState<ApiSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState<number>(0);
  const [displayGallery, setDisplayGallery] = useState<boolean>(false);
  const [modelGalleryActiveIndex, setModelGalleryActiveIndex] = useState<number>(0);
  const [displayModelGallery, setDisplayModelGallery] = useState<boolean>(false);

  useEffect(() => {
    fetchEvent();
  }, []);

  useEffect(() => {
    if (event && eventDate) {
      fetchAvailability(event.id, eventDate);
    }
  }, [event, eventDate]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/special-events/${EVENT_SLUG}`);
      const data = response.data.event;
      setEvent({
        id: data.id,
        start_date: data.start_date,
        room_id: data.room_id,
        room_name: data.room_name,
      });
      const date = parseISO(data.start_date);
      date.setHours(0, 0, 0, 0);
      setEventDate(date);
    } catch (error) {
      console.error('Error fetching nyilt nap event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (eventId: string, date: Date) => {
    setLoadingAvailability(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`/api/special-events/${eventId}/availability`, {
        params: { date: dateStr },
      });
      setApiSlots(response.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const findApiSlot = (startTime: string): ApiSlot | undefined =>
    apiSlots.find((s) => s.start_time === startTime || s.start_time.substring(0, 5) === startTime.substring(0, 5));

  const handlePrevImage = () => {
    setGalleryActiveIndex((prev) => (prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setGalleryActiveIndex((prev) => (prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1));
  };
  const handlePrevModelImage = () => {
    setModelGalleryActiveIndex((prev) => (prev === 0 ? MODEL_GALLERY_IMAGES.length - 1 : prev - 1));
  };
  const handleNextModelImage = () => {
    setModelGalleryActiveIndex((prev) => (prev === MODEL_GALLERY_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const handleGalleryKeyDown = (e: KeyboardEvent) => {
    if (displayModelGallery) {
      if (e.key === 'Escape') setDisplayModelGallery(false);
      if (e.key === 'ArrowLeft') handlePrevModelImage();
      if (e.key === 'ArrowRight') handleNextModelImage();
      return;
    }
    if (!displayGallery) return;
    if (e.key === 'Escape') setDisplayGallery(false);
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleGalleryKeyDown);
    return () => window.removeEventListener('keydown', handleGalleryKeyDown);
  }, [displayGallery, displayModelGallery, galleryActiveIndex, modelGalleryActiveIndex]);

  const handleSlotClick = (slot: FixedSlot) => {
    if (!event || !eventDate) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Nem elérhető',
        detail: 'Az esemény jelenleg nem foglalható. Kérjük, próbáld újra később.',
      });
      return;
    }

    const dateStr = format(eventDate, 'yyyy-MM-dd');
    const startTime = slot.start_time.substring(0, 5);
    const endTime = slot.end_time.substring(0, 5);

    const apiSlot = findApiSlot(slot.start_time);
    const remainingFromApi = apiSlot?.remaining_capacity;
    const remainingSpots = remainingFromApi !== undefined ? remainingFromApi : slot.max_capacity;

    const baseRoomId = event.room_id || `special-event-${event.id}`;
    const bookingsInCart = items.filter(
      (item) =>
        item.special_event_id === event.id &&
        item.date === dateStr &&
        item.start_time === startTime
    ).length;

    if (bookingsInCart >= remainingSpots) {
      const lastBooking = items
        .filter(
          (item) =>
            item.special_event_id === event.id &&
            item.date === dateStr &&
            item.start_time === startTime
        )
        .pop();
      if (lastBooking) {
        removeItem(lastBooking.room_id, dateStr, startTime);
        toast.current?.show({
          severity: 'info',
          summary: 'Eltávolítva',
          detail: 'Időpont eltávolítva a kosárból',
        });
      }
      return;
    }

    const uniqueRoomId = `${baseRoomId}-booking-${bookingsInCart + 1}`;

    addItem({
      room_id: uniqueRoomId,
      room_name: event.room_name || EVENT_NAME,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      price: slot.price,
      special_event_id: event.id,
      special_event_name: EVENT_NAME,
    });

    toast.current?.show({
      severity: 'success',
      summary: 'Hozzáadva',
      detail: `Időpont hozzáadva (${bookingsInCart + 1}/${remainingSpots})`,
    });
  };

  const handleCheckout = () => {
    setCartVisible(false);
    navigate('/checkout');
  };

  const formatTimeSlot = (startTime: string, endTime: string) =>
    `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
      </div>
    );
  }

  const morningSlots = FIXED_SLOTS.filter((s) => parseInt(s.start_time.split(':')[0]) < 12);
  const afternoonSlots = FIXED_SLOTS.filter((s) => parseInt(s.start_time.split(':')[0]) >= 12);

  const dateStr = eventDate ? format(eventDate, 'yyyy-MM-dd') : '';
  const selectedCountForDate = eventDate
    ? new Set(
        items
          .filter((item) => item.special_event_id === event?.id && item.date === dateStr)
          .map((item) => item.start_time)
      ).size
    : 0;

  const renderSlot = (slot: FixedSlot, index: number) => {
    const apiSlot = findApiSlot(slot.start_time);
    const startTime = slot.start_time.substring(0, 5);

    const remainingSpots =
      apiSlot?.remaining_capacity !== undefined ? apiSlot.remaining_capacity : slot.max_capacity;
    const isAvailable = apiSlot ? apiSlot.available : true;

    const bookingsInCart = items.filter(
      (item) =>
        item.special_event_id === event?.id &&
        item.date === dateStr &&
        item.start_time === startTime
    ).length;

    const isSelected = bookingsInCart > 0;
    const canAddMore = bookingsInCart < remainingSpots;
    const disabled = !event || (!isAvailable && !canAddMore);

    return (
      <button
        key={index}
        className={`time-slot ${disabled ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSlotClick(slot)}
        disabled={disabled}
      >
        <span className="slot-time">{formatTimeSlot(slot.start_time, slot.end_time)}</span>
        <span className="slot-price">
          {slot.price === 0 ? 'Ingyenes' : `${slot.price.toLocaleString()} Ft`}
        </span>
        <span className="slot-status">
          {bookingsInCart > 0
            ? `✓ ${bookingsInCart} kosárban ${canAddMore ? `(+${remainingSpots - bookingsInCart} hely)` : ''}`
            : !isAvailable
            ? 'Betelt'
            : slot.max_capacity > 1
            ? `${remainingSpots} hely maradt`
            : 'Elérhető'}
        </span>
      </button>
    );
  };

  return (
    <div className="special-event-booking-page">
      <Toast ref={toast} />

      <div className="container">
        <div className="event-header">
          <h1>{EVENT_NAME}</h1>
          <p className="event-description">{EVENT_DESCRIPTION}</p>
          <div className="event-details">
            <div className="detail-item">
              <i className="pi pi-clock"></i>
              <span>Egyedi időpontok</span>
            </div>
            <div className="detail-item">
              <i className="pi pi-money-bill"></i>
              <span>Ingyenes - 30,000 Ft</span>
            </div>
          </div>
        </div>

        <div className="time-slots-section">
          <div className="section-header">
            <h2>
              Elérhető időpontok
              {eventDate ? ` - ${format(eventDate, 'yyyy. MMMM d.', { locale: hu })}` : ''}
            </h2>
            {selectedCountForDate > 0 && eventDate && (
              <div className="selected-info">
                <span>{selectedCountForDate} időpont kiválasztva</span>
                <span className="total-price">
                  Összesen:{' '}
                  {Math.round(
                    items
                      .filter(
                        (item) =>
                          item.special_event_id === event?.id && item.date === dateStr
                      )
                      .reduce((sum, item) => sum + item.price, 0)
                  ).toLocaleString()}{' '}
                  Ft
                </span>
              </div>
            )}
          </div>

          {!event && (
            <Card>
              <p>
                Az esemény jelenleg nem foglalható online. Kérjük, vedd fel velünk a kapcsolatot.
              </p>
            </Card>
          )}

          {event && loadingAvailability ? (
            <div className="loading-slots">
              <ProgressSpinner />
            </div>
          ) : event ? (
            <div className="time-slots-grid">
              <div className="time-column">
                <h3 className="column-header">
                  <i className="pi pi-sun"></i>
                  Délelőtt
                </h3>
                <div className="slots-list">
                  {morningSlots.length > 0 ? (
                    morningSlots.map((slot, i) => renderSlot(slot, i))
                  ) : (
                    <p className="no-slots">Nincs elérhető időpont</p>
                  )}
                </div>
              </div>

              <div className="time-column">
                <h3 className="column-header">
                  <i className="pi pi-moon"></i>
                  Délután
                </h3>
                <div className="slots-list">
                  {afternoonSlots.length > 0 ? (
                    afternoonSlots.map((slot, i) => renderSlot(slot, i))
                  ) : (
                    <p className="no-slots">Nincs elérhető időpont</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="special-event-gallery-section">
          <h2>Models / Modellek</h2>
          <div className="special-event-gallery-grid">
            {MODEL_GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="special-gallery-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModelGalleryActiveIndex(index);
                  setDisplayModelGallery(true);
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setModelGalleryActiveIndex(index);
                    setDisplayModelGallery(true);
                  }
                }}
              >
                <img src={image} alt={`Model ${index + 1}`} />
                <div className="special-gallery-item-overlay">
                  <i className="pi pi-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="special-event-gallery-section">
          <h2>Galéria</h2>
          <div className="special-event-gallery-grid">
            {GALLERY_IMAGES.map((image, index) => (
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
                <img src={image} alt={`${EVENT_NAME} ${index + 1}`} />
                <div className="special-gallery-item-overlay">
                  <i className="pi pi-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <Badge value={items.length} severity="danger" className="floating-cart-badge" />
        )}
      </Button>

      <CartDrawer
        visible={cartVisible}
        onHide={() => setCartVisible(false)}
        onCheckout={handleCheckout}
      />

      {displayModelGallery && (
        <div className="custom-lightbox">
          <div className="custom-lightbox-overlay" onClick={() => setDisplayModelGallery(false)} />
          <button
            className="custom-lightbox-close"
            onClick={() => setDisplayModelGallery(false)}
            aria-label="Close"
          >
            <i className="pi pi-times"></i>
          </button>
          <button
            className="custom-lightbox-prev"
            onClick={handlePrevModelImage}
            aria-label="Previous"
          >
            <i className="pi pi-chevron-left"></i>
          </button>
          <button
            className="custom-lightbox-next"
            onClick={handleNextModelImage}
            aria-label="Next"
          >
            <i className="pi pi-chevron-right"></i>
          </button>
          <div className="custom-lightbox-content">
            <img
              src={MODEL_GALLERY_IMAGES[modelGalleryActiveIndex]}
              alt={`Model ${modelGalleryActiveIndex + 1}`}
              className="custom-lightbox-image"
            />
            <div className="custom-lightbox-counter">
              {modelGalleryActiveIndex + 1} / {MODEL_GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}

      {displayGallery && (
        <div className="custom-lightbox">
          <div className="custom-lightbox-overlay" onClick={() => setDisplayGallery(false)} />
          <button
            className="custom-lightbox-close"
            onClick={() => setDisplayGallery(false)}
            aria-label="Close"
          >
            <i className="pi pi-times"></i>
          </button>
          <button className="custom-lightbox-prev" onClick={handlePrevImage} aria-label="Previous">
            <i className="pi pi-chevron-left"></i>
          </button>
          <button className="custom-lightbox-next" onClick={handleNextImage} aria-label="Next">
            <i className="pi pi-chevron-right"></i>
          </button>
          <div className="custom-lightbox-content">
            <img
              src={GALLERY_IMAGES[galleryActiveIndex]}
              alt={`${EVENT_NAME} ${galleryActiveIndex + 1}`}
              className="custom-lightbox-image"
            />
            <div className="custom-lightbox-counter">
              {galleryActiveIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NyiltNapPage;
