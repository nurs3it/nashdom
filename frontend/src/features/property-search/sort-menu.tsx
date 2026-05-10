'use client';

import { ArrowUpDown, Check, Clock, ChevronDown, Eye, Maximize2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortValue =
  | '-created_at'
  | 'created_at'
  | 'price'
  | '-price'
  | 'area'
  | '-area'
  | '-views_count';

const OPTIONS: { value: SortValue; label: string; icon: React.ReactNode; group: string }[] = [
  { value: '-created_at', label: 'Сначала новые', icon: <Clock className="h-4 w-4" strokeWidth={1.75} />, group: 'Дата' },
  { value: 'created_at',  label: 'Сначала старые', icon: <Clock className="h-4 w-4" strokeWidth={1.75} />, group: 'Дата' },
  { value: 'price',       label: 'Дешевле сначала', icon: <TrendingUp className="h-4 w-4" strokeWidth={1.75} />, group: 'Цена' },
  { value: '-price',      label: 'Дороже сначала', icon: <TrendingDown className="h-4 w-4" strokeWidth={1.75} />, group: 'Цена' },
  { value: '-area',       label: 'Большие площади', icon: <Maximize2 className="h-4 w-4" strokeWidth={1.75} />, group: 'Площадь' },
  { value: 'area',        label: 'Маленькие площади', icon: <Maximize2 className="h-4 w-4" strokeWidth={1.75} />, group: 'Площадь' },
  { value: '-views_count', label: 'Популярные', icon: <Eye className="h-4 w-4" strokeWidth={1.75} />, group: 'Активность' },
];

export function SortMenu({
  value,
  onChange,
  className,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
  className?: string;
}) {
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-colors',
            'hover:border-sand-300 dark:hover:border-sand-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            className,
          )}
        >
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <span className="hidden sm:inline text-muted-foreground">Сортировка:</span>
          <span className="font-semibold">{current.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-between gap-2 cursor-pointer rounded-md px-2.5 py-2 text-sm font-medium',
              opt.value === value && 'bg-secondary text-foreground',
            )}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-muted-foreground">{opt.icon}</span>
              {opt.label}
            </span>
            {opt.value === value && <Check className="h-4 w-4 text-primary" strokeWidth={2} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
