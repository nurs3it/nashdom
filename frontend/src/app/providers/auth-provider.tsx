'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api';
import { apiClient } from '@/shared/lib/api-client';
import type { User } from '@/shared/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Получение данных пользователя
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    enabled: isInitialized && !!apiClient.getToken(),
    retry: false,
  });

  // Инициализация токена из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient.setToken(token);
      }
      setIsInitialized(true);
    }
  }, []);

  // Очистка токенов при ошибке авторизации
  useEffect(() => {
    if (error && 'status' in error && (error as { status: number }).status === 401) {
      // Если не удалось получить профиль даже после попытки обновления токена
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      apiClient.setToken(null);
    }
  }, [error]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Сохраняем refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      // Перезагружаем данные пользователя
      refetchUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
    // Перезагружаем страницу для очистки состояния
    window.location.href = '/';
  };

  // Пользователь аутентифицирован, если есть токен и либо данные пользователя загружены успешно, 
  // либо они еще загружаются
  const hasToken = !!apiClient.getToken();
  const isAuthenticated = hasToken && (!!user || (isLoading && !error));

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized || (hasToken && isLoading),
    isAuthenticated,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
