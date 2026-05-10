'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Map as MapIcon, SearchX } from 'lucide-react';
import { Header } from '@/widgets/header/header';
import { Footer } from '@/widgets/footer/footer';
import { PropertyCard } from '@/entities/property';
import { Button } from '@/components/ui/button';
import { propertiesApi } from '@/shared/api';
import { getDealKind } from '@/entities/property';
import { getCookie } from '@/shared/lib/cookies';
import { cn } from '@/lib/utils';
import {
  FilterSidebar,
  FilterSheet,
  SortMenu,
  ActiveFilters,
  ViewToggle,
  type SortValue,
  type ViewMode,
} from '@/features/property-search';
import type { PropertyFilters as PropertyFiltersType } from '@/shared/types/api';

type FiltersUI = PropertyFiltersType & { deal?: string; page?: number };

const PAGE_SIZE = 20;

function parseFiltersFromSearchParams(sp: URLSearchParams): FiltersUI {
  const out: FiltersUI = {};
  sp.forEach((value, key) => {
    if (key === 'property_type') {
      const n = parseInt(value, 10);
      if (Number.isFinite(n)) out.property_type = n;
    } else if (key === 'service_type') {
      const n = parseInt(value, 10);
      if (Number.isFinite(n)) out.service_type = n;
      else out.deal = value; // slug-form: ?service_type=sale
    } else if (key === 'deal') {
      out.deal = value;
    } else if (key === 'page') {
      const n = parseInt(value, 10);
      if (Number.isFinite(n) && n > 0) out.page = n;
    } else if (key === 'price_min' || key === 'price_max' || key === 'area_min' || key === 'area_max') {
      const n = parseFloat(value);
      if (Number.isFinite(n)) out[key] = n;
    } else if (key === 'rooms_min' || key === 'rooms_max') {
      const n = parseInt(value, 10);
      if (Number.isFinite(n)) out[key] = n;
    } else if (key === 'has_parking' || key === 'has_balcony' || key === 'has_elevator' || key === 'is_featured') {
      out[key] = value === 'true';
    } else if (key === 'city' || key === 'search') {
      out[key] = value;
    }
  });
  return out;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<FiltersUI>(() =>
    parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const [ordering, setOrdering] = useState<SortValue>('-created_at');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Загрузка справочника услуг — для резолва deal-slug в service_type id
  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
    staleTime: Infinity,
  });

  // При первой загрузке: если в URL нет city, подставляем из cookie
  useEffect(() => {
    const initial = parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString()));
    if (!initial.city) {
      const cookieCity = getCookie('nashdom-city');
      if (cookieCity) initial.city = cookieCity;
    }
    setFilters(initial);
  }, [searchParams]);

  // Реактивно реагируем на смену города в Header
  useEffect(() => {
    const onCityChange = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (!next) return;
      setFilters((prev) => ({ ...prev, city: next, page: undefined }));
      const params = new URLSearchParams();
      Object.entries({ ...filters, city: next, page: undefined }).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        params.set(k, String(v));
      });
      router.replace(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
    };
    window.addEventListener('nashdom-city', onCityChange);
    return () => window.removeEventListener('nashdom-city', onCityChange);
  }, [filters, router]);

  // Резолвим deal → service_type как только справочник пришёл
  useEffect(() => {
    if (!filters.deal || !serviceTypes) return;
    const targetKind = getDealKind(filters.deal);
    const match = serviceTypes.find((s) => getDealKind(s.slug) === targetKind);
    if (match) {
      setFilters((prev) => {
        const { deal, ...rest } = prev;
        return { ...rest, service_type: match.id };
      });
    }
  }, [filters.deal, serviceTypes]);

  // Filters для API: исключаем `deal` (только UI-параметр)
  const apiFilters = useMemo(() => {
    const { deal, ...rest } = filters;
    return rest;
  }, [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', apiFilters, ordering],
    // загружаем только когда deal либо отсутствует, либо уже резолвлен
    enabled: !filters.deal || !!filters.service_type,
    queryFn: () => propertiesApi.getProperties({ ...apiFilters, ordering }),
  });

  const updateFilters = (next: FiltersUI, opts: { keepPage?: boolean } = {}) => {
    const finalNext = opts.keepPage ? next : { ...next, page: undefined };
    setFilters(finalNext);
    const params = new URLSearchParams();
    Object.entries(finalNext).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      params.set(key, String(value));
    });
    router.replace(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const goToPage = (page: number) => {
    updateFilters({ ...filters, page: page > 1 ? page : undefined }, { keepPage: true });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-wide py-6 lg:py-10">
          {/* Heading + meta */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                Каталог
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Недвижимость
                {filters.city && (
                  <span className="text-muted-foreground font-normal"> · {filters.city}</span>
                )}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? (
                  'Загружаем объекты…'
                ) : (
                  <>
                    Найдено <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
                    {pluralizeRu(total, 'объект', 'объекта', 'объектов')}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSheet
                filters={filters}
                onChange={updateFilters}
                resultsCount={total}
                triggerClassName="lg:hidden"
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <SortMenu value={ordering} onChange={setOrdering} />
            </div>
          </div>

          {/* Active filters */}
          <ActiveFilters filters={filters} onChange={updateFilters} className="mb-6" />

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start">
            {/* Sidebar */}
            <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)]">
              <FilterSidebar
                filters={filters}
                onChange={updateFilters}
                resultsCount={total}
                className="max-h-[calc(100vh-6rem)]"
              />
            </aside>

            {/* Results */}
            <section className="min-w-0">
              {viewMode === 'map' ? (
                <MapPlaceholder count={total} />
              ) : isLoading ? (
                <SkeletonGrid />
              ) : results.length === 0 ? (
                <EmptyState onReset={() => updateFilters({})} />
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'space-y-4'
                  }
                >
                  {results.map((property) =>
                    viewMode === 'grid' ? (
                      <PropertyCard key={property.id} property={property} variant="standard" showViews />
                    ) : (
                      <PropertyCard key={property.id} property={property} variant="compact" />
                    ),
                  )}
                </div>
              )}

              {data && results.length > 0 && totalPages > 1 && (
                <PaginationBar
                  page={currentPage}
                  total={total}
                  totalPages={totalPages}
                  resultsLength={results.length}
                  onPageChange={goToPage}
                />
              )}
              {data && results.length > 0 && totalPages === 1 && (
                <div className="mt-10 text-center text-sm text-muted-foreground">
                  Показано <span className="font-semibold text-foreground tabular-nums">{results.length}</span> из{' '}
                  <span className="font-semibold text-foreground tabular-nums">{total}</span>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] bg-sand-100 dark:bg-sand-800 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-1/2 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-sand-100 dark:bg-sand-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-card/50 py-16 px-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-terra-50 text-terra-500 mb-4 dark:bg-sand-850 dark:text-terra-300">
        <SearchX className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight mb-2">Ничего не нашлось</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Попробуйте ослабить фильтры — например, расширить диапазон цены или убрать удобства.
      </p>
      <Button onClick={onReset} variant="default" size="lg">
        Сбросить фильтры
      </Button>
    </div>
  );
}

