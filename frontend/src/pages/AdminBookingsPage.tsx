import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
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
          <Button
            label="Schedule View"
            icon="pi pi-calendar"
            onClick={() => navigate('/admin/schedule')}
            outlined
          />
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
      </div>
    </div>
  );
};

