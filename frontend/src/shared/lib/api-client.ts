import { API_CONFIG } from '@/shared/config/api';
import { ApiError } from './error-handler';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Загружаем токен из localStorage при инициализации
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Если токен истек, пытаемся его обновить
        if (response.status === 401 && this.token && !endpoint.includes('/auth/refresh/')) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // Повторяем запрос с новым токеном
            const newHeaders: Record<string, string> = { ...headers };
            if (this.token) {
              newHeaders.Authorization = `Bearer ${this.token}`;
            }
            const newConfig = { ...config, headers: newHeaders };
            const retryResponse = await fetch(url, newConfig);
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw this.createApiError(errorData, retryResponse.status);
            }
            
            const contentType = retryResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await retryResponse.json();
            }
            
            return retryResponse as unknown as T;
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw this.createApiError(errorData, response.status);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response as unknown as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private createApiError(errorData: any, status: number): ApiError {
    // Если бэкенд вернул стандартизированную ошибку
    if (errorData.success === false && errorData.error) {
      return errorData as ApiError;
    }

    // Создаем стандартизированную ошибку
    return {
      success: false,
      error: {
        code: this.getErrorCodeByStatus(status),
        message: errorData.message || this.getErrorMessageByStatus(status),
        details: errorData.detail || errorData.details,
        field_errors: errorData.field_errors || errorData.errors,
      }
    };
  }

  private getErrorCodeByStatus(status: number): string {
    switch (status) {
      case 400: return 'VALIDATION_ERROR';
      case 401: return 'AUTHENTICATION_ERROR';
      case 403: return 'PERMISSION_ERROR';
      case 404: return 'NOT_FOUND_ERROR';
      case 409: return 'INTEGRITY_ERROR';
      case 429: return 'THROTTLE_ERROR';
      default: return 'SERVER_ERROR';
    }
  }

  private getErrorMessageByStatus(status: number): string {
    switch (status) {
      case 400: return 'Проверьте правильность заполнения полей';
      case 401: return 'Необходимо войти в систему';
      case 403: return 'У вас нет прав для выполнения этого действия';
      case 404: return 'Запрашиваемый ресурс не найден';
      case 409: return 'Данные уже существуют';
      case 429: return 'Слишком много запросов';
      default: return 'Произошла ошибка сервера';
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token тоже истек, удаляем токены
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.token = null;
        return false;
      }

      const data = await response.json();
      this.setToken(data.access);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Удаляем токены при ошибке
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      this.token = null;
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // NB: НЕ выставляем Content-Type вручную — браузер сам добавит
    // multipart/form-data с правильным boundary.
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw this.createApiError(errorData, response.status);
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
