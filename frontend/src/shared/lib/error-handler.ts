/**
 * Система обработки ошибок для фронтенда
 */

import { toast } from 'sonner';

// Типы ошибок от бэкенда
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field_errors?: Record<string, string>;
  };
}

// Коды ошибок
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  INTEGRITY_ERROR = 'INTEGRITY_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  THROTTLE_ERROR = 'THROTTLE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// Сообщения об ошибках по умолчанию
const DEFAULT_ERROR_MESSAGES = {
  [ErrorCodes.VALIDATION_ERROR]: 'Проверьте правильность заполнения полей',
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Ошибка авторизации',
  [ErrorCodes.PERMISSION_ERROR]: 'У вас нет прав для выполнения этого действия',
  [ErrorCodes.NOT_FOUND_ERROR]: 'Запрашиваемый ресурс не найден',
  [ErrorCodes.INTEGRITY_ERROR]: 'Данные уже существуют',
  [ErrorCodes.SERVER_ERROR]: 'Произошла ошибка сервера',
  [ErrorCodes.THROTTLE_ERROR]: 'Слишком много запросов',
  [ErrorCodes.NETWORK_ERROR]: 'Ошибка сети. Проверьте подключение к интернету',
};

/**
 * Проверяет, является ли ошибка API ошибкой
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as any).success === false &&
    'error' in error &&
    typeof (error as any).error === 'object'
  );
}

/**
 * Извлекает информацию об ошибке из различных источников
 */
export function extractErrorInfo(error: unknown): {
  code: string;
  message: string;
  details?: string;
  fieldErrors?: Record<string, string>;
} {
  // Если это стандартная API ошибка
  if (isApiError(error)) {
    return {
      code: error.error.code,
      message: error.error.message,
      details: error.error.details,
      fieldErrors: error.error.field_errors,
    };
  }

  // Если это ошибка fetch
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: DEFAULT_ERROR_MESSAGES[ErrorCodes.NETWORK_ERROR],
    };
  }

  // Если это обычная ошибка
  if (error instanceof Error) {
    return {
      code: ErrorCodes.SERVER_ERROR,
      message: error.message || DEFAULT_ERROR_MESSAGES[ErrorCodes.SERVER_ERROR],
    };
  }

  // Если это объект с message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      code: ErrorCodes.SERVER_ERROR,
      message: String((error as any).message),
    };
  }

  // По умолчанию
  return {
    code: ErrorCodes.SERVER_ERROR,
    message: DEFAULT_ERROR_MESSAGES[ErrorCodes.SERVER_ERROR],
  };
}

/**
 * Глобальный обработчик ошибок
 */
export class ErrorHandler {
  /**
   * Обрабатывает ошибку и показывает уведомление
   */
  static handle(error: unknown, options?: {
    showToast?: boolean;
    toastType?: 'error' | 'warning';
    customMessage?: string;
  }): {
    code: string;
    message: string;
    details?: string;
    fieldErrors?: Record<string, string>;
  } {
    const { showToast = true, toastType = 'error', customMessage } = options || {};
    
    const errorInfo = extractErrorInfo(error);
    
    // Показываем уведомление, если нужно
    if (showToast) {
      const message = customMessage || errorInfo.message;
      
      if (toastType === 'error') {
        toast.error(message);
      } else {
        toast.warning(message);
      }
    }

    // Логируем ошибку в консоль для разработки
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
      console.error('Error info:', errorInfo);
    }

    return errorInfo;
  }

  /**
   * Обрабатывает ошибки форм
   */
  static handleFormError(error: unknown): Record<string, string> {
    const errorInfo = extractErrorInfo(error);
    
    // Если есть ошибки полей, возвращаем их
    if (errorInfo.fieldErrors) {
      return errorInfo.fieldErrors;
    }

    // Если это ошибка валидации без конкретных полей
    if (errorInfo.code === ErrorCodes.VALIDATION_ERROR) {
      toast.error(errorInfo.message);
      return {};
    }

    // Для других ошибок показываем общее уведомление
    toast.error(errorInfo.message);
    return {};
  }

  /**
   * Обрабатывает ошибки авторизации
   */
  static handleAuthError(error: unknown): void {
    const errorInfo = extractErrorInfo(error);
    
    if (errorInfo.code === ErrorCodes.AUTHENTICATION_ERROR) {
      toast.error('Неверные данные для входа');
      return;
    }

    if (errorInfo.code === ErrorCodes.PERMISSION_ERROR) {
      toast.error('У вас нет прав для выполнения этого действия');
      return;
    }

    // Для других ошибок
    toast.error(errorInfo.message);
  }

  /**
   * Обрабатывает ошибки загрузки данных
   */
  static handleDataError(error: unknown, entityName?: string): void {
    const errorInfo = extractErrorInfo(error);
    
    if (errorInfo.code === ErrorCodes.NOT_FOUND_ERROR) {
      const message = entityName 
        ? `${entityName} не найден` 
        : 'Запрашиваемые данные не найдены';
      toast.error(message);
      return;
    }

    if (errorInfo.code === ErrorCodes.NETWORK_ERROR) {
      toast.error('Не удалось загрузить данные. Проверьте подключение к интернету');
      return;
    }

    // Для других ошибок
    const message = entityName 
      ? `Не удалось загрузить ${entityName.toLowerCase()}` 
      : 'Не удалось загрузить данные';
    toast.error(message);
  }
}

/**
 * Хук для обработки ошибок в React Query
 */
export function createErrorHandler(options?: {
  showToast?: boolean;
  entityName?: string;
}) {
  return (error: unknown) => {
    if (options?.entityName) {
      ErrorHandler.handleDataError(error, options.entityName);
    } else {
      ErrorHandler.handle(error, { showToast: options?.showToast });
    }
  };
}
