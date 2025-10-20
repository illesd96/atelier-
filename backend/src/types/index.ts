export interface Room {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  email_verified: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
  active: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface UserAddress {
  id: string;
  user_id: string;
  company?: string;
  tax_number?: string;
  address: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  language: 'hu' | 'en';
  customer_name: string;
  email: string;
  phone?: string;
  total_amount: number;
  currency: string;
  invoice_required: boolean;
  invoice_company?: string;
  invoice_tax_number?: string;
  invoice_address?: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  room_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  booking_id?: string;
  status: 'pending' | 'booked' | 'cancelled' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_ref?: string;
  status: string;
  payload_json?: any;
  created_at: Date;
  updated_at: Date;
}

export interface TimeSlot {
  time: string; // HH:MM format
  status: 'available' | 'booked' | 'unavailable';
}

export interface RoomAvailability {
  id: string;
  name: string;
  slots: TimeSlot[];
}

export interface AvailabilityResponse {
  date: string;
  rooms: RoomAvailability[];
}

export interface CartItem {
  room_id: string;
  room_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  price: number;
}

export interface CheckoutRequest {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  invoice?: {
    required: boolean;
    company?: string;
    tax_number?: string;
    address?: string;
  };
  language: 'hu' | 'en';
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    email_verified: boolean;
    is_admin: boolean;
  };
  message?: string;
  requiresVerification?: boolean;
  emailVerified?: boolean;
  warning?: string;
}

// Cal.com types removed - using internal booking system

export interface BarionPaymentRequest {
  POSKey: string;
  PaymentType: 'Immediate';
  GuestCheckOut: boolean;
  FundingSources: string[];
  PaymentRequestId: string;
  PayerHint?: string; // Customer's email address for payment notifications
  Locale: 'hu-HU' | 'en-US';
  Currency: 'HUF' | 'EUR';
  Transactions: Array<{
    POSTransactionId: string;
    Payee: string;
    Total: number;
    Items: Array<{
      Name: string;
      Description: string;
      Quantity: number;
      Unit: string;
      UnitPrice: number;
      ItemTotal: number;
      SKU: string;
    }>;
  }>;
  RedirectUrl: string;
  CallbackUrl: string;
}


