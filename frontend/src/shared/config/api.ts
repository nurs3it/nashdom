export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/login/',
      REGISTER: '/api/auth/register/',
      REFRESH: '/api/auth/token/refresh/',
      PROFILE: '/api/auth/profile/',
      CHANGE_PASSWORD: '/api/auth/change-password/',
      STATS: '/api/auth/stats/',
    },
    
    // Properties
    PROPERTIES: {
      LIST: '/api/properties/',
      DETAIL: (id: string | number) => `/api/properties/${id}/`,
      CREATE: '/api/properties/create/',
      UPDATE: (id: string | number) => `/api/properties/${id}/update/`,
      DELETE: (id: string | number) => `/api/properties/${id}/delete/`,
      FEATURED: '/api/properties/featured/',
      TYPES: '/api/properties/types/',
      SERVICES: '/api/properties/services/',
      FAVORITES: '/api/properties/favorites/',
      FAVORITE_TOGGLE: (id: string | number) => `/api/properties/${id}/favorite/`,
      STATS: '/api/properties/stats/',
      MY_PROPERTIES: '/api/properties/my/',
      MY_STATS: '/api/properties/my/stats/',
    },
    
    // Contacts
    CONTACTS: {
      REQUESTS: '/api/contacts/requests/',
      REQUEST_LIST: '/api/contacts/requests/list/',
      REQUEST_UPDATE: (id: number) => `/api/contacts/requests/${id}/update/`,
      USER_REQUESTS: '/api/contacts/requests/my/',
      NEWSLETTER_SUBSCRIBE: '/api/contacts/newsletter/subscribe/',
      NEWSLETTER_UNSUBSCRIBE: (email: string) => `/api/contacts/newsletter/unsubscribe/${email}/`,
      STATS: '/api/contacts/stats/',
    },
  },
} as const;

export const MEDIA_URL = `${API_CONFIG.BASE_URL}/media/`;
