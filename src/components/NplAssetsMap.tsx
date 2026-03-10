import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface NplAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  precio_orientativo: number;
  valor_mercado: number;
  sqm: number;
  cesion_remate: boolean;
}

interface NplAssetsMapProps {
  assets: NplAsset[];
  onSelect?: (id: string) => void;
}

// Simple geocode cache to avoid repeated API calls
const geocodeCache = new Map<string, [number, number] | null>();

async function geocode(query: string): Promise<[number, number] | null> {
  if (geocodeCache.has(query)) return geocodeCache.get(query)!;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=es&limit=1&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (data?.[0]) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache.set(query, coords);
      return coords;
    }
  } catch { /* ignore */ }
  geocodeCache.set(query, null);
  return null;
}

const NplAssetsMap = ({ assets, onSelect }: NplAssetsMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([40.0, -3.7], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const placeMarkers = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const bounds: [number, number][] = [];

    // Geocode in small batches to respect Nominatim rate limits
    for (let i = 0; i < Math.min(assets.length, 100); i++) {
      const a = assets[i];
      const query = [a.municipio, a.provincia].filter(Boolean).join(", ") + ", España";
      const coords = await geocode(query);
      if (!coords || isNaN(coords[0]) || isNaN(coords[1])) continue;

      const dto = a.valor_mercado > 0 && a.precio_orientativo > 0
        ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
        : null;

      const marker = L.marker(coords).addTo(map);
      marker.bindPopup(`
        <a href="/npl/${a.id}" style="text-decoration:none;color:inherit;display:block;max-width:220px">
          <p style="font-weight:600;font-size:13px;margin:0 0 4px">${a.tipo_activo || "Activo"} – ${a.municipio || ""}</p>
          <p style="font-size:11px;color:#888;margin:0 0 4px">${a.provincia || ""} · ${a.sqm ? a.sqm + " m²" : ""}</p>
          <p style="font-weight:700;font-size:13px;margin:0">${a.precio_orientativo ? a.precio_orientativo.toLocaleString("es-ES") + " €" : "Consultar"}${dto ? ` <span style="color:#22c55e;font-size:11px">(-${dto}%)</span>` : ""}</p>
          ${a.cesion_remate ? '<span style="background:#f59e0b22;color:#f59e0b;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600">CDR</span>' : ""}
        </a>
      `);
      marker.on("click", () => onSelect?.(a.id));
      markersRef.current.push(marker);
      bounds.push(coords);

      // Small delay every 5 requests for Nominatim
      if ((i + 1) % 5 === 0) await new Promise((r) => setTimeout(r, 300));
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 12 });
    }
  }, [assets, onSelect]);

  useEffect(() => { placeMarkers(); }, [placeMarkers]);

  return <div ref={containerRef} className="w-full h-full rounded-2xl" style={{ minHeight: 500 }} />;
};

export default NplAssetsMap;
