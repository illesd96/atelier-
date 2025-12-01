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
  special_event_id?: string;
  special_event_name?: string;
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export interface Invoice {
  required: boolean;
  company?: string;
  tax_number?: string;
  address?: string;
}

export interface CheckoutRequest {
  items: CartItem[];
  customer: Customer;
  invoice?: Invoice;
  language: 'hu' | 'en';
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  paymentId: string;
  redirectUrl: string;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  language: 'hu' | 'en';
  customer_name: string;
  email: string;
  phone?: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  room_id: string;
  room_name?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  booking_id?: string;
  checkin_code?: string;
  status: 'pending' | 'booked' | 'cancelled' | 'failed';
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}


