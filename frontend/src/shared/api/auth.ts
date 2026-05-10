import { apiClient } from '@/shared/lib/api-client';
import { API_CONFIG } from '@/shared/config/api';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  UserStats 
} from '@/shared/types/api';

export const authApi = {
  // Вход
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Сохраняем токен
    apiClient.setToken(response.access);
    
    return response;
  },

  // Регистрация
  register: async (userData: RegisterRequest): Promise<User> => {
    return apiClient.post<User>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  },

  // Обновление токена
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    return apiClient.post<{ access: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh }
    );
  },

  // Получение профиля
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  },

  // Обновление профиля
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiClient.patch<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, userData);
  },

  // Смена пароля
  changePassword: async (passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      passwordData
    );
  },

  // Статистика пользователей (только для админов)
  getUserStats: async (): Promise<UserStats> => {
    return apiClient.get<UserStats>(API_CONFIG.ENDPOINTS.AUTH.STATS);
  },

  // Выход
  logout: () => {
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
  },
};
