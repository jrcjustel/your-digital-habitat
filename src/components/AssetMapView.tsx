import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ─── Spanish province centroids ─── */
const PROVINCE_COORDS: Record<string, [number, number]> = {
  "A Coruña": [43.37, -8.40], "Álava": [42.85, -2.67], "Albacete": [38.99, -1.86],
  "Alicante": [38.35, -0.48], "Almería": [36.84, -2.47], "Asturias": [43.36, -5.85],
  "Ávila": [40.66, -4.68], "Badajoz": [38.88, -6.97], "Barcelona": [41.39, 2.17],
  "Bizkaia": [43.26, -2.93], "Burgos": [42.34, -3.70], "Cáceres": [39.47, -6.37],
  "Cádiz": [36.53, -6.29], "Cantabria": [43.18, -3.99], "Castellón": [39.99, -0.04],
  "Ciudad Real": [38.99, -3.93], "Córdoba": [37.88, -4.77], "Cuenca": [40.07, -2.14],
  "Gipuzkoa": [43.31, -2.00], "Girona": [41.98, 2.82], "Granada": [37.18, -3.60],
  "Guadalajara": [40.63, -3.16], "Huelva": [37.26, -6.95], "Huesca": [42.14, -0.41],
  "Illes Balears": [39.57, 2.65], "Jaén": [37.77, -3.79], "La Rioja": [42.29, -2.52],
  "Las Palmas": [28.10, -15.42], "León": [42.60, -5.57], "Lleida": [41.62, 0.63],
  "Lugo": [43.01, -7.56], "Madrid": [40.42, -3.70], "Málaga": [36.72, -4.42],
  "Murcia": [37.98, -1.13], "Navarra": [42.82, -1.64], "Ourense": [42.34, -7.86],
  "Palencia": [42.01, -4.53], "Pontevedra": [42.43, -8.65], "Salamanca": [40.97, -5.66],
  "Santa Cruz de Tenerife": [28.47, -16.25], "Segovia": [40.95, -4.12],
  "Sevilla": [37.39, -5.98], "Soria": [41.76, -2.47], "Tarragona": [41.12, 1.25],
  "Teruel": [40.34, -1.11], "Toledo": [39.86, -4.03], "Valencia": [39.47, -0.38],
  "Valladolid": [41.65, -4.72], "Zamora": [41.50, -5.74], "Zaragoza": [41.65, -0.88],
};

/* Seeded random for consistent jitter per asset */
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
}

interface MapAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  tipo_activo: string | null;
  precio_orientativo: number | null;
  referencia_fencia: string | null;
  sqm: number | null;
  direccion: string | null;
}

interface AssetMapViewProps {
  assets: MapAsset[];
  coverImages?: Record<string, string>;
}

const saleTypeColor: Record<string, string> = {
  npl: "#f59e0b",
  "cesion-remate": "#10b981",
  ocupado: "#ef4444",
  subasta: "#8b5cf6",
  compraventa: "#3b82f6",
};

const AssetMapView = ({ assets, coverImages = {} }: AssetMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Compute geocoded positions
  const positions = useMemo(() => {
    return assets
      .map((a) => {
        const prov = a.provincia?.trim();
        if (!prov) return null;
        const base = PROVINCE_COORDS[prov];
        if (!base) return null;
        // Add jitter so assets in the same province don't stack
        const rng = seededRandom(a.id);
        const lat = base[0] + (rng() - 0.5) * 0.15;
        const lng = base[1] + (rng() - 0.5) * 0.15;
        return { asset: a, lat, lng };
      })
      .filter(Boolean) as { asset: MapAsset; lat: number; lng: number }[];
  }, [assets]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([39.5, -3.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    const fmt = (n: number) => n.toLocaleString("es-ES") + " €";

    positions.forEach(({ asset, lat, lng }) => {
      const imgSrc = coverImages[asset.id];
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px"/>`
        : "";

      const marker = L.marker([lat, lng]);
      marker.bindPopup(`
        <a href="/npl/${asset.id}" style="text-decoration:none;color:inherit;display:block;max-width:220px">
          ${imgHtml}
          <p style="font-weight:600;font-size:13px;margin:0 0 4px">${asset.tipo_activo || "Activo"} en ${asset.municipio || asset.provincia || "—"}</p>
          <p style="font-size:11px;color:#888;margin:0 0 4px">${asset.direccion || ""} · ${asset.sqm ? asset.sqm + " m²" : ""}</p>
          ${asset.precio_orientativo ? `<p style="font-weight:700;font-size:13px;margin:0;color:#16a34a">${fmt(asset.precio_orientativo)}</p>` : ""}
          ${asset.referencia_fencia ? `<p style="font-size:10px;color:#aaa;margin:4px 0 0">Ref: ${asset.referencia_fencia}</p>` : ""}
        </a>
      `);
      markers.addLayer(marker);
    });

    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [positions, coverImages]);

  return (
    <div ref={containerRef} className="w-full rounded-2xl border border-border" style={{ height: 600 }} />
  );
};

export default AssetMapView;
