'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorHandler } from '@/shared/lib/error-handler';

function getApiCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as { error?: { code?: string } };
    return apiError.error?.code ?? null;
  }
  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // В TanStack Query v5 onError убран из defaultOptions —
        // вместо этого используем QueryCache / MutationCache.
        queryCache: new QueryCache({
          onError: (error) => {
            const code = getApiCode(error);
            if (code && ['SERVER_ERROR', 'NETWORK_ERROR'].includes(code)) {
              ErrorHandler.handle(error, { showToast: true });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            // компоненты обычно сами обрабатывают через mutation.onError
            console.error('Mutation error:', error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              const code = getApiCode(error);
              if (code && ['AUTHENTICATION_ERROR', 'PERMISSION_ERROR'].includes(code)) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
