import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Euro, X, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ROUTE_TABS = [
  { key: "todos", label: "Todos", path: "/npl" },
  { key: "npl", label: "NPL", path: "/npl" },
  { key: "cdr", label: "Cesión Remate", path: "/inversores/cdr" },
  { key: "ocupados", label: "Ocupados", path: "/inversores/ocupados" },
  { key: "subastas", label: "Subastas BOE", path: "/subastas" },
];

const CCAA_CENTERS: Record<string, [number, number]> = {
  "Andalucía": [37.5, -4.5],
  "Aragón": [41.5, -0.9],
  "Asturias": [43.3, -5.8],
  "Illes Balears": [39.6, 2.9],
  "Canarias": [28.1, -15.4],
  "Cantabria": [43.2, -3.8],
  "Castilla-La Mancha": [39.3, -2.7],
  "Castilla y León": [41.6, -4.0],
  "Cataluña": [41.8, 1.5],
  "C. Valenciana": [39.5, -0.5],
  "Extremadura": [39.0, -6.1],
  "Galicia": [42.7, -7.9],
  "Madrid": [40.4, -3.7],
  "Murcia": [37.9, -1.1],
  "Navarra": [42.7, -1.6],
  "País Vasco": [43.0, -2.6],
  "La Rioja": [42.3, -2.5],
};

const HeroSearchPanel = () => {
  const navigate = useNavigate();
  const [selectedCCAA, setSelectedCCAA] = useState<string>("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const tab = ROUTE_TABS.find((t) => t.key === activeTab) || ROUTE_TABS[0];
    const params = new URLSearchParams();
    if (selectedCCAA) params.set("ccaa", selectedCCAA);
    if (tipoActivo) params.set("tipo", tipoActivo);
    if (precioMax) params.set("precio_max", precioMax);
    const qs = params.toString();
    navigate(`${tab.path}${qs ? `?${qs}` : ""}`);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [40.0, -3.5],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 8,
      minZoom: 4,
    }).addTo(map);

    // Add CCAA markers
    const icon = L.divIcon({
      className: "ccaa-marker",
      html: `<div style="width:12px;height:12px;background:hsl(var(--accent));border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const markers: L.Marker[] = [];
    Object.entries(CCAA_CENTERS).forEach(([name, coords]) => {
      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindTooltip(name, {
          permanent: false,
          direction: "top",
          className: "ccaa-tooltip",
          offset: [0, -8],
        });

      marker.on("click", () => {
        setSelectedCCAA((prev) => (prev === name ? "" : name));
      });

      markers.push(marker);
    });

    markersRef.current = markers;
    mapInstanceRef.current = map;

    // Fix map size after render
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Highlight selected marker
  useEffect(() => {
    const selectedIcon = L.divIcon({
      className: "ccaa-marker-selected",
      html: `<div style="width:16px;height:16px;background:hsl(var(--accent));border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px hsl(var(--accent) / 0.4), 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    const defaultIcon = L.divIcon({
      className: "ccaa-marker",
      html: `<div style="width:12px;height:12px;background:hsl(var(--accent));border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const names = Object.keys(CCAA_CENTERS);
    markersRef.current.forEach((marker, i) => {
      marker.setIcon(names[i] === selectedCCAA ? selectedIcon : defaultIcon);
    });

    if (selectedCCAA && CCAA_CENTERS[selectedCCAA] && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CCAA_CENTERS[selectedCCAA], 7, { duration: 0.5 });
    } else if (!selectedCCAA && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([40.0, -3.5], 5, { duration: 0.5 });
    }
  }, [selectedCCAA]);

  return (
    <form
      onSubmit={handleSearch}
      className="bg-primary-foreground/8 backdrop-blur-lg border border-primary-foreground/12 rounded-2xl p-4 shadow-2xl"
    >
      {/* Route tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {ROUTE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === tab.key
                ? "bg-accent/20 border-accent/50 text-accent"
                : "bg-primary-foreground/5 border-primary-foreground/8 text-primary-foreground/50 hover:text-primary-foreground/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaflet Map */}
      <div className="mb-3">
        <div
          ref={mapRef}
          className="w-full rounded-xl overflow-hidden border border-primary-foreground/10"
          style={{ height: 220 }}
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
          <select
            value={tipoActivo}
            onChange={(e) => setTipoActivo(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
          >
            <option value="" className="text-foreground">Tipología</option>
            <option value="vivienda" className="text-foreground">Vivienda</option>
            <option value="local" className="text-foreground">Local comercial</option>
            <option value="oficina" className="text-foreground">Oficina</option>
            <option value="terreno" className="text-foreground">Terreno</option>
            <option value="garaje" className="text-foreground">Garaje</option>
            <option value="nave" className="text-foreground">Nave industrial</option>
          </select>
        </div>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
          <select
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
          >
            <option value="" className="text-foreground">Precio máximo</option>
            <option value="50000" className="text-foreground">Hasta 50.000 €</option>
            <option value="100000" className="text-foreground">Hasta 100.000 €</option>
            <option value="200000" className="text-foreground">Hasta 200.000 €</option>
            <option value="500000" className="text-foreground">Hasta 500.000 €</option>
            <option value="1000000" className="text-foreground">Hasta 1M €</option>
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(selectedCCAA || tipoActivo || precioMax) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selectedCCAA && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {selectedCCAA}
              <button type="button" onClick={() => setSelectedCCAA("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {tipoActivo && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {tipoActivo}
              <button type="button" onClick={() => setTipoActivo("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {precioMax && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              ≤ {Number(precioMax).toLocaleString("es-ES")} €
              <button type="button" onClick={() => setPrecioMax("")}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Search button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/25 text-sm"
      >
        <Search className="w-4 h-4" />
        Buscar oportunidades
      </button>
    </form>
  );
};

export default HeroSearchPanel;
