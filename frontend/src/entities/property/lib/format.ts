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

export function formatPropertySpecs(p: Pick<PropertyListItem, 'rooms' | 'area' | 'property_type'>): string[] {
  const parts: string[] = [];
  if (p.rooms) parts.push(`${p.rooms}-комн`);
  if (p.area) parts.push(`${p.area} м²`);
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
