import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDealKind, getDealLabel, type DealKind } from '../lib/format';

type DealVariant = 'sale' | 'rent' | 'daily' | 'commercial';

const dealStyles: Record<DealVariant, string> = {
  sale: 'bg-terra-500 text-white border-transparent',
  rent: 'bg-info text-white border-transparent',
  daily: 'bg-ochre-400 text-sand-900 border-transparent',
  commercial: 'bg-sand-700 text-sand-50 border-transparent dark:bg-sand-200 dark:text-sand-900',
};

export function DealBadge({
  serviceSlug,
  className,
  size = 'md',
}: {
  serviceSlug?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const kind = getDealKind(serviceSlug);
  if (kind === 'unknown') return null;
  return (
    <Badge size={size} shape="pill" className={cn(dealStyles[kind as DealVariant], 'shadow-sm', className)}>
      {getDealLabel(kind as DealKind)}
    </Badge>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge size="md" shape="pill" className={cn('bg-success text-white border-transparent shadow-sm', className)}>
      Новое
    </Badge>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <Badge size="md" shape="pill" className={cn('bg-sand-900/85 text-sand-50 border-transparent shadow-sm backdrop-blur-sm', className)}>
      ⭐ Топ
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: 'active' | 'sold' | 'rented' | 'inactive'; className?: string }) {
  const map: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
    active: { label: 'Активно', variant: 'success' },
    sold: { label: 'Продано', variant: 'soft' },
    rented: { label: 'Сдано', variant: 'soft' },
    inactive: { label: 'Снято', variant: 'secondary' },
  };
  const cfg = map[status] ?? map.inactive;
  return (
    <Badge variant={cfg.variant} size="md" className={className}>
      {cfg.label}
    </Badge>
  );
}
