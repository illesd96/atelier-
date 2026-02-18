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
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './CouponsPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_order_amount: number | null;
  max_total_uses: number | null;
  max_uses_per_user: number;
  current_uses: number;
  requires_login: boolean;
  first_order_only: boolean;
  generated_for_user_id: string | null;
  generated_for_user_name: string | null;
  generated_for_user_email: string | null;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  usage_count: string;
  created_at: string;
}

interface FormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | null;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_order_amount: number | null;
  max_total_uses: number | null;
  max_uses_per_user: number;
  requires_login: boolean;
  first_order_only: boolean;
  valid_from: Date | null;
  valid_until: Date | null;
  active: boolean;
}

const defaultFormData: FormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: null,
  max_discount_amount: null,
  min_order_amount: null,
  max_order_amount: null,
  max_total_uses: null,
  max_uses_per_user: 1,
  requires_login: false,
  first_order_only: false,
  valid_from: new Date(),
  valid_until: null,
  active: true,
};

export const CouponsPage: React.FC = () => {
  const { token, isLoading: authLoading } = useAuth();
  const toast = React.useRef<Toast>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const getHeaders = () => ({ Authorization: `Bearer ${token}` });

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/coupons`, { headers: getHeaders() });
      setCoupons(response.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni a kuponokat' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) {
      fetchCoupons();
    }
  }, [authLoading, token]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogVisible(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount_amount: coupon.max_discount_amount,
      min_order_amount: coupon.min_order_amount,
      max_order_amount: coupon.max_order_amount,
      max_total_uses: coupon.max_total_uses,
      max_uses_per_user: coupon.max_uses_per_user,
      requires_login: coupon.requires_login,
      first_order_only: coupon.first_order_only,
      valid_from: coupon.valid_from ? new Date(coupon.valid_from) : new Date(),
      valid_until: coupon.valid_until ? new Date(coupon.valid_until) : null,
      active: coupon.active,
    });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!formData.discount_value || formData.discount_value <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Figyelmeztetés', detail: 'Kedvezmény értéke kötelező' });
      return;
    }

    try {
      const payload = {
        code: formData.code || undefined,
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        max_discount_amount: formData.max_discount_amount,
        min_order_amount: formData.min_order_amount,
        max_order_amount: formData.max_order_amount,
        max_total_uses: formData.max_total_uses,
        max_uses_per_user: formData.max_uses_per_user,
        requires_login: formData.requires_login,
        first_order_only: formData.first_order_only,
        valid_from: formData.valid_from?.toISOString(),
        valid_until: formData.valid_until?.toISOString() || null,
        active: formData.active,
      };

      if (editingId) {
        await axios.put(`${API_URL}/admin/coupons/${editingId}`, payload, { headers: getHeaders() });
        toast.current?.show({ severity: 'success', summary: 'Siker', detail: 'Kupon frissítve' });
      } else {
        await axios.post(`${API_URL}/admin/coupons`, payload, { headers: getHeaders() });
        toast.current?.show({ severity: 'success', summary: 'Siker', detail: 'Kupon létrehozva' });
      }

      setDialogVisible(false);
      fetchCoupons();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Nem sikerült menteni';
      toast.current?.show({ severity: 'error', summary: 'Hiba', detail: msg });
    }
  };

  const handleDelete = (coupon: Coupon) => {
    confirmDialog({
      message: `Biztosan törli a "${coupon.code}" kupont?`,
      header: 'Törlés megerősítése',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Igen',
      rejectLabel: 'Nem',
      accept: async () => {
        try {
          const response = await axios.delete(`${API_URL}/admin/coupons/${coupon.id}`, { headers: getHeaders() });
          const detail = response.data.deactivated ? 'Kupon deaktiválva (már használták)' : 'Kupon törölve';
          toast.current?.show({ severity: 'success', summary: 'Siker', detail });
          fetchCoupons();
        } catch (error) {
          toast.current?.show({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni' });
        }
      },
    });
  };

  const discountTypeOptions = [
    { label: 'Százalékos (%)', value: 'percentage' },
    { label: 'Fix összeg (Ft)', value: 'fixed' },
  ];

  const statusTemplate = (coupon: Coupon) => {
    const now = new Date();
    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < now;
    const isMaxedOut = coupon.max_total_uses !== null && coupon.current_uses >= coupon.max_total_uses;

    if (!coupon.active) return <Tag value="Inaktív" severity="danger" />;
    if (isExpired) return <Tag value="Lejárt" severity="warning" />;
    if (isMaxedOut) return <Tag value="Elfogyott" severity="warning" />;
    return <Tag value="Aktív" severity="success" />;
  };

  const discountTemplate = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      const cap = coupon.max_discount_amount ? ` (max ${Number(coupon.max_discount_amount).toLocaleString()} Ft)` : '';
      return `${coupon.discount_value}%${cap}`;
    }
    return `${Number(coupon.discount_value).toLocaleString()} Ft`;
  };

  const usageTemplate = (coupon: Coupon) => {
    const max = coupon.max_total_uses !== null ? `/ ${coupon.max_total_uses}` : '/ ∞';
    return `${coupon.current_uses} ${max}`;
  };

  const validityTemplate = (coupon: Coupon) => {
    const from = format(new Date(coupon.valid_from), 'yyyy.MM.dd');
    const until = coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy.MM.dd') : 'Nincs lejárat';
    return `${from} - ${until}`;
  };

  const restrictionsTemplate = (coupon: Coupon) => {
    const tags: string[] = [];
    if (coupon.requires_login) tags.push('Bejelentkezés');
    if (coupon.first_order_only) tags.push('Első rendelés');
    if (coupon.min_order_amount) tags.push(`Min: ${Number(coupon.min_order_amount).toLocaleString()} Ft`);
    if (coupon.max_order_amount) tags.push(`Max: ${Number(coupon.max_order_amount).toLocaleString()} Ft`);
    if (coupon.generated_for_user_email) tags.push(`Személyes: ${coupon.generated_for_user_email}`);
    return tags.length > 0 ? tags.join(' | ') : '-';
  };

  const actionsTemplate = (coupon: Coupon) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => openEditDialog(coupon)} tooltip="Szerkesztés" />
      <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" onClick={() => handleDelete(coupon)} tooltip="Törlés" />
    </div>
  );

  return (
    <div className="coupons-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="page-header">
        <h1>Kuponok kezelése</h1>
        <Button label="Új kupon" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <DataTable
        value={coupons}
        loading={loading}
        paginator
        rows={20}
        emptyMessage="Nincsenek kuponok"
        sortField="created_at"
        sortOrder={-1}
        stripedRows
        size="small"
      >
        <Column field="code" header="Kód" sortable style={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
        <Column header="Státusz" body={statusTemplate} style={{ width: '100px' }} />
        <Column header="Kedvezmény" body={discountTemplate} />
        <Column header="Használat" body={usageTemplate} style={{ width: '120px' }} />
        <Column header="Érvényesség" body={validityTemplate} />
        <Column header="Feltételek" body={restrictionsTemplate} />
        <Column header="" body={actionsTemplate} style={{ width: '100px' }} />
      </DataTable>

      {/* Create / Edit Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingId ? 'Kupon szerkesztése' : 'Új kupon létrehozása'}
        style={{ width: '640px' }}
        modal
      >
        <div className="coupon-form">
          <div className="form-field">
            <label>
              Kuponkód {!editingId && <small>(üresen hagyva automatikus)</small>}
            </label>
            <InputText
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="pl. SUMMER20"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
            />
          </div>

          <div className="form-field">
            <label>Leírás</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="pl. Nyári akció - 20% kedvezmény"
            />
          </div>

          <div className="form-section">
            <span className="form-section-title">Kedvezmény</span>
            <div className="form-row">
              <div className="form-field">
                <label>Típus *</label>
                <Dropdown
                  value={formData.discount_type}
                  options={discountTypeOptions}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.value })}
                />
              </div>
              <div className="form-field">
                <label>
                  Érték * {formData.discount_type === 'percentage' ? '(%)' : '(Ft)'}
                </label>
                <InputNumber
                  value={formData.discount_value}
                  onValueChange={(e) => setFormData({ ...formData, discount_value: e.value ?? null })}
                  min={1}
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  suffix={formData.discount_type === 'percentage' ? ' %' : ' Ft'}
                />
              </div>
            </div>

            {formData.discount_type === 'percentage' && (
              <div className="form-field">
                <label>
                  Maximum kedvezmény összeg (Ft) <small>opcionális</small>
                </label>
                <InputNumber
                  value={formData.max_discount_amount}
                  onValueChange={(e) => setFormData({ ...formData, max_discount_amount: e.value ?? null })}
                  suffix=" Ft"
                  placeholder="pl. 10000"
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <span className="form-section-title">Rendelési korlátok</span>
            <div className="form-row">
              <div className="form-field">
                <label>Minimum rendelés (Ft) <small>opcionális</small></label>
                <InputNumber
                  value={formData.min_order_amount}
                  onValueChange={(e) => setFormData({ ...formData, min_order_amount: e.value ?? null })}
                  suffix=" Ft"
                />
              </div>
              <div className="form-field">
                <label>Maximum rendelés (Ft) <small>opcionális</small></label>
                <InputNumber
                  value={formData.max_order_amount}
                  onValueChange={(e) => setFormData({ ...formData, max_order_amount: e.value ?? null })}
                  suffix=" Ft"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <span className="form-section-title">Felhasználási korlátok</span>
            <div className="form-row">
              <div className="form-field">
                <label>Max. összes felhasználás <small>üres = korlátlan</small></label>
                <InputNumber
                  value={formData.max_total_uses}
                  onValueChange={(e) => setFormData({ ...formData, max_total_uses: e.value ?? null })}
                  min={1}
                />
              </div>
              <div className="form-field">
                <label>Max. felhasználás / felhasználó</label>
                <InputNumber
                  value={formData.max_uses_per_user}
                  onValueChange={(e) => setFormData({ ...formData, max_uses_per_user: e.value ?? 1 })}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <span className="form-section-title">Érvényesség</span>
            <div className="form-row">
              <div className="form-field">
                <label>Érvényes ettől</label>
                <Calendar
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.value as Date })}
                  dateFormat="yy.mm.dd"
                  showTime
                  hourFormat="24"
                />
              </div>
              <div className="form-field">
                <label>Lejárat <small>üres = nincs lejárat</small></label>
                <Calendar
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.value as Date })}
                  dateFormat="yy.mm.dd"
                  showTime
                  hourFormat="24"
                  showButtonBar
                />
              </div>
            </div>
          </div>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <Checkbox
                inputId="requires_login"
                checked={formData.requires_login}
                onChange={(e) => setFormData({ ...formData, requires_login: e.checked ?? false })}
              />
              <label htmlFor="requires_login">Bejelentkezés szükséges</label>
            </div>
            <div className="checkbox-item">
              <Checkbox
                inputId="first_order_only"
                checked={formData.first_order_only}
                onChange={(e) => setFormData({ ...formData, first_order_only: e.checked ?? false })}
              />
              <label htmlFor="first_order_only">Csak első rendeléshez</label>
            </div>
            <div className="checkbox-item">
              <Checkbox
                inputId="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.checked ?? true })}
              />
              <label htmlFor="active">Aktív</label>
            </div>
          </div>

          <div className="form-actions">
            <Button label="Mégse" className="p-button-text" onClick={() => setDialogVisible(false)} />
            <Button label={editingId ? 'Mentés' : 'Létrehozás'} icon="pi pi-check" onClick={handleSave} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
