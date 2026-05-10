import { apiClient } from '@/shared/lib/api-client';
import { API_CONFIG } from '@/shared/config/api';
import type {
  ContactRequest,
  ContactRequestCreate,
  Newsletter,
  ContactStats,
  PaginatedResponse,
} from '@/shared/types/api';

export const contactsApi = {
  // Создание заявки на связь
  createContactRequest: async (requestData: ContactRequestCreate): Promise<ContactRequest> => {
    return apiClient.post<ContactRequest>(API_CONFIG.ENDPOINTS.CONTACTS.REQUESTS, requestData);
  },

  // Получение списка заявок (только для админов)
  getContactRequests: async (): Promise<PaginatedResponse<ContactRequest>> => {
    return apiClient.get<PaginatedResponse<ContactRequest>>(API_CONFIG.ENDPOINTS.CONTACTS.REQUEST_LIST);
  },

  // Обновление заявки (только для админов)
  updateContactRequest: async (
    id: number, 
    updateData: { status?: string; assigned_to?: number; processed_at?: string }
  ): Promise<ContactRequest> => {
    return apiClient.patch<ContactRequest>(
      API_CONFIG.ENDPOINTS.CONTACTS.REQUEST_UPDATE(id), 
      updateData
    );
  },

  // Получение заявок текущего пользователя
  getUserContactRequests: async (): Promise<ContactRequest[]> => {
    return apiClient.get<ContactRequest[]>(API_CONFIG.ENDPOINTS.CONTACTS.USER_REQUESTS);
  },

  // Подписка на рассылку
  subscribeNewsletter: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.CONTACTS.NEWSLETTER_SUBSCRIBE,
      { email }
    );
  },

  // Отписка от рассылки
  unsubscribeNewsletter: async (email: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_CONFIG.ENDPOINTS.CONTACTS.NEWSLETTER_UNSUBSCRIBE(email),
      { is_active: false }
    );
  },

  // Статистика заявок (только для админов)
  getContactStats: async (): Promise<ContactStats> => {
    return apiClient.get<ContactStats>(API_CONFIG.ENDPOINTS.CONTACTS.STATS);
  },
};
