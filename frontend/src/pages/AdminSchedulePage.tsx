import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import './AdminSchedulePage.css';

interface ScheduleBooking {
  id: string;
  booking_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  status: string;
  attendance_status: string;
  admin_notes: string | null;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  order_status: string;
}

export const AdminSchedulePage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = React.useRef<Toast>(null);

  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to next 7 days
    return date;
  });
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<ScheduleBooking | null>(null);
  const [notesDialogVisible, setNotesDialogVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const roomOptions = [
    { label: 'All Rooms', value: '' },
    { label: 'Atelier', value: 'studio-a' },
    { label: 'Frigyes', value: 'studio-b' },
    { label: 'Karinthy', value: 'studio-c' },
  ];

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.is_admin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Load schedule data
  useEffect(() => {
    if (user?.is_admin && token) {
      loadSchedule();
    }
  }, [user, token, dateFrom, dateTo, roomFilter]);

  const loadSchedule = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params: any = {
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
      };

      if (roomFilter) {
        params.room_id = roomFilter;
      }

      const response = await adminAPI.getScheduleView(token, params);
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load schedule',
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const updateAttendance = async (booking: ScheduleBooking, status: string) => {
    if (!token) return;

    try {
      await adminAPI.updateAttendance(token, booking.id, {
        attendance_status: status,
        admin_notes: booking.admin_notes || undefined,
      });

      // Update local state
      setBookings(bookings.map(b =>
        b.id === booking.id ? { ...b, attendance_status: status } : b
      ));

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Updated',
          detail: `Attendance marked as: ${status.replace('_', ' ')}`,
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update attendance:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update attendance',
          life: 3000,
        });
      }
    }
  };

  const openNotesDialog = (booking: ScheduleBooking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || '');
    setNotesDialogVisible(true);
  };

  const saveNotes = async () => {
    if (!token || !selectedBooking) return;

    try {
      await adminAPI.updateAttendance(token, selectedBooking.id, {
        attendance_status: selectedBooking.attendance_status,
        admin_notes: adminNotes,
      });

      // Update local state
      setBookings(bookings.map(b =>
        b.id === selectedBooking.id ? { ...b, admin_notes: adminNotes } : b
      ));

      setNotesDialogVisible(false);
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Saved',
          detail: 'Notes updated successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save notes',
          life: 3000,
        });
      }
    }
  };

  // Column templates
  const dateTimeTemplate = (rowData: ScheduleBooking) => {
    return (
      <div>
        <div className="font-semibold">{rowData.booking_date}</div>
        <div className="text-sm text-gray-600">{rowData.start_time} - {rowData.end_time}</div>
      </div>
    );
  };

  const roomTemplate = (rowData: ScheduleBooking) => {
    return (
      <div>
        <div>{rowData.room_name}</div>
        {rowData.booking_id && (
          <div className="text-xs text-gray-500 font-mono">{rowData.booking_id}</div>
        )}
      </div>
    );
  };

  const customerTemplate = (rowData: ScheduleBooking) => {
    return (
      <div>
        <div className="font-semibold">{rowData.customer_name}</div>
        <div className="text-sm text-gray-600">{rowData.email}</div>
        {rowData.phone && <div className="text-sm text-gray-600">{rowData.phone}</div>}
      </div>
    );
  };

  const attendanceTemplate = (rowData: ScheduleBooking) => {
    const getAttendanceSeverity = (status: string) => {
      switch (status) {
        case 'showed_up':
          return 'success';
        case 'no_show':
          return 'danger';
        case 'cancelled':
          return 'warning';
        default:
          return 'info';
      }
    };

    return (
      <Tag
        value={rowData.attendance_status.replace('_', ' ').toUpperCase()}
        severity={getAttendanceSeverity(rowData.attendance_status)}
      />
    );
  };

  const actionsTemplate = (rowData: ScheduleBooking) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-button-sm"
          tooltip="Showed Up"
          tooltipOptions={{ position: 'top' }}
          onClick={() => updateAttendance(rowData, 'showed_up')}
          disabled={rowData.attendance_status === 'showed_up'}
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-sm"
          tooltip="No Show"
          tooltipOptions={{ position: 'top' }}
          onClick={() => updateAttendance(rowData, 'no_show')}
          disabled={rowData.attendance_status === 'no_show'}
        />
        <Button
          icon="pi pi-file-edit"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="Add Notes"
          tooltipOptions={{ position: 'top' }}
          onClick={() => openNotesDialog(rowData)}
        />
      </div>
    );
  };

  const notesTemplate = (rowData: ScheduleBooking) => {
    if (!rowData.admin_notes) return <span className="text-gray-400">No notes</span>;
    return (
      <div className="text-sm">
        {rowData.admin_notes.length > 50
          ? `${rowData.admin_notes.substring(0, 50)}...`
          : rowData.admin_notes}
      </div>
    );
  };

  return (
    <div className="admin-schedule-page p-4">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-4xl font-bold m-0">Schedule & Attendance</h1>
        <Button
          label="View Orders"
          icon="pi pi-list"
          onClick={() => navigate('/admin/bookings')}
          outlined
        />
      </div>

      {/* Filters */}
      <div className="filters-card card p-3 mb-4">
        <div className="filters-row">
          <div className="filter-item">
            <label htmlFor="date-from">Date From</label>
            <Calendar
              id="date-from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.value as Date)}
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="From date"
            />
          </div>
          <div className="filter-item">
            <label htmlFor="date-to">Date To</label>
            <Calendar
              id="date-to"
              value={dateTo}
              onChange={(e) => setDateTo(e.value as Date)}
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="To date"
            />
          </div>
          <div className="filter-item">
            <label htmlFor="room-filter">Room</label>
            <Dropdown
              id="room-filter"
              value={roomFilter}
              options={roomOptions}
              onChange={(e) => setRoomFilter(e.value)}
              placeholder="Select Room"
            />
          </div>
          <div className="filter-item filter-button">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              onClick={loadSchedule}
              outlined
            />
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="card">
        <DataTable
          value={bookings}
          loading={loading}
          paginator
          rows={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          emptyMessage="No bookings found"
          stripedRows
          showGridlines
          responsiveLayout="scroll"
        >
          <Column
            field="booking_date"
            header="Date & Time"
            body={dateTimeTemplate}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            field="room_name"
            header="Room"
            body={roomTemplate}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            header="Customer"
            body={customerTemplate}
            style={{ minWidth: '200px' }}
          />
          <Column
            field="attendance_status"
            header="Status"
            body={attendanceTemplate}
            sortable
            style={{ minWidth: '120px' }}
          />
          <Column
            header="Notes"
            body={notesTemplate}
            style={{ minWidth: '150px' }}
          />
          <Column
            header="Actions"
            body={actionsTemplate}
            style={{ minWidth: '180px' }}
          />
        </DataTable>
      </div>

      {/* Notes Dialog */}
      <Dialog
        header="Admin Notes"
        visible={notesDialogVisible}
        style={{ width: '500px' }}
        onHide={() => setNotesDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setNotesDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={saveNotes}
              autoFocus
            />
          </div>
        }
      >
        {selectedBooking && (
          <div className="mb-3">
            <p className="mb-2">
              <strong>Booking:</strong> {selectedBooking.room_name} - {selectedBooking.booking_date} {selectedBooking.start_time}
            </p>
            <p className="mb-2">
              <strong>Customer:</strong> {selectedBooking.customer_name}
            </p>
          </div>
        )}
        <InputTextarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={5}
          className="w-full"
          placeholder="Add notes about this booking..."
        />
      </Dialog>
    </div>
  );
};

