import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { format, addDays, subDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import api, { adminAPI } from '../services/api';
import { AvailabilityResponse } from '../types';
import { getHungarianToday } from '../utils/timezone';
import './AdminManualBookingPage.css';

interface SelectedSlot {
  room_id: string;
  room_name: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
}

export const AdminManualBookingPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(getHungarianToday());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Customer form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [freeOfCharge, setFreeOfCharge] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [language, setLanguage] = useState<'hu' | 'en'>('hu');

  // Admin guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!user?.is_admin) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadAvailability = async () => {
    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await api.getAvailability(dateStr);
      setAvailability(data);
    } catch (err) {
      console.error('Error loading availability:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load availability',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const getStudioPrice = (roomId: string): number => {
    const studio = config?.studios?.find(s => s.id === roomId);
    return studio?.price ?? config?.hourlyRate ?? 13000;
  };

  const isSelected = (roomId: string, date: string, time: string) =>
    selectedSlots.some(
      s => s.room_id === roomId && s.date === date && s.start_time === time
    );

  const toggleSlot = (roomId: string, roomName: string, time: string, status: string) => {
    if (status !== 'available') return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const endTime = `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;

    if (isSelected(roomId, dateStr, time)) {
      setSelectedSlots(prev =>
        prev.filter(s => !(s.room_id === roomId && s.date === dateStr && s.start_time === time))
      );
    } else {
      setSelectedSlots(prev => [
        ...prev,
        {
          room_id: roomId,
          room_name: roomName,
          date: dateStr,
          start_time: time,
          end_time: endTime,
          price: getStudioPrice(roomId),
        },
      ]);
    }
  };

  const total = freeOfCharge
    ? 0
    : selectedSlots.reduce((sum, s) => sum + s.price, 0);

  const canSubmit =
    customerName.trim().length >= 2 && selectedSlots.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!token || !canSubmit) return;

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Invalid email',
        detail: 'Please enter a valid email address or leave it empty',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminAPI.createManualBooking(token, {
        items: selectedSlots.map(s => ({
          room_id: s.room_id,
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
        },
        note: note.trim() || undefined,
        free_of_charge: freeOfCharge,
        send_email: sendEmail,
        language,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Booking created',
        detail: `Order ${String(result.orderId).slice(-8).toUpperCase()} created for ${customerName.trim()}${
          result.email_sent ? ' - confirmation email sent' : ''
        }`,
        life: 6000,
      });

      // Reset selection but keep the date so the admin sees the slots become booked
      setSelectedSlots([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNote('');
      setFreeOfCharge(false);
      loadAvailability();
    } catch (err: any) {
      const detail =
        err?.response?.data?.error || err?.message || 'Failed to create booking';
      toast.current?.show({ severity: 'error', summary: 'Error', detail });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="admin-manual-booking-page">
      <Toast ref={toast} />
      <div className="manual-booking-header">
        <h1>Manual Booking</h1>
        <p>
          Create a booking on behalf of a customer (phone / email bookings, big clients).
          Payment is skipped - settle the invoice offline.
        </p>
        <Button
          label="Back to Bookings"
          icon="pi pi-arrow-left"
          text
          onClick={() => navigate('/admin/bookings')}
        />
      </div>

      <div className="manual-booking-layout">
        {/* Slot picker */}
        <Card className="slot-picker-card">
          <div className="slot-picker-toolbar">
            <Button icon="pi pi-chevron-left" text onClick={() => setSelectedDate(d => subDays(d, 1))} aria-label="Previous day" />
            <Calendar
              value={selectedDate}
              onChange={(e) => e.value && setSelectedDate(e.value as Date)}
              dateFormat="yy-mm-dd"
              showIcon
            />
            <Button icon="pi pi-chevron-right" text onClick={() => setSelectedDate(d => addDays(d, 1))} aria-label="Next day" />
            <Button label="Today" text onClick={() => setSelectedDate(getHungarianToday())} />
          </div>

          {loadingSlots && <p className="slots-loading">Loading availability…</p>}

          {!loadingSlots && availability && (
            <div className="manual-slot-grid-wrapper">
              <table className="manual-slot-grid">
                <thead>
                  <tr>
                    <th>Time</th>
                    {availability.rooms.map(room => (
                      <th key={room.id}>
                        {room.name}
                        <small>{getStudioPrice(room.id).toLocaleString()} Ft/h</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availability.rooms[0]?.slots.map((_, timeIndex) => {
                    const time = availability.rooms[0].slots[timeIndex].time;
                    return (
                      <tr key={time}>
                        <td className="time-cell">{time}</td>
                        {availability.rooms.map(room => {
                          const slot = room.slots[timeIndex];
                          const dateStr = format(selectedDate, 'yyyy-MM-dd');
                          const selected = isSelected(room.id, dateStr, slot?.time || time);
                          const status = slot?.status || 'unavailable';
                          const cellClass = selected
                            ? 'slot selected'
                            : status === 'available'
                            ? 'slot available'
                            : 'slot blocked';
                          return (
                            <td
                              key={room.id}
                              className={cellClass}
                              onClick={() => slot && toggleSlot(room.id, room.name, slot.time, status)}
                            >
                              {selected ? '✓' : status === 'available' ? '' : '×'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Customer form + summary */}
        <Card className="customer-form-card">
          <h3>Customer</h3>
          <div className="field">
            <label htmlFor="mb-name">Name *</label>
            <InputText
              id="mb-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Client or company name"
            />
          </div>
          <div className="field">
            <label htmlFor="mb-email">Email</label>
            <InputText
              id="mb-email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Optional - for confirmation email"
            />
          </div>
          <div className="field">
            <label htmlFor="mb-phone">Phone</label>
            <InputText
              id="mb-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label htmlFor="mb-note">Internal note</label>
            <InputTextarea
              id="mb-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Visible to admins only"
            />
          </div>
          <div className="field">
            <label htmlFor="mb-lang">Email language</label>
            <Dropdown
              id="mb-lang"
              value={language}
              options={[
                { label: 'Magyar', value: 'hu' },
                { label: 'English', value: 'en' },
              ]}
              onChange={(e) => setLanguage(e.value)}
            />
          </div>
          <div className="field-checkbox">
            <Checkbox
              inputId="mb-free"
              checked={freeOfCharge}
              onChange={(e) => setFreeOfCharge(!!e.checked)}
            />
            <label htmlFor="mb-free">Free of charge (0 Ft)</label>
          </div>
          <div className="field-checkbox">
            <Checkbox
              inputId="mb-send"
              checked={sendEmail && !!customerEmail.trim()}
              disabled={!customerEmail.trim()}
              onChange={(e) => setSendEmail(!!e.checked)}
            />
            <label htmlFor="mb-send">Send confirmation email</label>
          </div>

          <h3>Selected slots ({selectedSlots.length})</h3>
          {selectedSlots.length === 0 && <p className="no-slots-hint">Click available slots in the grid.</p>}
          <ul className="selected-slot-list">
            {selectedSlots.map(s => (
              <li key={`${s.room_id}-${s.date}-${s.start_time}`}>
                <span>
                  {s.room_name} · {s.date} · {s.start_time}-{s.end_time}
                </span>
                <span className="slot-price">
                  {freeOfCharge ? '0' : s.price.toLocaleString()} Ft
                </span>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  aria-label="Remove"
                  onClick={() =>
                    setSelectedSlots(prev =>
                      prev.filter(
                        x => !(x.room_id === s.room_id && x.date === s.date && x.start_time === s.start_time)
                      )
                    )
                  }
                />
              </li>
            ))}
          </ul>

          <div className="manual-booking-total">
            <span>Total</span>
            <strong>{total.toLocaleString()} Ft</strong>
          </div>

          <Button
            label={submitting ? 'Creating…' : 'Create booking'}
            icon="pi pi-check"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="create-booking-button"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminManualBookingPage;
