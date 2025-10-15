import axios from 'axios';
import { 
  AvailabilityResponse, 
  CartItem, 
  CheckoutRequest, 
  CheckoutResponse,
  Order,
  OrderItem 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get auth header
const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
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

  // Create checkout session (with optional auth)
  async createCheckout(checkoutData: CheckoutRequest, token?: string): Promise<CheckoutResponse> {
    const headers = token ? getAuthHeader(token) : {};
    const response = await apiClient.post('/checkout', checkoutData, { headers });
    return response.data;
  },

  // Get order status
  async getOrderStatus(orderId: string): Promise<{
    success: boolean;
    order: Order;
    items: OrderItem[];
    payment_id?: string;
  }> {
    const response = await apiClient.get(`/orders/${orderId}/status`);
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

// Authentication API
export const authAPI = {
  // Register new user
  async register(email: string, password: string, name: string, phone?: string) {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      name,
      phone,
    });
    return response.data;
  },

  // Login user
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get user profile
  async getProfile(token: string) {
    const response = await apiClient.get('/auth/profile', {
      headers: getAuthHeader(token),
    });
    return response.data;
  },

  // Update user profile
  async updateProfile(token: string, data: { name?: string; phone?: string }) {
    const response = await apiClient.put('/auth/profile', data, {
      headers: getAuthHeader(token),
    });
    return response.data;
  },

  // Change password
  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const response = await apiClient.put('/auth/password', {
      currentPassword,
      newPassword,
    }, {
      headers: getAuthHeader(token),
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  // Get order history
  async getOrderHistory(token: string) {
    const response = await apiClient.get('/user/orders', {
      headers: getAuthHeader(token),
    });
    return response.data;
  },

  // Get saved addresses
  async getSavedAddresses(token: string) {
    const response = await apiClient.get('/user/addresses', {
      headers: getAuthHeader(token),
    });
    return response.data;
  },

  // Save new address
  async saveAddress(token: string, address: {
    company?: string;
    tax_number?: string;
    address: string;
    is_default?: boolean;
  }) {
    const response = await apiClient.post('/user/addresses', address, {
      headers: getAuthHeader(token),
    });
    return response.data;
  },

  // Delete address
  async deleteAddress(token: string, addressId: string) {
    const response = await apiClient.delete(`/user/addresses/${addressId}`, {
      headers: getAuthHeader(token),
    });
    return response.data;
  },
};

export default api;


