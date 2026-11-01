'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2, X, ExternalLink, Route } from 'lucide-react';
import type { VendorCard } from '@/lib/types';
import {
  NOMINATIM_BASE_URL,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  LEAFLET_CSS_URL,
  LEAFLET_ICON_URL,
  LEAFLET_ICON_RETINA_URL,
  LEAFLET_SHADOW_URL,
  GMAPS_DIRECTIONS_BASE,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  MAP_SEARCH_RADIUS_KM,
  MAP_DEFAULT_RADIUS_KM,
  MAP_VIEWBOX_DELTA,
  MAP_RESULT_LIMIT,
  GEOLOCATION_TIMEOUT_MS,
  VENDOR_CATEGORY_QUERIES,
} from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LatLng { lat: number; lng: number }

interface MapPin {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  distanceKm?: number;
  osmId?: string;
}

interface Props {
  vendors: VendorCard[];
  city: string;
  isActive?: boolean;
}

// ─── Nominatim Geocoding (OpenStreetMap, free, no key) ───────────────────────
async function geocodeCity(city: string): Promise<LatLng | null> {
  try {
    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json() as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function searchNearby(query: string, center: LatLng, radiusKm: number = MAP_DEFAULT_RADIUS_KM): Promise<MapPin[]> {
  try {
    const delta = MAP_VIEWBOX_DELTA;
    const viewbox = `${center.lng - delta},${center.lat + delta},${center.lng + delta},${center.lat - delta}`;
    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=${MAP_RESULT_LIMIT}&viewbox=${viewbox}&bounded=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json() as {
      place_id: string; display_name: string; lat: string; lon: string;
      address?: { road?: string; suburb?: string; city?: string };
    }[];
    return data.map((item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const distanceKm = haversine(center, { lat, lng });
      return {
        id: item.place_id,
        name: item.display_name.split(',')[0] ?? item.display_name,
        category: query,
        lat,
        lng,
        address: item.display_name,
        distanceKm: Math.round(distanceKm * 10) / 10,
      };
    }).filter((p) => p.distanceKm !== undefined && p.distanceKm <= radiusKm);
  } catch {
    return [];
  }
}

// Haversine formula — great-circle distance in km
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function vendorToQuery(category: string): string {
  for (const [key, query] of Object.entries(VENDOR_CATEGORY_QUERIES)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return query;
  }
  return category;
}

// ─── Map initializer (dynamically loaded) ────────────────────────────────────
async function initLeaflet(
  container: HTMLDivElement,
  center: LatLng,
  pins: MapPin[],
  userPos: LatLng | null,
  onPinClick: (pin: MapPin) => void,
) {
  const L = (await import('leaflet')).default;

  // Fix default marker icons broken by webpack
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: LEAFLET_ICON_RETINA_URL,
    iconUrl: LEAFLET_ICON_URL,
    shadowUrl: LEAFLET_SHADOW_URL,
  });

  const map = L.map(container, { zoomControl: true, scrollWheelZoom: true }).setView(
    [center.lat, center.lng], MAP_DEFAULT_ZOOM,
  );

  map.whenReady(() => {
    map.invalidateSize();
  });

  L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: MAP_MAX_ZOOM,
  }).addTo(map);

  // User position pin (blue pulse)
  if (userPos) {
    const userIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#7C3AED;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(124,58,237,0.25)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      className: '',
    });
    L.marker([userPos.lat, userPos.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>📍 Your Location</strong>');
  }

  // City center pin
  const cityIcon = L.divIcon({
    html: `<div style="width:14px;height:14px;background:#C5F135;border:3px solid #0A0A0A;border-radius:50%;box-shadow:2px 2px 0 #0A0A0A"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
  });
  L.marker([center.lat, center.lng], { icon: cityIcon })
    .addTo(map)
    .bindPopup('<strong>🏙️ Event City</strong>');

  // Vendor/venue pins
  pins.forEach((pin) => {
    const vendorIcon = L.divIcon({
      html: `<div style="background:#7C3AED;color:white;padding:3px 7px;border-radius:6px;font-size:11px;font-weight:800;white-space:nowrap;border:2px solid #0A0A0A;box-shadow:2px 2px 0 #0A0A0A;font-family:monospace">📌 ${pin.name.slice(0, 18)}</div>`,
      className: '',
      iconAnchor: [0, 0],
    });
    L.marker([pin.lat, pin.lng], { icon: vendorIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:system-ui;min-width:180px">
          <strong style="font-size:13px">${pin.name}</strong><br/>
          <span style="font-size:11px;color:#6B7280">${pin.category}</span><br/>
          <span style="font-size:11px">${pin.address.split(',').slice(0, 3).join(', ')}</span><br/>
          ${pin.distanceKm !== undefined ? `<span style="font-size:11px;color:#7C3AED;font-weight:700">📏 ${pin.distanceKm} km away</span>` : ''}
          <br/><a href="https://www.openstreetmap.org/?mlat=${pin.lat}&mlon=${pin.lng}#map=16/${pin.lat}/${pin.lng}" target="_blank" style="font-size:11px;color:#7C3AED">Open in OSM ↗</a>
        </div>
      `, { maxWidth: 260 })
      .on('click', () => onPinClick(pin));
  });

  // Draw lines from user to each pin (telemetry)
  if (userPos) {
    pins.forEach((pin) => {
      L.polyline([[userPos.lat, userPos.lng], [pin.lat, pin.lng]], {
        color: '#7C3AED',
        weight: 1.5,
        opacity: 0.3,
        dashArray: '5,8',
      }).addTo(map);
    });
  }

  return map;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VendorMapScreen({ vendors, city, isActive }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null); // Leaflet map instance — typed as any since Leaflet types are runtime-only

  const [cityCenter, setCityCenter] = useState<LatLng | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [status, setStatus] = useState('Locating city…');
  const [mapReady, setMapReady] = useState(false);

  // ResizeObserver + visibility listener to guarantee Leaflet recalculates container dimensions
  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ animate: false });
        }
      }
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // When tab becomes active or city center is set, force Leaflet to recalculate container bounds
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false });
        if (cityCenter) {
          mapInstanceRef.current.setView([cityCenter.lat, cityCenter.lng]);
        }
      }
    };

    invalidate();
    const t1 = setTimeout(invalidate, 80);
    const t2 = setTimeout(invalidate, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, cityCenter]);

  // Geocode city on mount
  useEffect(() => {
    geocodeCity(city).then((pos) => {
      if (pos) {
        setCityCenter(pos);
        setStatus('City located. Click "Locate Me" to see your position.');
      } else {
        setStatus(`Could not geocode "${city}". Try searching manually.`);
      }
    });
  }, [city]);

  // Request user geolocation
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported by this browser.');
      return;
    }
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingGeo(false);
        setStatus('Your location found! Distance telemetry enabled.');
      },
      () => {
        setLoadingGeo(false);
        setStatus('Location access denied. Map still works without it.');
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }, []);

  // Search for vendors/venues via Nominatim
  const handleSearch = useCallback(async (query: string) => {
    if (!cityCenter) return;
    setLoadingSearch(true);
    setStatus(`Searching for "${query}" near ${city}…`);
    const results = await searchNearby(query, userPos ?? cityCenter, MAP_SEARCH_RADIUS_KM);
    setPins(results);
    setStatus(results.length > 0
      ? `Found ${results.length} places for "${query}"`
      : `No results found for "${query}" within ${MAP_SEARCH_RADIUS_KM} km.`);
    setLoadingSearch(false);
  }, [cityCenter, city, userPos]);

  // Quick-search a vendor category from the list
  const quickSearch = useCallback((category: string) => {
    const q = vendorToQuery(category);
    setSearchQuery(q);
    void handleSearch(q);
  }, [handleSearch]);

  // Initialize / re-render map when data changes
  useEffect(() => {
    if (!mapRef.current || !cityCenter) return;

    const container = mapRef.current;

    // Destroy previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    }

    void initLeaflet(container, cityCenter, pins, userPos, setSelected).then((m) => {
      mapInstanceRef.current = m;
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cityCenter, pins, userPos]);

  // Pre-load Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, []);

  const vendorCategories = [...new Set(vendors.map((v) => v.category))];

  return (
    <section aria-labelledby="vendormap-heading">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="badge badge-purple" style={{ marginBottom: 6 }}>OPENSTREETMAP</span>
        <h2 id="vendormap-heading" className="section-title">Vendor & Venue Finder</h2>
        <p className="section-subtitle">
          Locate vendors, venues and services near {city} — powered by OpenStreetMap (no API key needed).
        </p>
      </div>

      {/* Status bar */}
      <div
        role="status"
        aria-live="polite"
        style={{
          background: 'var(--purple-bg)', border: 'var(--border)', borderRadius: 8,
          padding: '8px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)',
          color: 'var(--purple)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {(loadingGeo || loadingSearch) && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {status}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search box */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <label className="label" htmlFor="map-search">Search venues, services…</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="map-search"
              type="text"
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSearch(searchQuery)}
              placeholder="e.g. banquet hall, photographer…"
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-lime"
              onClick={() => void handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || loadingSearch || !cityCenter}
              style={{ minHeight: 44, padding: '0 16px' }}
            >
              {loadingSearch ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            </button>
          </div>
        </div>

        {/* Locate me */}
        <button
          className="btn btn-lime"
          onClick={locateUser}
          disabled={loadingGeo}
          style={{ minHeight: 44, padding: '0 16px', fontSize: 13 }}
          aria-label="Use my current location"
        >
          {loadingGeo
            ? <Loader2 size={15} aria-hidden="true" className="animate-spin" />
            : <Navigation size={15} aria-hidden="true" />}
          Locate Me
        </button>
      </div>

      {/* Quick-search vendor categories from plan */}
      {vendorCategories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            From your plan:
          </span>
          {vendorCategories.map((cat) => (
            <button
              key={cat}
              className="btn-outline"
              onClick={() => quickSearch(cat)}
              style={{ fontSize: 11, padding: '4px 10px', minHeight: 28 }}
            >
              <MapPin size={11} aria-hidden="true" /> {cat}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: 16 }}>
        {/* Map canvas */}
        <div
          style={{
            border: 'var(--border)', borderRadius: 12, overflow: 'hidden',
            boxShadow: 'var(--shadow)', position: 'relative', minHeight: 480,
          }}
        >
          {!mapReady && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: '#F5F0FF', zIndex: 1,
              flexDirection: 'column', gap: 10,
            }}>
              <Loader2 size={32} style={{ color: 'var(--purple)' }} className="animate-spin" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--mono)' }}>
                Loading map…
              </span>
            </div>
          )}
          <div ref={mapRef} style={{ width: '100%', height: 480 }} />
        </div>

        {/* Selected pin detail panel */}
        {selected && (
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: 6 }}>{selected.category}</span>
                <h3 style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{selected.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="btn-ghost"
                style={{ padding: 4 }}
                aria-label="Close detail panel"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              {selected.address}
            </p>

            {selected.distanceKm !== undefined && (
              <div style={{
                background: 'var(--purple-bg)', borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Route size={16} style={{ color: 'var(--purple)' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                    DISTANCE FROM YOU
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--mono)' }}>
                    {selected.distanceKm} km
                  </div>
                </div>
              </div>
            )}

            <a
              href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=17/${selected.lat}/${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lime"
              style={{ fontSize: 12, padding: '8px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ExternalLink size={13} aria-hidden="true" /> View on OpenStreetMap
            </a>

            <a
              href={`${GMAPS_DIRECTIONS_BASE}?api=1&destination=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ fontSize: 12, padding: '8px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Navigation size={13} aria-hidden="true" /> Get Directions (Google Maps)
            </a>
          </div>
        )}
      </div>

      {/* Results list */}
      {pins.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--mono)', marginBottom: 12 }}>
            📍 {pins.length} PLACES FOUND
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setSelected(pin)}
                className="card"
                style={{
                  padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                  border: selected?.id === pin.id ? '2.5px solid var(--purple)' : 'var(--border)',
                  background: selected?.id === pin.id ? 'var(--purple-bg)' : 'var(--white)',
                  transition: 'all 0.15s',
                }}
                aria-pressed={selected?.id === pin.id}
              >
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{pin.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  {pin.address.split(',').slice(0, 3).join(', ')}
                </div>
                {pin.distanceKm !== undefined && (
                  <span className="badge badge-purple" style={{ fontSize: 10 }}>
                    {pin.distanceKm} km
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
