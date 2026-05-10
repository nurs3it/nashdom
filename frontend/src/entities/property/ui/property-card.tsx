'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, MapPin } from 'lucide-react';
import type { PropertyListItem } from '@/shared/types/api';
import { MEDIA_URL } from '@/shared/config/api';
import { cn } from '@/lib/utils';
import { formatRelativeDate, isNewListing } from '../lib/format';
import { DealBadge, FeaturedBadge, NewBadge } from './property-badge';
import { PriceTag } from './price-tag';
import { FavoriteButton } from './favorite-button';
import { PropertyThumbPlaceholder } from './property-thumb-placeholder';

type Variant = 'standard' | 'featured' | 'compact' | 'mini';

interface PropertyCardProps {
  property: PropertyListItem;
  variant?: Variant;
  className?: string;
  showFavorite?: boolean;
  showViews?: boolean;
}

function resolveImageSrc(src?: string) {
  if (!src) return null;
  return src.startsWith('http') ? src : `${MEDIA_URL}${src}`;
}

function PropertyImage({
  property,
  ratio,
  sizes,
  zoom = true,
}: {
  property: PropertyListItem;
  ratio: string;
  sizes: string;
  zoom?: boolean;
}) {
  const src = resolveImageSrc(property.main_image);
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <div className={cn('relative w-full overflow-hidden', ratio)}>
      {showImage ? (
        <Image
          src={src!}
          alt={property.title}
          fill
          sizes={sizes}
          unoptimized
          onError={() => setFailed(true)}
          className={cn(
            'object-cover transition-transform duration-500 ease-out',
            zoom && 'group-hover:scale-[1.04]',
          )}
        />
      ) : (
        <PropertyThumbPlaceholder />
      )}
      {/* нижний градиент для читаемости overlay */}
      {zoom && showImage && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
    </div>
  );
}

function MetaRow({ property, className }: { property: PropertyListItem; className?: string }) {
  const items: string[] = [];
  if (property.property_type?.name) items.push(property.property_type.name);
  if (property.rooms) items.push(`${property.rooms}-комн`);
  if (property.area) items.push(`${property.area} м²`);
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground',
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-sand-300 dark:text-sand-600">·</span>}
          <span className="text-foreground/80 font-medium">{item}</span>
        </span>
      ))}
    </div>
  );
}

function AddressRow({ property, className }: { property: PropertyListItem; className?: string }) {
  const parts = [property.city, property.district].filter(Boolean).join(', ');
  return (
    <div className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
      <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{parts || '—'}</span>
    </div>
  );
}

function CardOverlay({ property, showFavorite }: { property: PropertyListItem; showFavorite: boolean }) {
  const fresh = isNewListing(property.created_at);
  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        <DealBadge serviceSlug={property.service_type?.slug} />
        {property.is_featured && <FeaturedBadge />}
        {fresh && !property.is_featured && <NewBadge />}
      </div>
      {showFavorite && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            propertyId={property.id}
            isFavorited={property.is_favorited}
          />
        </div>
      )}
    </>
  );
}

// ---- Standard (сетка каталога) ----
function StandardCard({ property, className, showFavorite, showViews }: Required<Omit<PropertyCardProps, 'variant' | 'className'>> & { className?: string }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-lg hover:border-sand-300 dark:hover:border-sand-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <div className="relative">
        <PropertyImage
          property={property}
          ratio="aspect-[4/3]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <CardOverlay property={property} showFavorite={showFavorite} />
        {showViews && property.views_count > 0 && (
          <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-sand-900/70 px-2.5 py-1 text-xs font-medium text-sand-50 backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="tabular-nums">{property.views_count}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="lg" />
        <h3 className="font-display text-[15px] font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <MetaRow property={property} />
        <AddressRow property={property} className="mt-auto pt-1" />
      </div>
    </Link>
  );
}

// ---- Featured (большая карточка для подборок) ----
function FeaturedCard({ property, className, showFavorite }: Required<Omit<PropertyCardProps, 'variant' | 'showViews' | 'className'>> & { className?: string }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md',
        'transition-[transform,box-shadow] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <div className="relative">
        <PropertyImage
          property={property}
          ratio="aspect-[16/10]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 60vw, 50vw"
        />
        <CardOverlay property={property} showFavorite={showFavorite} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="xl" />
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <MetaRow property={property} />
        <AddressRow property={property} className="mt-auto" />
      </div>
    </Link>
  );
}

// ---- Compact (горизонтальная — список / избранное) ----
function CompactCard({ property, className, showFavorite }: Required<Omit<PropertyCardProps, 'variant' | 'showViews' | 'className'>> & { className?: string }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        'group relative flex gap-4 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:shadow-md hover:border-sand-300 dark:hover:border-sand-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <div className="relative w-44 shrink-0 sm:w-56">
        <PropertyImage
          property={property}
          ratio="aspect-[4/3] h-full"
          sizes="(max-width: 640px) 40vw, 220px"
          zoom={false}
        />
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap gap-1.5">
          <DealBadge serviceSlug={property.service_type?.slug} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 py-3 pr-3">
        <div className="flex items-start justify-between gap-3">
          <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="lg" />
          {showFavorite && (
            <FavoriteButton propertyId={property.id} isFavorited={property.is_favorited} variant="plain" size="sm" />
          )}
        </div>
        <h3 className="font-semibold text-[14px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <MetaRow property={property} className="text-[13px]" />
        <AddressRow property={property} className="mt-auto text-[13px]" />
        <div className="text-xs text-muted-foreground">{formatRelativeDate(property.created_at)}</div>
      </div>
    </Link>
  );
}

// ---- Mini (для слайдера "похожие") ----
function MiniCard({ property, className }: Required<Omit<PropertyCardProps, 'variant' | 'showViews' | 'showFavorite' | 'className'>> & { className?: string }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        'group flex w-56 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <PropertyImage
        property={property}
        ratio="aspect-[4/3]"
        sizes="220px"
        zoom={false}
      />
      <div className="flex flex-col gap-1 p-3">
        <PriceTag price={property.price} serviceSlug={property.service_type?.slug} size="md" />
        <div className="text-xs text-muted-foreground line-clamp-1">
          {[property.rooms ? `${property.rooms}-комн` : null, property.area ? `${property.area} м²` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">{property.city}{property.district ? `, ${property.district}` : ''}</div>
      </div>
    </Link>
  );
}

export function PropertyCard({
  property,
  variant = 'standard',
  className,
  showFavorite = true,
  showViews = false,
}: PropertyCardProps) {
  switch (variant) {
    case 'featured':
      return (
        <FeaturedCard property={property} className={className} showFavorite={showFavorite} />
      );
    case 'compact':
      return (
        <CompactCard property={property} className={className} showFavorite={showFavorite} />
      );
    case 'mini':
      return <MiniCard property={property} className={className} />;
    case 'standard':
    default:
      return (
        <StandardCard property={property} className={className} showFavorite={showFavorite} showViews={showViews} />
      );
  }
}
