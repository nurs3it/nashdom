// Общие типы для API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Типы пользователя
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'realtor' | 'superadmin';
  is_verified: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'client' | 'realtor';
  // Дополнительные поля для риелторов
  company?: string;
  experience?: string;
  specialization?: string;
  description?: string;
  license_number?: string;
}

// Типы недвижимости
export interface PropertyType {
  id: number;
  name: string;
  slug: string;
}

export interface ServiceType {
  id: number;
  name: string;
  slug: string;
}

export interface PropertyImage {
  id: number;
  image: string;
  alt_text?: string;
  is_main: boolean;
  order: number;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  property_type: PropertyType;
  service_type: ServiceType;
  city: string;
  district?: string;
  address: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  area: number;
  rooms?: number;
  floor?: number;
  total_floors?: number;
  has_parking: boolean;
  has_balcony: boolean;
  has_elevator: boolean;
  status: 'active' | 'sold' | 'rented' | 'inactive';
  is_featured: boolean;
  owner: User;
  images: PropertyImage[];
  main_image?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  is_favorited: boolean;
}

export interface PropertyListItem {
  id: number;
  title: string;
  price: string;
  property_type: PropertyType;
  service_type: ServiceType;
  city: string;
  district?: string;
  area: number;
  rooms?: number;
  main_image?: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  is_favorited: boolean;
}

export interface PropertyFilters {
  property_type?: number;
  service_type?: number;
  city?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  has_parking?: boolean;
  has_balcony?: boolean;
  has_elevator?: boolean;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}

export interface Favorite {
  id: number;
  property: PropertyListItem;
  created_at: string;
}

// Типы контактов
export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  request_type: 'general' | 'property_inquiry' | 'viewing' | 'callback';
  subject: string;
  message: string;
  property?: number;
  property_details?: PropertyListItem;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ContactRequestCreate {
  name: string;
  email: string;
  phone: string;
  request_type: 'general' | 'property_inquiry' | 'viewing' | 'callback';
  subject: string;
  message: string;
  property?: number;
}

export interface Newsletter {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

// Статистика
export interface PropertyStats {
  total_properties: number;
  active_properties: number;
  sold_properties: number;
  rented_properties: number;
  properties_by_type: Record<string, number>;
  properties_by_service: Record<string, number>;
  avg_price: string;
  most_viewed: PropertyListItem[];
}

export interface ContactStats {
  total_requests: number;
  new_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  requests_by_type: Record<string, number>;
  recent_requests: ContactRequest[];
}

export interface UserStats {
  total_users: number;
  verified_users: number;
  clients: number;
  realtors: number;
  recent_users: User[];
}
