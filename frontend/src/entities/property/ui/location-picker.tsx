'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { geocodeAddress, type GeocodeResult } from '@/shared/lib/geocode';
import { cn } from '@/lib/utils';

const MapImpl = dynamic(() => import('./_map-impl').then((m) => m.MapImpl), {
  ssr: false,
  loading: () => (
    <div className="grid place-items-center bg-sand-100 dark:bg-sand-850 text-muted-foreground text-sm h-[280px] rounded-xl">
      Загружаем карту…
    </div>
  ),
});

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [busyGeo, setBusyGeo] = useState(false);
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude ?? null;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude ?? null;
  const hasPoint =
    typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng);

  const useGeolocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setBusyGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setBusyGeo(false);
      },
      () => setBusyGeo(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-3">
      <AddressSearch onPick={(r) => onChange(r.lat, r.lng)} />

      <div className="rounded-xl overflow-hidden border border-border">
        <MapImpl
          latitude={lat ?? undefined}
          longitude={lng ?? undefined}
          interactive
          height={300}
          onChange={(la, ln) => onChange(la, ln)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
          {hasPoint ? (
            <>
              <span className="font-semibold text-foreground tabular-nums">{lat!.toFixed(5)}</span>,&nbsp;
              <span className="font-semibold text-foreground tabular-nums">{lng!.toFixed(5)}</span>
            </>
          ) : (
            <span>Найдите адрес или кликните по карте</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={useGeolocation} disabled={busyGeo}>
            <LocateFixed className="h-4 w-4" strokeWidth={1.75} />
            {busyGeo ? 'Определяем…' : 'Моя геопозиция'}
          </Button>
          {hasPoint && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null, null)}>
              <X className="h-4 w-4" strokeWidth={1.75} />
              Убрать точку
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Точная точка помогает покупателю быстрее принять решение. Маркер можно перетаскивать для уточнения.
      </p>
    </div>
  );
}

function AddressSearch({ onPick }: { onPick: (r: GeocodeResult) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const r = await geocodeAddress(q, ctrl.signal);
        setResults(r);
        setOpen(true);
        setActiveIdx(-1);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const select = (r: GeocodeResult) => {
    onPick(r);
    setQuery(r.displayName);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = activeIdx >= 0 ? activeIdx : 0;
      const r = results[idx];
      if (r) select(r);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" strokeWidth={1.75} />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Найти на карте: город, улица, ЖК…"
        className="h-11 pl-10 pr-10"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" strokeWidth={1.75} />
      ) : query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setResults([]);
            setOpen(false);
          }}
          aria-label="Очистить"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ) : null}

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={activeIdx === i}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => select(r)}
                  className={cn(
                    'w-full text-left flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors',
                    activeIdx === i ? 'bg-secondary text-foreground' : 'text-foreground/85 hover:bg-secondary/60',
                  )}
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" strokeWidth={1.75} />
                  <span className="line-clamp-2">{r.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 border-t border-border bg-secondary/40">
            Поиск через OpenStreetMap
          </div>
        </div>
      )}
      {open && !loading && query.trim().length >= 3 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl border border-border bg-popover shadow-lg p-3 text-sm text-muted-foreground">
          Ничего не нашлось. Попробуйте уточнить адрес.
        </div>
      )}
    </div>
  );
}
