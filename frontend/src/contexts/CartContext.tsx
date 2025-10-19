import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';

const CART_STORAGE_KEY = 'photo-studio-cart';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (room_id: string, date: string, start_time: string) => void;
  clearCart: () => void;
  removePastAppointments: () => number;
  isInCart: (room_id: string, date: string, start_time: string) => boolean;
  getTotal: () => number;
  getItemCount: () => number;
  getItemsByDate: () => Record<string, CartItem[]>;
  getItemsByRoom: () => Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const cartItems = Array.isArray(parsedCart) ? parsedCart : [];
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setItems([]);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(currentItems => {
      // Check if item already exists
      const existingIndex = currentItems.findIndex(
        existing => 
          existing.room_id === item.room_id &&
          existing.date === item.date &&
          existing.start_time === item.start_time
      );

      if (existingIndex >= 0) {
        // Item already exists, don't add duplicate
        return currentItems;
      }

      return [...currentItems, item];
    });
  }, []);

  const removeItem = useCallback((room_id: string, date: string, start_time: string) => {
    setItems(currentItems => 
      currentItems.filter(item => 
        !(item.room_id === room_id && item.date === date && item.start_time === start_time)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const removePastAppointments = useCallback(() => {
    const now = new Date();
    let removedCount = 0;
    
    setItems(currentItems => {
      const validItems = currentItems.filter(item => {
        // Parse the appointment date and time
        const [year, month, day] = item.date.split('-').map(Number);
        const [hours, minutes] = item.start_time.split(':').map(Number);
        const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
        
        // Check if appointment is in the future
        const isFuture = appointmentDateTime > now;
        if (!isFuture) {
          removedCount++;
        }
        return isFuture;
      });
      
      return validItems;
    });
    
    return removedCount;
  }, []);

  const isInCart = useCallback((room_id: string, date: string, start_time: string) => {
    return items.some(item => 
      item.room_id === room_id && 
      item.date === date && 
      item.start_time === start_time
    );
  }, [items]);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.length;
  }, [items]);

  const getItemsByDate = useCallback(() => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    // Sort items within each date by start_time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  }, [items]);

  const getItemsByRoom = useCallback(() => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.room_id]) {
        acc[item.room_id] = [];
      }
      acc[item.room_id].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    return grouped;
  }, [items]);

  const value: CartContextType = {
    items,
    isLoading,
    setIsLoading,
    addItem,
    removeItem,
    clearCart,
    removePastAppointments,
    isInCart,
    getTotal,
    getItemCount,
    getItemsByDate,
    getItemsByRoom,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
