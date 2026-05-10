'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { propertiesApi } from '@/shared/api';
import { useAuth } from '@/app/providers/auth-provider';
import { cn } from '@/lib/utils';

export function FavoriteButton({
  propertyId,
  isFavorited,
  size = 'md',
  variant = 'overlay',
  className,
}: {
  propertyId: number;
  isFavorited: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'plain';
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => propertiesApi.toggleFavorite(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    mutation.mutate();
  };

  const sizeMap = {
    sm: 'h-8 w-8 [&_svg]:size-[15px]',
    md: 'h-9 w-9 [&_svg]:size-[18px]',
    lg: 'h-10 w-10 [&_svg]:size-5',
  };

  const variantClass =
    variant === 'overlay'
      ? 'bg-white/85 text-sand-700 backdrop-blur-md hover:bg-white dark:bg-sand-900/70 dark:text-sand-100 dark:hover:bg-sand-900/90'
      : 'bg-secondary text-foreground hover:bg-sand-200 dark:hover:bg-sand-700';

  return (
    <button
      type="button"
      aria-label={isFavorited ? 'Убрать из избранного' : 'В избранное'}
      onClick={handleClick}
      disabled={mutation.isPending}
      className={cn(
        'inline-flex items-center justify-center rounded-full shadow-sm transition-all duration-150 ease-out',
        'active:scale-95 disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        sizeMap[size],
        variantClass,
        className,
      )}
    >
      <Heart
        className={cn(
          'transition-colors',
          isFavorited && 'fill-destructive text-destructive',
        )}
        strokeWidth={1.75}
      />
    </button>
  );
}
