'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ALMATY: [number, number] = [43.238949, 76.889709];

function buildMarkerIcon() {
  // Тёплая SVG-капля в брендовом терракот цвете
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <defs>
        <filter id="s" x="-50%" y="-30%" width="200%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(56,32,16,.45)"/>
        </filter>
      </defs>
      <path filter="url(#s)" fill="#C26537" stroke="#7E3C20" stroke-width="1.5"
        d="M16 2 C8 2 2.5 7.5 2.5 15.5 C2.5 25 16 41 16 41 C16 41 29.5 25 29.5 15.5 C29.5 7.5 24 2 16 2 Z"/>
      <circle cx="16" cy="15" r="5" fill="#FFFFFF"/>
      <circle cx="16" cy="15" r="2.4" fill="#C26537"/>
    </svg>
  `.trim();
  return L.divIcon({
    className: 'nashdom-pin',
    html: svg,
    iconSize: [32, 44],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

function ClickToSet({ onSet }: { onSet: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitToPoint({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.5 });
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [map, lat, lng]);
  return null;
}

export interface MapImplProps {
  latitude?: number | null;
  longitude?: number | null;
  interactive?: boolean;
  onChange?: (lat: number, lng: number) => void;
  height?: number | string;
  zoom?: number;
}

export function MapImpl({
  latitude,
  longitude,
  interactive = false,
  onChange,
  height = 320,
  zoom = 12,
}: MapImplProps) {
  const center: [number, number] =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? [latitude, longitude]
      : ALMATY;
  const icon = useMemo(() => buildMarkerIcon(), []);
  const hasPoint = typeof latitude === 'number' && typeof longitude === 'number';

  return (
    <MapContainer
      center={center}
      zoom={hasPoint ? Math.max(zoom, 14) : zoom}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      dragging
      zoomControl={interactive}
      style={{ height, width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasPoint && (
        <Marker
          position={[latitude!, longitude!]}
          icon={icon}
          draggable={interactive}
          eventHandlers={
            interactive && onChange
              ? {
                  dragend: (e) => {
                    const m = e.target as L.Marker;
                    const ll = m.getLatLng();
                    onChange(ll.lat, ll.lng);
                  },
                }
              : undefined
          }
        />
      )}
      {interactive && onChange && <ClickToSet onSet={onChange} />}
      <FitToPoint lat={hasPoint ? latitude! : undefined} lng={hasPoint ? longitude! : undefined} />
    </MapContainer>
  );
}
