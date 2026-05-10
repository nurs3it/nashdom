'use client';

import { LayoutGrid, List, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list' | 'map';

const OPTIONS: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'grid', label: 'Сеткой', icon: <LayoutGrid className="h-4 w-4" strokeWidth={1.75} /> },
  { value: 'list', label: 'Списком', icon: <List className="h-4 w-4" strokeWidth={1.75} /> },
  { value: 'map',  label: 'На карте', icon: <Map className="h-4 w-4" strokeWidth={1.75} /> },
];

export function ViewToggle({
  value,
  onChange,
  className,
  hideLabels = false,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
  hideLabels?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex h-10 items-center rounded-md border border-border bg-card p-1 shadow-sm',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              active
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
            )}
            title={opt.label}
          >
            {opt.icon}
            {!hideLabels && <span className="hidden md:inline">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
