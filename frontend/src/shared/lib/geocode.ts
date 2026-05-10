export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  type?: string;
  importance?: number;
}

/**
 * Поиск координат по адресу через OpenStreetMap Nominatim (бесплатно, без ключа).
 * Полезно для address-search в форме недвижимости.
 *
 * Усиление по Казахстану: countrycodes=kz, accept-language=ru.
 * Лимит публичного API — 1 req/sec; вызывайте с дебаунсом.
 */
export async function geocodeAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '0');
  url.searchParams.set('countrycodes', 'kz');
  url.searchParams.set('accept-language', 'ru');

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    type?: string;
    importance?: number;
  }>;
  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name,
    type: item.type,
    importance: item.importance,
  }));
}
