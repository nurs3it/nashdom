'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorHandler } from '@/shared/lib/error-handler';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 минут
            gcTime: 1000 * 60 * 10, // 10 минут
            retry: (failureCount, error: unknown) => {
              // Не повторяем запросы для ошибок авторизации
              if (error && typeof error === 'object' && 'error' in error) {
                const apiError = error as { error: { code: string } };
                if (['AUTHENTICATION_ERROR', 'PERMISSION_ERROR'].includes(apiError.error.code)) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            onError: (error: unknown) => {
              // Глобальная обработка ошибок для queries
              // Показываем уведомления только для неожиданных ошибок
              if (error && typeof error === 'object' && 'error' in error) {
                const apiError = error as { error: { code: string } };
                if (['SERVER_ERROR', 'NETWORK_ERROR'].includes(apiError.error.code)) {
                  ErrorHandler.handle(error, { showToast: true });
                }
              }
            },
          },
          mutations: {
            retry: false,
            onError: (error: unknown) => {
              // Для мутаций не показываем автоматические уведомления
              // Компоненты должны сами обрабатывать ошибки
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
