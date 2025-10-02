import axios from 'axios';
import { 
  AvailabilityResponse, 
  CartItem, 
  CheckoutRequest, 
  CheckoutResponse,
  Order,
  OrderItem 
} from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
);

export const api = {
  // Get availability for a specific date
  async getAvailability(date: string): Promise<AvailabilityResponse> {
    const response = await apiClient.get('/availability', {
      params: { date }
    });
    return response.data;
  },

  // Validate cart items
  async validateCart(items: CartItem[]): Promise<{
    valid: boolean;
    items: Array<{
      item: CartItem;
      valid: boolean;
      error?: string;
    }>;
    total: number;
    currency: string;
  }> {
    const response = await apiClient.post('/cart/validate', { items });
    return response.data;
  },

  // Create checkout session
  async createCheckout(checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post('/checkout', checkoutData);
    return response.data;
  },

  // Get order status
  async getOrderStatus(orderId: string): Promise<{
    order: Order;
    items: OrderItem[];
  }> {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel booking
  async cancelBooking(bookingCode: string, reason?: string): Promise<void> {
    await apiClient.post('/booking/cancel', {
      bookingCode,
      reason
    });
  },

  // Find booking by code
  async findBooking(bookingCode: string): Promise<{
    order: Order;
    items: OrderItem[];
  }> {
    const response = await apiClient.get(`/booking/${bookingCode}`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

export default api;


