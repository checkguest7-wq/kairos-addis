import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword?: string
  ) => Promise<{ message: string; requireVerification?: boolean; email?: string }>;
  verifyEmail: (email: string, token: string) => Promise<{ message: string; user?: User }>;
  resendVerification: (email: string) => Promise<{ message: string; retryAfter?: number }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.me();
      setUser(res.user);
    } catch (err) {
      console.warn('[AUTH] Token validation failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    if (!res || !res.user) {
      throw new Error('Authentication failed.');
    }
    setUser(res.user);
    return res.user;
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword?: string
  ) => {
    const res = await api.register({ fullName, email, phone, password, confirmPassword });
    return {
      message: res.message,
      requireVerification: res.requireVerification ?? true,
      email: res.email || email,
    };
  };

  const verifyEmail = async (email: string, token: string) => {
    const res = await api.verifyEmail({ email, token });
    if (res.user) {
      setUser(res.user);
    }
    return {
      message: res.message,
      user: res.user,
    };
  };

  const resendVerification = async (email: string) => {
    const res = await api.resendVerification(email);
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
