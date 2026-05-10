'use client';

import dynamic from 'next/dynamic';
import { ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapImpl = dynamic(() => import('./_map-impl').then((m) => m.MapImpl), {
  ssr: false,
  loading: () => (
    <div className="grid place-items-center bg-sand-100 dark:bg-sand-850 text-muted-foreground text-sm h-[320px] rounded-2xl">
      Загружаем карту…
    </div>
  ),
});

interface PropertyMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  height?: number | string;
  showOpen2GIS?: boolean;
}

export function PropertyMap({
  latitude,
  longitude,
  address,
  height = 360,
  showOpen2GIS = true,
}: PropertyMapProps) {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude ?? null;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude ?? null;
  const hasPoint = typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng);

  const open2GISHref = hasPoint
    ? `https://2gis.kz/geo/${lng},${lat}`
    : address
    ? `https://2gis.kz/search/${encodeURIComponent(address)}`
    : null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border">
        <MapImpl latitude={lat ?? undefined} longitude={lng ?? undefined} interactive={false} height={height} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {hasPoint ? (
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="tabular-nums">{lat!.toFixed(5)}, {lng!.toFixed(5)}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Точное местоположение не указано</p>
        )}
        {showOpen2GIS && open2GISHref && (
          <Button asChild variant="outline" size="sm">
            <a href={open2GISHref} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              Открыть в 2ГИС
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
