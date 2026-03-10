import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@/data/property-types";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface PropertyMapProps {
  properties: Property[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const PropertyMap = ({ properties, selectedId, onSelect }: PropertyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = properties.length > 0
      ? [
          properties.reduce((s, p) => s + p.lat, 0) / properties.length,
          properties.reduce((s, p) => s + p.lng, 0) / properties.length,
        ]
      : [37.3, -5.9];

    const map = L.map(containerRef.current).setView(center, 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const formatPrice = (p: Property) =>
      p.operation === "alquiler"
        ? `${p.price.toLocaleString("es-ES")} €/mes`
        : `${p.price.toLocaleString("es-ES")} €`;

    properties.forEach((property) => {
      const marker = L.marker([property.lat, property.lng]).addTo(map);
      marker.bindPopup(`
        <a href="/npl/${property.id}" style="text-decoration:none;color:inherit;display:block;max-width:220px">
          <img src="${property.images[0]}" alt="${property.title}" style="width:100%;height:96px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>
          <p style="font-weight:600;font-size:13px;margin:0 0 4px">${property.title}</p>
          <p style="font-size:11px;color:#888;margin:0 0 4px">${property.location} · ${property.area} m²${property.bedrooms ? ` · ${property.bedrooms} hab.` : ""}</p>
          <p style="font-weight:700;font-size:13px;margin:0">${formatPrice(property)}</p>
        </a>
      `);
      marker.on("click", () => onSelect?.(property.id));
    });

    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [properties, onSelect]);

  return <div ref={containerRef} className="w-full h-full rounded-2xl" style={{ minHeight: 400 }} />;
};

export default PropertyMap;
