import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import './AdminBookingsPage.css';

interface BookingItem {
  id: string;
  room_id: string;
  room_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  booking_id?: string;
}

interface Booking {
  id: string;
  status: string;
  customer_name: string;
  email: string;
  phone?: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  items: BookingItem[];
  payment_id?: string;
  payment_status?: string;
  invoice_id?: string;
  invoice_number?: string;
  invoice_status?: string;
}

interface BookingStats {
  today_orders: number;
  week_orders: number;
  month_orders: number;
  paid_orders: number;
  pending_orders: number;
  failed_orders: number;
  month_revenue: number;
  total_bookings: number;
  upcoming_bookings: number;
}

export const AdminBookingsPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  // Pagination
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modify dialog state
  const [modifyDialogVisible, setModifyDialogVisible] = useState(false);
  const [selectedBookingItem, setSelectedBookingItem] = useState<BookingItem | null>(null);
  const [modifyData, setModifyData] = useState({
    room_id: '',
    booking_date: null as Date | null,
    start_time: '',
    end_time: '',
  });

  // Status options
  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Expired', value: 'expired' },
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

  // Load data
  useEffect(() => {
    if (user?.is_admin && token) {
      loadBookings();
      loadStats();
    }
  }, [user, token, statusFilter, dateFrom, dateTo, first, rows]);

  const loadBookings = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const params: any = {
        limit: rows,
        offset: first,
      };
      
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = formatDate(dateFrom);
      if (dateTo) params.date_to = formatDate(dateTo);
      
      const response = await adminAPI.getAllBookings(token, params);
      setBookings(response.bookings || []);
      setTotalRecords(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!token) return;
    
    try {
      const response = await adminAPI.getBookingStats(token);
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency || 'HUF',
    }).format(amount);
  };

  // Handler for canceling a booking item
  const handleCancelBookingItem = (item: BookingItem) => {
    confirmDialog({
      message: `Are you sure you want to cancel this booking?\n${item.room_name} - ${item.booking_date} ${item.start_time}-${item.end_time}`,
      header: 'Cancel Booking Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (!token) return;
        
        try {
          await adminAPI.cancelBookingItem(token, item.id);
          
          if (toast.current) {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking item cancelled successfully',
              life: 3000,
            });
          }
          
          // Reload bookings
          loadBookings();
        } catch (error) {
          console.error('Failed to cancel booking item:', error);
          if (toast.current) {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to cancel booking item',
              life: 3000,
            });
          }
        }
      },
    });
  };

  // Handler for opening modify dialog
  const handleModifyBookingItem = (item: BookingItem) => {
    setSelectedBookingItem(item);
    setModifyData({
      room_id: item.room_id,
      booking_date: new Date(item.booking_date),
      start_time: item.start_time,
      end_time: item.end_time,
    });
    setModifyDialogVisible(true);
  };

  // Handler for saving modified booking
  const handleSaveModifiedBooking = async () => {
    if (!token || !selectedBookingItem || !modifyData.booking_date) return;

    try {
      await adminAPI.modifyBookingItem(token, selectedBookingItem.id, {
        room_id: modifyData.room_id,
        booking_date: formatDate(modifyData.booking_date),
        start_time: modifyData.start_time,
        end_time: modifyData.end_time,
      });

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Booking modified successfully',
          life: 3000,
        });
      }

      setModifyDialogVisible(false);
      loadBookings();
    } catch (error: any) {
      console.error('Failed to modify booking:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.error || 'Failed to modify booking',
          life: 5000,
        });
      }
    }
  };

  const statusBodyTemplate = (rowData: Booking) => {
    const statusMap: Record<string, { severity: "success" | "info" | "warning" | "danger", label: string }> = {
      paid: { severity: 'success', label: 'Paid' },
      pending: { severity: 'warning', label: 'Pending' },
      failed: { severity: 'danger', label: 'Failed' },
      cancelled: { severity: 'danger', label: 'Cancelled' },
      expired: { severity: 'info', label: 'Expired' },
    };
    
    const status = statusMap[rowData.status] || { severity: 'info', label: rowData.status };
    
    return <Badge value={status.label} severity={status.severity} />;
  };

  const amountBodyTemplate = (rowData: Booking) => {
    return formatCurrency(rowData.total_amount, rowData.currency);
  };

  const dateBodyTemplate = (rowData: Booking) => {
    return formatDateTime(rowData.created_at);
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/invoices/${invoiceId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to download invoice' 
      });
    }
  };

  const rowExpansionTemplate = (data: Booking) => {
    return (
      <div className="p-3">
        <h5>Booking Details</h5>
        <div className="grid">
          <div className="col-12 md:col-6">
            <p><strong>Order ID:</strong> {data.id}</p>
            <p><strong>Customer:</strong> {data.customer_name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
            {data.user_name && <p><strong>Registered User:</strong> {data.user_name} ({data.user_email})</p>}
          </div>
          <div className="col-12 md:col-6">
            <p><strong>Total Amount:</strong> {formatCurrency(data.total_amount, data.currency)}</p>
            <p><strong>Payment ID:</strong> {data.payment_id || 'N/A'}</p>
            <p><strong>Payment Status:</strong> {data.payment_status || 'N/A'}</p>
            <p><strong>Created:</strong> {formatDateTime(data.created_at)}</p>
            <p><strong>Updated:</strong> {formatDateTime(data.updated_at)}</p>
            {data.invoice_number && (
              <p className="flex align-items-center gap-2">
                <strong>Invoice:</strong> 
                <span>{data.invoice_number}</span>
                <Button
                  icon="pi pi-download"
                  rounded
                  text
                  size="small"
                  onClick={() => handleDownloadInvoice(data.invoice_id!, data.invoice_number!)}
                  tooltip="Download Invoice"
                />
                <Badge value={data.invoice_status} severity={data.invoice_status === 'sent' ? 'success' : 'info'} />
              </p>
            )}
          </div>
        </div>
        
        <h6 className="mt-3">Booked Time Slots</h6>
        <DataTable value={data.items} size="small">
          <Column field="room_name" header="Studio" />
          <Column field="booking_date" header="Date" />
          <Column 
            header="Time" 
            body={(item: BookingItem) => `${item.start_time} - ${item.end_time}`} 
          />
          <Column 
            field="status" 
            header="Status"
            body={(item: BookingItem) => <Badge value={item.status} />}
          />
          <Column 
            header="Actions"
            body={(item: BookingItem) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-info p-button-sm"
                  tooltip="Modify"
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => handleModifyBookingItem(item)}
                  disabled={item.status === 'cancelled'}
                />
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger p-button-sm"
                  tooltip="Cancel"
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => handleCancelBookingItem(item)}
                  disabled={item.status === 'cancelled'}
                />
              </div>
            )}
          />
        </DataTable>
      </div>
    );
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="admin-bookings-page">
      <div className="container">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="m-0">Admin - Bookings Management</h1>
          <div className="flex gap-2">
            <Button
              label="Schedule View"
              icon="pi pi-calendar"
              onClick={() => navigate('/admin/schedule')}
              outlined
            />
            <Button
              label="Special Events"
              icon="pi pi-star"
              onClick={() => navigate('/admin/special-events')}
              outlined
            />
          </div>
        </div>
        
        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid">
            <Card className="stat-card">
              <h3>{stats.today_orders}</h3>
              <p>Today's Orders</p>
            </Card>
            <Card className="stat-card">
              <h3>{stats.week_orders}</h3>
              <p>This Week</p>
            </Card>
            <Card className="stat-card">
              <h3>{stats.month_orders}</h3>
              <p>This Month</p>
            </Card>
            <Card className="stat-card">
              <h3>{formatCurrency(stats.month_revenue, 'HUF')}</h3>
              <p>Monthly Revenue</p>
            </Card>
            <Card className="stat-card">
              <h3>{stats.pending_orders}</h3>
              <p>Pending Orders</p>
            </Card>
            <Card className="stat-card">
              <h3>{stats.upcoming_bookings}</h3>
              <p>Upcoming Bookings</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="filters-card">
          <div className="filters-row">
            <div className="filter-item">
              <label htmlFor="status-filter">Status</label>
              <Dropdown
                id="status-filter"
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.value);
                  setFirst(0);
                }}
                placeholder="Filter by status"
              />
            </div>
            <div className="filter-item">
              <label htmlFor="date-from">Date From</label>
              <Calendar
                id="date-from"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.value as Date);
                  setFirst(0);
                }}
                dateFormat="yy-mm-dd"
                placeholder="From date"
                showIcon
              />
            </div>
            <div className="filter-item">
              <label htmlFor="date-to">Date To</label>
              <Calendar
                id="date-to"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.value as Date);
                  setFirst(0);
                }}
                dateFormat="yy-mm-dd"
                placeholder="To date"
                showIcon
              />
            </div>
            <div className="filter-item filter-button">
              <Button
                label="Clear Filters"
                icon="pi pi-filter-slash"
                onClick={() => {
                  setStatusFilter('');
                  setDateFrom(null);
                  setDateTo(null);
                  setFirst(0);
                }}
                outlined
              />
            </div>
          </div>
        </Card>

        {/* Bookings Table */}
        <Card className="mt-4">
          <DataTable
            value={bookings}
            loading={loading}
            paginator
            rows={rows}
            first={first}
            totalRecords={totalRecords}
            onPage={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            lazy
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"
            emptyMessage="No bookings found"
          >
            <Column expander style={{ width: '3rem' }} />
            <Column field="customer_name" header="Customer" sortable />
            <Column field="email" header="Email" />
            <Column 
              field="status" 
              header="Status" 
              body={statusBodyTemplate}
              sortable
            />
            <Column 
              field="total_amount" 
              header="Amount" 
              body={amountBodyTemplate}
              sortable
            />
            <Column 
              field="created_at" 
              header="Created At" 
              body={dateBodyTemplate}
              sortable
            />
            <Column 
              header="Items" 
              body={(rowData: Booking) => rowData.items?.length || 0}
            />
          </DataTable>
        </Card>

        {/* Modify Dialog */}
        <Dialog
          header="Modify Booking"
          visible={modifyDialogVisible}
          style={{ width: '500px' }}
          onHide={() => setModifyDialogVisible(false)}
          footer={
            <div>
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => setModifyDialogVisible(false)}
                className="p-button-text"
              />
              <Button
                label="Save"
                icon="pi pi-check"
                onClick={handleSaveModifiedBooking}
                autoFocus
              />
            </div>
          }
        >
          {selectedBookingItem && (
            <div className="p-fluid">
              <div className="field mb-3">
                <label className="font-semibold">Current Booking</label>
                <p>{selectedBookingItem.room_name} - {selectedBookingItem.booking_date} {selectedBookingItem.start_time}-{selectedBookingItem.end_time}</p>
              </div>

              <div className="field mb-3">
                <label htmlFor="room">Room</label>
                <Dropdown
                  id="room"
                  value={modifyData.room_id}
                  options={[
                    { label: 'Atelier', value: 'studio-a' },
                    { label: 'Frigyes', value: 'studio-b' },
                    { label: 'Karinthy', value: 'studio-c' },
                  ]}
                  onChange={(e) => setModifyData({ ...modifyData, room_id: e.value })}
                  placeholder="Select a room"
                />
              </div>

              <div className="field mb-3">
                <label htmlFor="date">Date</label>
                <Calendar
                  id="date"
                  value={modifyData.booking_date}
                  onChange={(e) => setModifyData({ ...modifyData, booking_date: e.value as Date })}
                  dateFormat="yy-mm-dd"
                  showIcon
                />
              </div>

              <div className="field mb-3">
                <label htmlFor="start-time">Start Time</label>
                <Dropdown
                  id="start-time"
                  value={modifyData.start_time}
                  options={Array.from({ length: 11 }, (_, i) => {
                    const hour = 9 + i;
                    return { label: `${hour.toString().padStart(2, '0')}:00`, value: `${hour.toString().padStart(2, '0')}:00` };
                  })}
                  onChange={(e) => setModifyData({ ...modifyData, start_time: e.value })}
                  placeholder="Select start time"
                />
              </div>

              <div className="field mb-3">
                <label htmlFor="end-time">End Time</label>
                <Dropdown
                  id="end-time"
                  value={modifyData.end_time}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const hour = 9 + i;
                    return { label: `${hour.toString().padStart(2, '0')}:00`, value: `${hour.toString().padStart(2, '0')}:00` };
                  })}
                  onChange={(e) => setModifyData({ ...modifyData, end_time: e.value })}
                  placeholder="Select end time"
                />
              </div>
            </div>
          )}
        </Dialog>

        <Toast ref={toast} />
        <ConfirmDialog />
      </div>
    </div>
  );
};

