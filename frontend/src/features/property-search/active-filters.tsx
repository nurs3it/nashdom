'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { propertiesApi } from '@/shared/api';
import { formatPrice } from '@/entities/property';
import type { PropertyFilters as PropertyFiltersType } from '@/shared/types/api';
import { cn } from '@/lib/utils';

type Chip = { key: keyof PropertyFiltersType | 'rooms'; label: string; onRemove: () => void };

export function ActiveFilters({
  filters,
  onChange,
  className,
}: {
  filters: PropertyFiltersType;
  onChange: (next: PropertyFiltersType) => void;
  className?: string;
}) {
  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesApi.getPropertyTypes,
    staleTime: Infinity,
  });
  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
    staleTime: Infinity,
  });

  const remove = (key: keyof PropertyFiltersType | (keyof PropertyFiltersType)[]) => {
    const next = { ...filters };
    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => delete next[k]);
    onChange(next);
  };

  const chips: Chip[] = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `«${filters.search}»`, onRemove: () => remove('search') });
  }
  if (filters.city) {
    chips.push({ key: 'city', label: filters.city, onRemove: () => remove('city') });
  }
  if (filters.service_type) {
    const s = serviceTypes?.find((s) => s.id === filters.service_type);
    if (s) chips.push({ key: 'service_type', label: s.name, onRemove: () => remove('service_type') });
  }
  if (filters.property_type) {
    const t = propertyTypes?.find((t) => t.id === filters.property_type);
    if (t) chips.push({ key: 'property_type', label: t.name, onRemove: () => remove('property_type') });
  }
  if (filters.price_min !== undefined || filters.price_max !== undefined) {
    const from = filters.price_min !== undefined ? formatPrice(filters.price_min) : '';
    const to = filters.price_max !== undefined ? formatPrice(filters.price_max) : '';
    const label = from && to ? `${from} – ${to}` : from ? `от ${from}` : `до ${to}`;
    chips.push({ key: 'price_min', label, onRemove: () => remove(['price_min', 'price_max']) });
  }
  if (filters.area_min !== undefined || filters.area_max !== undefined) {
    const from = filters.area_min !== undefined ? `${filters.area_min}` : '';
    const to = filters.area_max !== undefined ? `${filters.area_max}` : '';
    const label = from && to ? `${from} – ${to} м²` : from ? `от ${from} м²` : `до ${to} м²`;
    chips.push({ key: 'area_min', label, onRemove: () => remove(['area_min', 'area_max']) });
  }
  if (filters.rooms_min !== undefined || filters.rooms_max !== undefined) {
    const min = filters.rooms_min;
    const max = filters.rooms_max;
    let label = '';
    if (min === max && typeof min === 'number') label = min === 0 ? 'Студия' : `${min} комн.`;
    else if (typeof min === 'number' && max === undefined) label = `${min}+ комн.`;
    else if (typeof min === 'number' && typeof max === 'number') label = `${min}–${max} комн.`;
    chips.push({ key: 'rooms', label: label || 'Комнаты', onRemove: () => remove(['rooms_min', 'rooms_max']) });
  }
  if (filters.has_parking) chips.push({ key: 'has_parking', label: 'Парковка', onRemove: () => remove('has_parking') });
  if (filters.has_balcony) chips.push({ key: 'has_balcony', label: 'Балкон', onRemove: () => remove('has_balcony') });
  if (filters.has_elevator) chips.push({ key: 'has_elevator', label: 'Лифт', onRemove: () => remove('has_elevator') });
  if (filters.is_featured) chips.push({ key: 'is_featured', label: 'Рекомендуемые', onRemove: () => remove('is_featured') });

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((c, i) => (
        <button
          key={`${String(c.key)}-${i}`}
          type="button"
          onClick={c.onRemove}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-3 pr-2 h-8 text-sm font-medium text-foreground shadow-sm hover:border-destructive/50 hover:text-destructive transition-colors"
        >
          {c.label}
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary group-hover:bg-destructive/10 transition-colors">
            <X className="h-3 w-3" strokeWidth={2.25} />
          </span>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => onChange({ ordering: filters.ordering })}
          className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline px-1"
        >
          Очистить всё
        </button>
      )}
    </div>
  );
}
