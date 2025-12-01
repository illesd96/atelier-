import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import './SpecialEventsPage.css';

interface SpecialEvent {
  id: string;
  name: string;
  description?: string;
  room_id: string;
  room_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  price_per_slot: number;
  active: boolean;
  total_bookings?: number;
  created_at: string;
}

interface Room {
  id: string;
  name: string;
}

export const SpecialEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const toast = React.useRef<Toast>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room_id: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    start_time: '08:00:00',
    end_time: '20:00:00',
    slot_duration_minutes: 15,
    price_per_slot: 15000,
    active: true
  });

  useEffect(() => {
    fetchEvents();
    fetchRooms();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/special-events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching special events:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hiba',
        detail: 'Nem sikerült betölteni a különleges eseményeket'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/config');
      setRooms(response.data.studios);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      room_id: '',
      start_date: null,
      end_date: null,
      start_time: '08:00:00',
      end_time: '20:00:00',
      slot_duration_minutes: 15,
      price_per_slot: 15000,
      active: true
    });
    setDialogVisible(true);
  };

  const openEditDialog = (event: SpecialEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      room_id: event.room_id,
      start_date: parseISO(event.start_date),
      end_date: parseISO(event.end_date),
      start_time: event.start_time,
      end_time: event.end_time,
      slot_duration_minutes: event.slot_duration_minutes,
      price_per_slot: event.price_per_slot,
      active: event.active
    });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null
      };

      if (editingEvent) {
        await axios.put(`/api/admin/special-events/${editingEvent.id}`, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Sikeres',
          detail: 'Különleges esemény frissítve'
        });
      } else {
        await axios.post('/api/admin/special-events', payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Sikeres',
          detail: 'Különleges esemény létrehozva'
        });
      }

      setDialogVisible(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving special event:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hiba',
        detail: 'Nem sikerült menteni az eseményt'
      });
    }
  };

  const handleDelete = (event: SpecialEvent) => {
    confirmDialog({
      message: `Biztosan törölni szeretnéd ezt az eseményt: ${event.name}?`,
      header: 'Törlés megerősítése',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Igen',
      rejectLabel: 'Nem',
      accept: async () => {
        try {
          await axios.delete(`/api/admin/special-events/${event.id}`);
          toast.current?.show({
            severity: 'success',
            summary: 'Sikeres',
            detail: 'Esemény törölve'
          });
          fetchEvents();
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Hiba',
            detail: error.response?.data?.error || 'Nem sikerült törölni az eseményt'
          });
        }
      }
    });
  };

  const dateBodyTemplate = (rowData: SpecialEvent) => {
    return (
      <div>
        {format(parseISO(rowData.start_date), 'yyyy.MM.dd')} - {format(parseISO(rowData.end_date), 'yyyy.MM.dd')}
      </div>
    );
  };

  const timeBodyTemplate = (rowData: SpecialEvent) => {
    return `${rowData.start_time.substring(0, 5)} - ${rowData.end_time.substring(0, 5)}`;
  };

  const slotBodyTemplate = (rowData: SpecialEvent) => {
    return `${rowData.slot_duration_minutes} perc`;
  };

  const priceBodyTemplate = (rowData: SpecialEvent) => {
    return `${rowData.price_per_slot.toLocaleString()} Ft`;
  };

  const statusBodyTemplate = (rowData: SpecialEvent) => {
    return (
      <span className={`status-badge ${rowData.active ? 'active' : 'inactive'}`}>
        {rowData.active ? 'Aktív' : 'Inaktív'}
      </span>
    );
  };

  const bookingsBodyTemplate = (rowData: SpecialEvent) => {
    return rowData.total_bookings || 0;
  };

  const actionsBodyTemplate = (rowData: SpecialEvent) => {
    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          onClick={() => openEditDialog(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => handleDelete(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="special-events-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="page-header">
        <h1>Különleges Események</h1>
        <Button
          label="Új Esemény"
          icon="pi pi-plus"
          onClick={openCreateDialog}
        />
      </div>

      <DataTable
        value={events}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="Nincs különleges esemény"
        className="special-events-table"
      >
        <Column field="name" header="Név" sortable />
        <Column field="room_name" header="Terem" sortable />
        <Column body={dateBodyTemplate} header="Időszak" sortable field="start_date" />
        <Column body={timeBodyTemplate} header="Időintervallum" />
        <Column body={slotBodyTemplate} header="Időköz" sortable field="slot_duration_minutes" />
        <Column body={priceBodyTemplate} header="Ár/Időköz" sortable field="price_per_slot" />
        <Column body={bookingsBodyTemplate} header="Foglalások" sortable field="total_bookings" />
        <Column body={statusBodyTemplate} header="Státusz" sortable field="active" />
        <Column body={actionsBodyTemplate} header="Műveletek" />
      </DataTable>

      <Dialog
        header={editingEvent ? 'Esemény Szerkesztése' : 'Új Esemény'}
        visible={dialogVisible}
        style={{ width: '600px' }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div>
            <Button label="Mégse" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
            <Button label="Mentés" icon="pi pi-check" onClick={handleSave} />
          </div>
        }
      >
        <div className="event-form">
          <div className="form-field">
            <label>Név *</label>
            <InputText
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="pl. Mikulás fotózás"
            />
          </div>

          <div className="form-field">
            <label>Leírás</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Esemény leírása..."
            />
          </div>

          <div className="form-field">
            <label>Terem *</label>
            <Dropdown
              value={formData.room_id}
              options={rooms}
              onChange={(e) => setFormData({ ...formData, room_id: e.value })}
              optionLabel="name"
              optionValue="id"
              placeholder="Válassz termet"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Kezdő dátum *</label>
              <Calendar
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.value as Date })}
                dateFormat="yy.mm.dd"
                showIcon
              />
            </div>

            <div className="form-field">
              <label>Befejező dátum *</label>
              <Calendar
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.value as Date })}
                dateFormat="yy.mm.dd"
                showIcon
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Kezdés idő</label>
              <InputText
                type="time"
                value={formData.start_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
              />
            </div>

            <div className="form-field">
              <label>Befejezés idő</label>
              <InputText
                type="time"
                value={formData.end_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value + ':00' })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Időköz (perc) *</label>
              <InputNumber
                value={formData.slot_duration_minutes}
                onValueChange={(e) => setFormData({ ...formData, slot_duration_minutes: e.value || 15 })}
                min={5}
                max={120}
                step={5}
              />
            </div>

            <div className="form-field">
              <label>Ár/Időköz (Ft) *</label>
              <InputNumber
                value={formData.price_per_slot}
                onValueChange={(e) => setFormData({ ...formData, price_per_slot: e.value || 0 })}
                mode="currency"
                currency="HUF"
                locale="hu-HU"
              />
            </div>
          </div>

          <div className="form-field checkbox-field">
            <Checkbox
              inputId="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.checked || false })}
            />
            <label htmlFor="active">Aktív</label>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SpecialEventsPage;

