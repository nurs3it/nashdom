import { apiClient } from '@/shared/lib/api-client';
import { API_CONFIG } from '@/shared/config/api';
import type {
  Property,
  PropertyListItem,
  PropertyType,
  ServiceType,
  PropertyFilters,
  PaginatedResponse,
  Favorite,
  PropertyStats,
} from '@/shared/types/api';

export const propertiesApi = {
  // Получение списка объектов с фильтрацией
  getProperties: async (filters?: PropertyFilters): Promise<PaginatedResponse<PropertyListItem>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.ENDPOINTS.PROPERTIES.LIST}?${query}` : API_CONFIG.ENDPOINTS.PROPERTIES.LIST;
    
    return apiClient.get<PaginatedResponse<PropertyListItem>>(endpoint);
  },

  // Получение детальной информации об объекте
  getProperty: async (id: string | number): Promise<Property> => {
    return apiClient.get<Property>(API_CONFIG.ENDPOINTS.PROPERTIES.DETAIL(id));
  },

  // Создание объекта
  createProperty: async (propertyData: FormData): Promise<Property> => {
    return apiClient.uploadFile<Property>(API_CONFIG.ENDPOINTS.PROPERTIES.CREATE, propertyData);
  },

  // Обновление объекта (PATCH — частичное обновление; бэк отдаёт 405 на POST на /update/)
  updateProperty: async (id: number, propertyData: FormData): Promise<Property> => {
    return apiClient.uploadFile<Property>(
      API_CONFIG.ENDPOINTS.PROPERTIES.UPDATE(id),
      propertyData,
      'PATCH',
    );
  },

  // Удаление объекта
  deleteProperty: async (id: number): Promise<void> => {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.PROPERTIES.DELETE(id));
  },

  // Получение рекомендуемых объектов
  getFeaturedProperties: async (): Promise<PropertyListItem[]> => {
    return apiClient.get<PropertyListItem[]>(API_CONFIG.ENDPOINTS.PROPERTIES.FEATURED);
  },

  // Получение типов недвижимости
  getPropertyTypes: async (): Promise<PropertyType[]> => {
    return apiClient.get<PropertyType[]>(API_CONFIG.ENDPOINTS.PROPERTIES.TYPES);
  },

  // Получение видов услуг
  getServiceTypes: async (): Promise<ServiceType[]> => {
    return apiClient.get<ServiceType[]>(API_CONFIG.ENDPOINTS.PROPERTIES.SERVICES);
  },

  // Добавление/удаление из избранного
  toggleFavorite: async (id: string | number): Promise<{ message: string; is_favorited: boolean }> => {
    return apiClient.post<{ message: string; is_favorited: boolean }>(
      API_CONFIG.ENDPOINTS.PROPERTIES.FAVORITE_TOGGLE(id)
    );
  },

  // Получение избранных объектов
  getFavorites: async (): Promise<Favorite[]> => {
    return apiClient.get<Favorite[]>(API_CONFIG.ENDPOINTS.PROPERTIES.FAVORITES);
  },

  // Статистика объектов (только для админов)
  getPropertyStats: async (): Promise<PropertyStats> => {
    return apiClient.get<PropertyStats>(API_CONFIG.ENDPOINTS.PROPERTIES.STATS);
  },

  // Получение объектов текущего пользователя
  getUserProperties: async (filters?: PropertyFilters): Promise<PaginatedResponse<PropertyListItem>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.ENDPOINTS.PROPERTIES.MY_PROPERTIES}?${query}` : API_CONFIG.ENDPOINTS.PROPERTIES.MY_PROPERTIES;
    
    return apiClient.get<PaginatedResponse<PropertyListItem>>(endpoint);
  },

  // Статистика объектов пользователя
  getUserPropertyStats: async (): Promise<PropertyStats> => {
    return apiClient.get<PropertyStats>(API_CONFIG.ENDPOINTS.PROPERTIES.MY_STATS);
  },
};
