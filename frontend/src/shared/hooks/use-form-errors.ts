import { useState, useCallback } from 'react';
import { ErrorHandler } from '@/shared/lib/error-handler';

/**
 * Хук для управления ошибками форм
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Очищает все ошибки
   */
  const clearErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Очищает ошибку конкретного поля
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Устанавливает ошибки полей
   */
  const setErrors = useCallback((errors: Record<string, string>) => {
    setFieldErrors(errors);
  }, []);

  /**
   * Обрабатывает ошибку от API и извлекает ошибки полей
   */
  const handleError = useCallback((error: unknown) => {
    const formErrors = ErrorHandler.handleFormError(error);
    setFieldErrors(formErrors);
    return formErrors;
  }, []);

  /**
   * Обертка для асинхронных операций с формой
   */
  const withSubmit = useCallback(async <T>(
    submitFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsSubmitting(true);
      clearErrors();
      const result = await submitFn();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearErrors, handleError]);

  /**
   * Получает ошибку для конкретного поля
   */
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return fieldErrors[fieldName];
  }, [fieldErrors]);

  /**
   * Проверяет, есть ли ошибка у поля
   */
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return Boolean(fieldErrors[fieldName]);
  }, [fieldErrors]);

  /**
   * Проверяет, есть ли хотя бы одна ошибка
   */
  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    isSubmitting,
    hasErrors,
    clearErrors,
    clearFieldError,
    setErrors,
    handleError,
    withSubmit,
    getFieldError,
    hasFieldError,
  };
}
