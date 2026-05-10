'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, Coins, Search, ArrowRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { propertiesApi } from '@/shared/api';
import { cn } from '@/lib/utils';

type DealKey = 'all' | 'sale' | 'rent' | 'daily' | 'commercial';

const DEAL_TABS: { key: DealKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'sale', label: 'Купить' },
  { key: 'rent', label: 'Снять' },
  { key: 'daily', label: 'Посуточно' },
  { key: 'commercial', label: 'Коммерция' },
];

const PRICE_RANGES: { value: string; label: string }[] = [
  { value: 'any', label: 'Любая цена' },
  { value: '0-15000000', label: 'До 15 млн ₸' },
  { value: '15000000-30000000', label: '15–30 млн ₸' },
  { value: '30000000-60000000', label: '30–60 млн ₸' },
  { value: '60000000-', label: 'От 60 млн ₸' },
];

const SUGGESTIONS = [
  '1-комн в Бостандыке',
  'Дом в Алатау',
  'Студия до 200 000 ₸/мес',
  'Коммерция в центре',
  'Посуточно у Медеу',
];

export function SearchBar({
  variant = 'hero',
  defaultDeal = 'all',
  className,
}: {
  variant?: 'hero' | 'compact';
  defaultDeal?: DealKey;
  className?: string;
}) {
  const router = useRouter();
  const [deal, setDeal] = useState<DealKey>(defaultDeal);
  const [city, setCity] = useState<string>('any');
  const [propertyType, setPropertyType] = useState<string>('any');
  const [priceRange, setPriceRange] = useState<string>('any');

  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesApi.getPropertyTypes,
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (deal !== 'all' && serviceTypes) {
      const match = serviceTypes.find((s) => s.slug?.toLowerCase().includes(deal));
      if (match) params.set('service_type', String(match.id));
    }
    if (propertyType !== 'any') params.set('property_type', propertyType);
    if (city !== 'any') params.set('city', city);
    if (priceRange !== 'any') {
      const [min, max] = priceRange.split('-');
      if (min) params.set('price_min', min);
      if (max) params.set('price_max', max);
    }
    router.push(`/properties${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleSuggestion = (s: string) => {
    router.push(`/properties?search=${encodeURIComponent(s)}`);
  };

  const isHero = variant === 'hero';

  return (
    <div className={cn('w-full', className)}>
      {/* Deal tabs */}
      <div className="inline-flex h-11 items-center gap-1 rounded-full bg-card/80 p-1 shadow-md backdrop-blur-md border border-border/60">
        {DEAL_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setDeal(tab.key)}
            className={cn(
              'inline-flex h-9 items-center px-4 text-sm font-semibold rounded-full transition-all duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              deal === tab.key
                ? 'bg-foreground text-background shadow-sm'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search row */}
      <div
        className={cn(
          'mt-3 flex w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
          isHero ? 'flex-col md:flex-row md:h-16' : 'flex-col sm:flex-row sm:h-14',
        )}
      >
        <SelectField
          icon={<MapPin className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          label="Город"
          value={city}
          onChange={setCity}
          placeholder="Любой город"
          options={[
            { value: 'any', label: 'Любой город' },
            { value: 'Алматы', label: 'Алматы' },
            { value: 'Астана', label: 'Астана' },
            { value: 'Шымкент', label: 'Шымкент' },
            { value: 'Караганда', label: 'Караганда' },
          ]}
        />
        <Divider />
        <SelectField
          icon={<Building2 className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          label="Тип жилья"
          value={propertyType}
          onChange={setPropertyType}
          placeholder="Все типы"
          options={[
            { value: 'any', label: 'Все типы' },
            ...(propertyTypes?.map((t) => ({ value: String(t.id), label: t.name })) ?? []),
          ]}
        />
        <Divider />
        <SelectField
          icon={<Coins className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          label="Цена"
          value={priceRange}
          onChange={setPriceRange}
          placeholder="Любая"
          options={PRICE_RANGES}
        />

        {/* Submit */}
        <button
          type="button"
          onClick={handleSearch}
          className={cn(
            'flex shrink-0 items-center justify-center gap-2 bg-primary px-6 text-base font-semibold text-primary-foreground transition-all duration-150 ease-out',
            'hover:bg-terra-600 dark:hover:bg-terra-300 active:scale-[0.99]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            isHero ? 'h-14 md:h-full md:min-w-[160px]' : 'h-12 sm:h-full sm:min-w-[140px]',
          )}
        >
          <Search className="h-5 w-5" strokeWidth={2} />
          <span>Найти</span>
        </button>
      </div>

      {/* Chips */}
      {isHero && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/80 mr-1">Популярное:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition-colors hover:bg-card hover:text-foreground hover:border-sand-300 dark:hover:border-sand-600"
            >
              <ArrowRight className="h-3 w-3 opacity-60" strokeWidth={2} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex-1 min-w-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            'h-full w-full rounded-none border-0 bg-transparent px-4 py-3 shadow-none',
            'hover:bg-sand-50 dark:hover:bg-sand-850 focus-visible:ring-0 focus-visible:ring-offset-0',
            'data-[state=open]:bg-sand-50 dark:data-[state=open]:bg-sand-850',
          )}
        >
          <div className="flex w-full items-center gap-3 min-w-0">
            <span className="shrink-0 text-muted-foreground">{icon}</span>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/80">
                {label}
              </span>
              <SelectValue placeholder={placeholder} />
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Divider() {
  return <div className="hidden md:block w-px shrink-0 bg-border" aria-hidden />;
}
