'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Coins, Ruler, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { propertiesApi } from '@/shared/api';
import type { PropertyFilters as PropertyFiltersType } from '@/shared/types/api';
import { isLandType, SQM_PER_SOTKA } from '@/entities/property';
import { cn } from '@/lib/utils';

interface Props {
  filters: PropertyFiltersType;
  onChange: (next: PropertyFiltersType) => void;
  resultsCount?: number;
  className?: string;
  onSubmit?: () => void;
  variant?: 'sidebar' | 'sheet';
}

const ROOMS = ['Студия', '1', '2', '3', '4+'];

export function FilterSidebar({
  filters,
  onChange,
  resultsCount,
  className,
  onSubmit,
  variant = 'sidebar',
}: Props) {
  const [local, setLocal] = useState<PropertyFiltersType>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesApi.getPropertyTypes,
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
  });

  const set = <K extends keyof PropertyFiltersType>(key: K, value: PropertyFiltersType[K] | undefined) => {
    setLocal((prev) => {
      const next = { ...prev };
      if (value === undefined || value === '' || value === null) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const apply = () => {
    onChange(local);
    onSubmit?.();
  };

  const reset = () => {
    setLocal({});
    onChange({});
    onSubmit?.();
  };

  const activeCount = Object.keys(local).filter((k) => k !== 'ordering' && local[k as keyof PropertyFiltersType] !== undefined).length;

  // Если выбран тип «Участок» — площадь в фильтре показываем в сотках (в БД/запросе остаётся м²).
  const landType = propertyTypes?.find((t) => isLandType(t.slug));
  const isLandSelected = landType != null && local.property_type === landType.id;
  const areaDivisor = isLandSelected ? SQM_PER_SOTKA : 1;

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col',
        variant === 'sidebar' && 'rounded-xl border border-border bg-card shadow-sm overflow-hidden',
        className,
      )}
    >
      {variant === 'sidebar' && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-base font-semibold tracking-tight">Фильтры</h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Сбросить ({activeCount})
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Сделка */}
        <Section title="Сделка">
          <div className="flex flex-wrap gap-1.5">
            <ChipToggle
              active={local.service_type === undefined}
              onClick={() => set('service_type', undefined)}
              label="Все"
            />
            {serviceTypes?.map((t) => (
              <ChipToggle
                key={t.id}
                active={local.service_type === t.id}
                onClick={() => set('service_type', t.id)}
                label={t.name}
              />
            ))}
          </div>
        </Section>

        {/* Тип недвижимости */}
        <Section title="Тип недвижимости" icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />}>
          <div className="flex flex-wrap gap-1.5">
            <ChipToggle
              active={local.property_type === undefined}
              onClick={() => set('property_type', undefined)}
              label="Все"
            />
            {propertyTypes?.map((t) => (
              <ChipToggle
                key={t.id}
                active={local.property_type === t.id}
                onClick={() => set('property_type', t.id)}
                label={t.name}
              />
            ))}
          </div>
        </Section>

        {/* Город */}
        <Section title="Город">
          <Input
            placeholder="Например, Алматы"
            value={local.city ?? ''}
            onChange={(e) => set('city', e.target.value || undefined)}
          />
        </Section>

        {/* Цена */}
        <Section title="Цена, ₸" icon={<Coins className="h-4 w-4" strokeWidth={1.75} />}>
          <RangeInputs
            min={local.price_min}
            max={local.price_max}
            onChange={(min, max) => {
              set('price_min', min);
              set('price_max', max);
            }}
            step={10000}
          />
        </Section>

        {/* Площадь */}
        <Section title={`Площадь, ${isLandSelected ? 'сот.' : 'м²'}`} icon={<Ruler className="h-4 w-4" strokeWidth={1.75} />}>
          <RangeInputs
            min={local.area_min != null ? local.area_min / areaDivisor : undefined}
            max={local.area_max != null ? local.area_max / areaDivisor : undefined}
            onChange={(min, max) => {
              set('area_min', min != null ? min * areaDivisor : undefined);
              set('area_max', max != null ? max * areaDivisor : undefined);
            }}
            step={isLandSelected ? 0.1 : 1}
          />
        </Section>

        {/* Комнаты */}
        <Section title="Комнаты">
          <div className="flex flex-wrap gap-2">
            <ChipToggle
              active={local.rooms_min === undefined && local.rooms_max === undefined}
              onClick={() => {
                set('rooms_min', undefined);
                set('rooms_max', undefined);
              }}
              label="Любое"
            />
            {ROOMS.map((label, idx) => {
              // студия = 0; 4+ = 4..∞
              const value = label === 'Студия' ? 0 : label === '4+' ? 4 : Number(label);
              const active =
                label === '4+'
                  ? local.rooms_min === 4
                  : local.rooms_min === value && local.rooms_max === value;
              return (
                <ChipToggle
                  key={label}
                  active={active}
                  label={label}
                  onClick={() => {
                    if (active) {
                      set('rooms_min', undefined);
                      set('rooms_max', undefined);
                    } else if (label === '4+') {
                      set('rooms_min', 4);
                      set('rooms_max', undefined);
                    } else {
                      set('rooms_min', value);
                      set('rooms_max', value);
                    }
                  }}
                />
              );
            })}
          </div>
        </Section>

        {/* Удобства */}
        <Section title="Удобства">
          <div className="space-y-2.5">
            <CheckRow
              checked={!!local.has_parking}
              onChange={(v) => set('has_parking', v || undefined)}
              label="Парковка"
            />
            <CheckRow
              checked={!!local.has_balcony}
              onChange={(v) => set('has_balcony', v || undefined)}
              label="Балкон"
            />
            <CheckRow
              checked={!!local.has_elevator}
              onChange={(v) => set('has_elevator', v || undefined)}
              label="Лифт"
            />
            <CheckRow
              checked={!!local.is_featured}
              onChange={(v) => set('is_featured', v || undefined)}
              label="Только рекомендуемые"
            />
          </div>
        </Section>
      </div>

      {/* Sticky footer */}
      <div
        className={cn(
          'flex items-center gap-2 border-t border-border bg-card px-5 py-4',
          variant === 'sheet' && 'sticky bottom-0',
        )}
      >
        {activeCount > 0 && (
          <Button variant="ghost" onClick={reset} className="shrink-0">
            Сбросить
          </Button>
        )}
        <Button onClick={apply} className="flex-1" size="lg">
          {typeof resultsCount === 'number' ? `Показать ${resultsCount}` : 'Применить'}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ChipToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
        active
          ? 'bg-primary text-primary-foreground border border-primary'
          : 'bg-card text-foreground border border-border hover:border-sand-300 dark:hover:border-sand-600 hover:bg-sand-50 dark:hover:bg-sand-850',
      )}
    >
      {label}
    </button>
  );
}

function RangeInputs({
  min,
  max,
  onChange,
  step = 1,
}: {
  min?: number;
  max?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  step?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        type="number"
        inputMode="numeric"
        placeholder="От"
        value={min ?? ''}
        step={step}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined, max)}
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="До"
        value={max ?? ''}
        step={step}
        onChange={(e) => onChange(min, e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground/90 hover:text-foreground">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
    </label>
  );
}
