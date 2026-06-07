import type { PropertyListItem } from '@/shared/types/api';

const priceFormatter = new Intl.NumberFormat('ru-KZ', {
  maximumFractionDigits: 0,
});

export function formatPrice(price: string | number): string {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (!Number.isFinite(value)) return '—';
  return `${priceFormatter.format(value)} ₸`;
}

export type DealKind = 'sale' | 'rent' | 'daily' | 'commercial' | 'unknown';

export function getDealKind(slug?: string): DealKind {
  if (!slug) return 'unknown';
  const s = slug.toLowerCase();
  if (s.includes('продажа') || s === 'sale' || s === 'sell') return 'sale';
  if (s === 'rent' || s.includes('аренд')) return 'rent';
  if (s === 'daily' || s.includes('суто')) return 'daily';
  if (s === 'commercial' || s.includes('коммер')) return 'commercial';
  return 'unknown';
}

export function getPricePeriod(deal: DealKind): string | null {
  switch (deal) {
    case 'rent':
      return '/мес';
    case 'daily':
      return '/сутки';
    default:
      return null;
  }
}

export function getDealLabel(deal: DealKind): string {
  switch (deal) {
    case 'sale':
      return 'Продажа';
    case 'rent':
      return 'Аренда';
    case 'daily':
      return 'Посуточно';
    case 'commercial':
      return 'Коммерция';
    default:
      return 'Объявление';
  }
}

/* ---------- Площадь ---------- */

/** Slug типа недвижимости «Участок» — у него площадь измеряется в сотках. */
export const LAND_TYPE_SLUG = 'land';
/** Квадратных метров в одной сотке (ар). */
export const SQM_PER_SOTKA = 100;

const areaFormatter = new Intl.NumberFormat('ru-KZ', { maximumFractionDigits: 2 });

/** Участок ли это — для такого типа площадь показываем в сотках. */
export function isLandType(slug?: string | null): boolean {
  return (slug ?? '').toLowerCase() === LAND_TYPE_SLUG;
}

/** Единица измерения площади для типа недвижимости. */
export function getAreaUnit(slug?: string | null): 'сот.' | 'м²' {
  return isLandType(slug) ? 'сот.' : 'м²';
}

/**
 * Площадь в БД хранится всегда в м². Для участков переводим в сотки.
 * Возвращает строку вида «8 сот.» или «64 м²».
 */
export function formatArea(area?: number | null, slug?: string | null): string {
  if (area == null || !Number.isFinite(area)) return '—';
  if (isLandType(slug)) return `${areaFormatter.format(area / SQM_PER_SOTKA)} сот.`;
  return `${areaFormatter.format(area)} м²`;
}

/** Значение из поля ввода (в единице типа) → м² для бэкенда. */
export function areaInputToSqm(value: number, slug?: string | null): number {
  return isLandType(slug) ? value * SQM_PER_SOTKA : value;
}

/** м² из бэкенда → значение для поля ввода (в единице типа). */
export function sqmToAreaInput(area: number, slug?: string | null): number {
  return isLandType(slug) ? area / SQM_PER_SOTKA : area;
}

export function formatPropertySpecs(p: Pick<PropertyListItem, 'rooms' | 'area' | 'property_type'>): string[] {
  const parts: string[] = [];
  if (p.rooms) parts.push(`${p.rooms}-комн`);
  if (p.area) parts.push(formatArea(p.area, p.property_type?.slug));
  return parts;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 1) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  return new Intl.DateTimeFormat('ru-KZ', { day: 'numeric', month: 'short' }).format(date);
}

export function isNewListing(iso: string, days = 3): boolean {
  const date = new Date(iso);
  const diffDays = (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000);
  return diffDays <= days;
}
