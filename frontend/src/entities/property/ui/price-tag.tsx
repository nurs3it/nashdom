import { cn } from '@/lib/utils';
import { formatPrice, getDealKind, getPricePeriod } from '../lib/format';

const sizeStyles = {
  sm: 'text-base font-bold',
  md: 'text-lg font-bold',
  lg: 'text-2xl font-bold',
  xl: 'text-3xl font-bold',
} as const;

const periodStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
  xl: 'text-base',
} as const;

export function PriceTag({
  price,
  serviceSlug,
  size = 'md',
  className,
  tone = 'foreground',
}: {
  price: string | number;
  serviceSlug?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
  tone?: 'foreground' | 'primary';
}) {
  const period = getPricePeriod(getDealKind(serviceSlug));
  return (
    <div className={cn('inline-flex items-baseline gap-1.5 leading-none', className)}>
      <span
        className={cn(
          sizeStyles[size],
          'tabular-nums tracking-tight',
          tone === 'primary' ? 'text-primary' : 'text-foreground',
        )}
      >
        {formatPrice(price)}
      </span>
      {period && (
        <span className={cn(periodStyles[size], 'text-muted-foreground font-medium')}>{period}</span>
      )}
    </div>
  );
}
