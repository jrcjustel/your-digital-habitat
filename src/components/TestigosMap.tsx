import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const propertyIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#3FB8EA;border:3px solid #033651;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4)">
    <div style="background:white;border-radius:50%;width:8px;height:8px"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const testigoVentaIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#22C55E;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const testigoAlquilerIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#F59E0B;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface Testigo {
  direccion: string;
  descripcion: string;
  distancia_km: number;
  precio?: number;
  precio_m2?: number;
  precio_mensual?: number;
  superficie: number;
  dem: number;
  diferencias: string;
}

interface TestigosMapProps {
  address: string;
  municipio: string;
  provincia: string;
  testigosVenta?: Testigo[];
  testigosAlquiler?: Testigo[];
}

/** Generate pseudo-random but deterministic positions around a center */
const generateTestigoPositions = (
  center: [number, number],
  testigos: Testigo[],
  seed: number
): [number, number][] => {
  return testigos.map((t, i) => {
    // Use a simple hash based on index + seed for deterministic angles
    const angle = ((i + seed) * 137.508) % 360; // golden angle distribution
    const radians = (angle * Math.PI) / 180;
    // 1 km ≈ 0.009 degrees latitude, ~0.011 longitude (at Spain's latitude ~40°)
    const distDeg = t.distancia_km * 0.009;
    const lat = center[0] + distDeg * Math.cos(radians);
    const lng = center[1] + distDeg * Math.sin(radians) * 1.3; // adjust for longitude scale
    return [lat, lng] as [number, number];
  });
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const TestigosMap = ({ address, municipio, provincia, testigosVenta = [], testigosAlquiler = [] }: TestigosMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState(false);

  // Geocode the property address using Nominatim
  useEffect(() => {
    const geocode = async () => {
      try {
        const query = `${address}, ${municipio}, ${provincia}, España`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=es`
        );
        const data = await res.json();
        if (data.length > 0) {
          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // Fallback: try just municipio + provincia
          const res2 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${municipio}, ${provincia}, España`)}&limit=1&countrycodes=es`
          );
          const data2 = await res2.json();
          if (data2.length > 0) {
            setCenter([parseFloat(data2[0].lat), parseFloat(data2[0].lng)]);
          } else {
            setGeoError(true);
          }
        }
      } catch {
        setGeoError(true);
      }
    };
    geocode();
  }, [address, municipio, provincia]);

  useEffect(() => {
    if (!containerRef.current || !center || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    mapRef.current = map;

    // Property marker
    L.marker(center, { icon: propertyIcon })
      .addTo(map)
      .bindPopup(`<b style="color:#033651">📍 Inmueble analizado</b><br/><span style="font-size:12px">${address}</span>`)
      .openPopup();

    // Testigos de venta
    const ventaPositions = generateTestigoPositions(center, testigosVenta, 0);
    const allPoints: [number, number][] = [center];

    testigosVenta.forEach((t, i) => {
      const pos = ventaPositions[i];
      allPoints.push(pos);
      L.marker(pos, { icon: testigoVentaIcon })
        .addTo(map)
        .bindPopup(`
          <div style="max-width:200px">
            <p style="font-weight:600;font-size:12px;margin:0 0 4px;color:#16A34A">🟢 Testigo venta ${i + 1}</p>
            <p style="font-size:11px;margin:0 0 2px">${t.direccion}</p>
            <p style="font-size:11px;color:#666;margin:0 0 2px">${t.descripcion}</p>
            <p style="font-weight:700;font-size:12px;margin:4px 0 0">${fmt(t.precio || 0)} · ${fmt(t.precio_m2 || 0)}/m²</p>
            <p style="font-size:10px;color:#888;margin:2px 0 0">${t.superficie}m² · ${t.dem}d mercado · ${t.distancia_km}km</p>
          </div>
        `);
    });

    // Testigos de alquiler
    const alquilerPositions = generateTestigoPositions(center, testigosAlquiler, 50);
    testigosAlquiler.forEach((t, i) => {
      const pos = alquilerPositions[i];
      allPoints.push(pos);
      L.marker(pos, { icon: testigoAlquilerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="max-width:200px">
            <p style="font-weight:600;font-size:12px;margin:0 0 4px;color:#D97706">🟡 Testigo alquiler ${i + 1}</p>
            <p style="font-size:11px;margin:0 0 2px">${t.direccion}</p>
            <p style="font-size:11px;color:#666;margin:0 0 2px">${t.descripcion}</p>
            <p style="font-weight:700;font-size:12px;margin:4px 0 0">${fmt(t.precio_mensual || 0)}/mes</p>
            <p style="font-size:10px;color:#888;margin:2px 0 0">${t.superficie}m² · ${t.dem}d mercado · ${t.distancia_km}km</p>
          </div>
        `);
    });

    // Fit bounds to all points
    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, testigosVenta, testigosAlquiler, address]);

  if (geoError) return null;
  if (!center) {
    return (
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full h-72 rounded-lg border" />
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#3FB8EA] border-2 border-[#033651]" /> Inmueble
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#22C55E] border border-white" /> Testigo venta
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-[#F59E0B] border border-white" /> Testigo alquiler
        </span>
      </div>
    </div>
  );
};

export default TestigosMap;
