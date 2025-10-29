import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../services/api';
import './ProfilePage.css';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  invoice_id?: string;
  invoice_number?: string;
  invoice_status?: string;
  invoice_created_at?: string;
  items: Array<{
    room_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;
}

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, refreshProfile } = useAuth();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!token) return;
    
    setOrderLoading(true);
    try {
      const response = await userAPI.getOrderHistory(token);
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      await authAPI.updateProfile(token, {
        name: formData.name,
        phone: formData.phone,
      });
      
      await refreshProfile();
      setMessage({ type: 'success', text: t('profile.profileUpdated') });
      setEditMode(false);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('common.error') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('register.passwordMismatch') });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: t('register.passwordTooShort') });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await authAPI.changePassword(
        token,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.success) {
        setMessage({ type: 'success', text: t('profile.passwordChanged') });
        setShowPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.message || t('common.error') });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('common.error') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'paid':
      case 'booked':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/download`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
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
      setMessage({ type: 'error', text: t('profile.invoiceDownloadFailed') });
    }
  };

  const expandedRowTemplate = (order: Order) => {
    return (
      <div className="order-items-detail">
        <h4>{t('profile.orderItems')}</h4>
        {order.items.map((item, index) => (
          <div key={index} className="order-item-card">
            <div className="order-item-info">
              <strong>{item.room_name}</strong>
              <span>{formatDate(item.booking_date)}</span>
              <span>{item.start_time} - {item.end_time}</span>
              <Tag 
                value={item.status} 
                severity={getStatusSeverity(item.status)}
              />
            </div>
          </div>
        ))}
        
        {order.invoice_id && (
          <div className="order-invoice-section">
            <Divider />
            <div className="invoice-info">
              <div>
                <h4>{t('profile.invoice')}</h4>
                <p><strong>{t('profile.invoiceNumber')}:</strong> {order.invoice_number}</p>
                <p><strong>{t('profile.invoiceStatus')}:</strong>{' '}
                  <Tag 
                    value={order.invoice_status} 
                    severity={order.invoice_status === 'sent' ? 'success' : 'info'}
                  />
                </p>
              </div>
              <Button
                label={t('profile.downloadInvoice')}
                icon="pi pi-download"
                onClick={() => handleDownloadInvoice(order.invoice_id!, order.invoice_number!)}
                outlined
                size="small"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>{t('profile.title')}</h1>

        {message && (
          <Message 
            severity={message.type === 'error' ? 'error' : 'success'} 
            text={message.text} 
            className="w-full mb-4" 
          />
        )}

        {/* Personal Information */}
        <Card title={t('profile.personalInfo')} className="mb-4">
          <div className="profile-info">
            <div className="info-row">
              <label>{t('profile.name')}</label>
              {editMode ? (
                <InputText
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                />
              ) : (
                <span>{user.name}</span>
              )}
            </div>

            <div className="info-row">
              <label>{t('profile.email')}</label>
              <span>{user.email}</span>
            </div>

            <div className="info-row">
              <label>{t('profile.phone')}</label>
              {editMode ? (
                <InputText
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full"
                  placeholder={t('register.optional')}
                />
              ) : (
                <span>{user.phone || '-'}</span>
              )}
            </div>
          </div>

          <Divider />

          <div className="profile-actions">
            {editMode ? (
              <>
                <Button
                  label={loading ? t('profile.saving') : t('profile.updateProfile')}
                  onClick={handleUpdateProfile}
                  loading={loading}
                  icon="pi pi-check"
                />
                <Button
                  label={t('profile.cancel')}
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                    });
                    setMessage(null);
                  }}
                  severity="secondary"
                  outlined
                />
              </>
            ) : (
              <>
                <Button
                  label={t('profile.editProfile')}
                  onClick={() => setEditMode(true)}
                  icon="pi pi-pencil"
                  outlined
                />
                <Button
                  label={t('profile.changePassword')}
                  onClick={() => setShowPasswordDialog(true)}
                  icon="pi pi-key"
                  outlined
                />
                <Button
                  label={t('profile.logout')}
                  onClick={() => setShowLogoutDialog(true)}
                  icon="pi pi-sign-out"
                  severity="danger"
                  outlined
                />
              </>
            )}
          </div>
        </Card>

        {/* Order History */}
        <Card title={t('profile.orderHistory')}>
          {orderLoading ? (
            <div className="flex justify-content-center p-4">
              <ProgressSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <i className="pi pi-inbox"></i>
              <p>{t('profile.noOrders')}</p>
              <Button
                label={t('profile.viewBookings')}
                onClick={() => navigate('/booking')}
                icon="pi pi-calendar"
              />
            </div>
          ) : (
            <DataTable 
              value={orders} 
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={expandedRowTemplate}
              dataKey="id"
              responsiveLayout="scroll"
              className="orders-table"
            >
              <Column expander style={{ width: '3rem' }} />
              <Column 
                field="created_at" 
                header={t('profile.orderDate')}
                body={(order) => formatDateTime(order.created_at)}
              />
              <Column 
                field="status" 
                header={t('profile.orderStatus')}
                body={(order) => (
                  <Tag 
                    value={order.status} 
                    severity={getStatusSeverity(order.status)}
                  />
                )}
              />
              <Column 
                field="total_amount" 
                header={t('profile.orderTotal')}
                body={(order) => `${order.total_amount.toLocaleString()} ${order.currency}`}
              />
              <Column 
                header={t('profile.invoice')}
                body={(order) => order.invoice_number ? (
                  <div className="flex align-items-center gap-2">
                    <span className="text-sm">{order.invoice_number}</span>
                    <Button
                      icon="pi pi-download"
                      rounded
                      text
                      size="small"
                      onClick={() => handleDownloadInvoice(order.invoice_id!, order.invoice_number!)}
                      tooltip={t('profile.downloadInvoice')}
                    />
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              />
            </DataTable>
          )}
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        header={t('profile.changePassword')}
        visible={showPasswordDialog}
        onHide={() => {
          setShowPasswordDialog(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setMessage(null);
        }}
        style={{ width: '450px' }}
      >
        <div className="password-dialog">
          <div className="field-group">
            <label>{t('profile.currentPassword')}</label>
            <Password
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              feedback={false}
              toggleMask
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <div className="field-group">
            <label>{t('profile.newPassword')}</label>
            <Password
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              toggleMask
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <div className="field-group">
            <label>{t('profile.confirmNewPassword')}</label>
            <Password
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              feedback={false}
              toggleMask
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <Button
            label={loading ? t('profile.saving') : t('profile.updatePassword')}
            onClick={handleChangePassword}
            loading={loading}
            className="w-full"
          />
        </div>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        header={t('profile.logout')}
        visible={showLogoutDialog}
        onHide={() => setShowLogoutDialog(false)}
        style={{ width: '400px' }}
      >
        <p>{t('profile.logoutConfirm')}</p>
        <div className="dialog-actions">
          <Button
            label={t('common.cancel')}
            onClick={() => setShowLogoutDialog(false)}
            severity="secondary"
            outlined
          />
          <Button
            label={t('profile.logout')}
            onClick={handleLogout}
            severity="danger"
            icon="pi pi-sign-out"
          />
        </div>
      </Dialog>
    </div>
  );
};

