import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Maximize, Bed, Euro } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "@/data/properties";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FitBounds = ({ properties }: { properties: Property[] }) => {
  const map = useMap();
  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [properties, map]);
  return null;
};

interface PropertyMapProps {
  properties: Property[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const PropertyMap = ({ properties, selectedId, onSelect }: PropertyMapProps) => {
  const center: [number, number] = properties.length > 0
    ? [properties.reduce((s, p) => s + p.lat, 0) / properties.length, properties.reduce((s, p) => s + p.lng, 0) / properties.length]
    : [37.3, -5.9];

  const formatPrice = (p: Property) =>
    p.operation === "alquiler" ? `${p.price.toLocaleString("es-ES")} €/mes` : `${p.price.toLocaleString("es-ES")} €`;

  return (
    <MapContainer center={center} zoom={8} className="w-full h-full rounded-2xl" style={{ minHeight: 400 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={properties} />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          eventHandlers={{ click: () => onSelect?.(property.id) }}
        >
          <Popup>
            <Link to={`/inmueble/${property.id}`} className="block no-underline text-foreground">
              <img src={property.images[0]} alt={property.title} className="w-full h-24 object-cover rounded-lg mb-2" />
              <p className="font-semibold text-sm leading-tight mb-1">{property.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{property.location}</span>
                <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />{property.area} m²</span>
                {property.bedrooms && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
              </div>
              <p className="font-bold text-sm text-accent">{formatPrice(property)}</p>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default PropertyMap;