function MapPlaceholder({ count }: { count: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-sand-100 dark:bg-sand-850 min-h-[60vh] flex items-center justify-center">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.sand-300)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-20" />
      <div className="relative text-center px-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-card text-primary mb-4 shadow-md">
          <MapIcon className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight mb-1">Режим карты</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Здесь будут пины {count} объектов с кластерами и ценами. Подключим карту в следующей итерации.
        </p>
      </div>
    </div>
  );
}

function PaginationBar({
  page,
  total,
  totalPages,
  resultsLength,
  onPageChange,
}: {
  page: number;
  total: number;
  totalPages: number;
  resultsLength: number;
  onPageChange: (p: number) => void;
}) {
  const pages = buildPageList(page, totalPages);
  const from = (page - 1) * 20 + 1;
  const to = Math.min(from + resultsLength - 1, total);

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <nav aria-label="Постраничная навигация" className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </PageBtn>
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`gap-${i}`}
              className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground tabular-nums"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              active={p === page}
              onClick={() => onPageChange(p)}
              aria-label={`Страница ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </PageBtn>
          ),
        )}
        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Следующая страница"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </PageBtn>
      </nav>
      <p className="text-xs text-muted-foreground tabular-nums">
        {from}–{to} из {total}
      </p>
    </div>
  );
}

function PageBtn({
  active,
  disabled,
  onClick,
  children,
  ...props
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center px-2.5 rounded-md text-sm font-semibold tabular-nums transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-primary text-primary-foreground border border-primary'
          : 'bg-card border border-border text-foreground hover:bg-secondary',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  // показываем + соседей у краёв
  if (current <= 3) [2, 3, 4].forEach((p) => set.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => set.add(p));
  const sorted = Array.from(set).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
}

function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PropertiesContent />
    </Suspense>
  );
}
