import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

const AUTH_TOKEN_KEY = 'photo-studio-auth-token';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  email_verified: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and fetch user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (savedToken) {
          setToken(savedToken);
          // Fetch user profile
          const profile = await authAPI.getProfile(savedToken);
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Clear invalid token
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Login failed' 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  }, []);

  const register = useCallback(async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ) => {
    try {
      const response = await authAPI.register(email, password, name, phone);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Registration failed' 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during registration' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const profile = await authAPI.getProfile(token);
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

