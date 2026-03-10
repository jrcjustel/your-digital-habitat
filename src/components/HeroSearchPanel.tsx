import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Euro, X, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Simplified SVG paths for Spain CCAA (approximate shapes for visual map)
const CCAA_PATHS: Record<string, { d: string; label: string; x: number; y: number }> = {
  "Galicia":          { d: "M30,60 L70,55 L75,90 L55,110 L25,105 Z", label: "GAL", x: 45, y: 80 },
  "Asturias":         { d: "M75,55 L130,48 L135,70 L75,78 Z", label: "AST", x: 100, y: 62 },
  "Cantabria":        { d: "M135,48 L175,45 L178,65 L135,70 Z", label: "CAN", x: 155, y: 56 },
  "País Vasco":       { d: "M178,42 L215,38 L218,60 L178,65 Z", label: "PV", x: 196, y: 50 },
  "Navarra":          { d: "M218,38 L260,35 L262,72 L218,60 Z", label: "NAV", x: 238, y: 52 },
  "Aragón":           { d: "M262,35 L310,40 L315,130 L262,125 L262,72 Z", label: "ARA", x: 285, y: 82 },
  "Cataluña":         { d: "M310,40 L370,45 L365,120 L315,130 Z", label: "CAT", x: 340, y: 80 },
  "La Rioja":         { d: "M178,65 L218,60 L220,82 L180,85 Z", label: "RIO", x: 198, y: 72 },
  "Castilla y León":  { d: "M55,110 L75,90 L135,70 L178,65 L180,85 L220,82 L262,72 L262,125 L240,150 L130,155 L60,140 Z", label: "CyL", x: 155, y: 115 },
  "Madrid":           { d: "M155,155 L190,150 L195,180 L158,182 Z", label: "MAD", x: 174, y: 167 },
  "Extremadura":      { d: "M40,165 L130,155 L155,155 L158,182 L150,225 L100,240 L35,225 Z", label: "EXT", x: 95, y: 195 },
  "Castilla-La Mancha": { d: "M155,155 L240,150 L262,125 L315,130 L310,175 L280,210 L235,225 L195,220 L150,225 L158,182 L195,180 L190,150 Z", label: "CLM", x: 230, y: 180 },
  "C. Valenciana":    { d: "M310,175 L365,120 L375,170 L355,230 L310,250 L280,210 Z", label: "VAL", x: 335, y: 185 },
  "Murcia":           { d: "M280,210 L310,250 L295,275 L255,265 L235,225 Z", label: "MUR", x: 275, y: 245 },
  "Andalucía":        { d: "M35,225 L100,240 L150,225 L195,220 L235,225 L255,265 L240,300 L195,320 L130,315 L60,295 L25,265 Z", label: "AND", x: 145, y: 275 },
  "Illes Balears":    { d: "M380,150 L420,145 L425,170 L385,175 Z", label: "BAL", x: 400, y: 160 },
  "Canarias":         { d: "M30,340 L110,335 L115,365 L35,370 Z", label: "CAN", x: 65, y: 352 },
};

const ROUTE_TABS = [
  { key: "todos", label: "Todos", path: "/npl" },
  { key: "npl", label: "NPL", path: "/npl" },
  { key: "cdr", label: "Cesión Remate", path: "/inversores/cdr" },
  { key: "ocupados", label: "Ocupados", path: "/inversores/ocupados" },
  { key: "subastas", label: "Subastas BOE", path: "/subastas" },
];

const HeroSearchPanel = () => {
  const navigate = useNavigate();
  const [selectedCCAA, setSelectedCCAA] = useState<string>("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [hoveredCCAA, setHoveredCCAA] = useState<string>("");

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

  return (
    <form
      onSubmit={handleSearch}
      className="bg-primary-foreground/8 backdrop-blur-lg border border-primary-foreground/12 rounded-2xl p-5 shadow-2xl"
    >
      {/* Route tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
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

      {/* SVG Map of Spain */}
      <div className="mb-4">
        <label className="text-primary-foreground/50 text-[10px] font-semibold uppercase tracking-wider mb-2 block">
          <MapPin className="w-3 h-3 inline mr-1" />
          Selecciona zona en el mapa
        </label>
        <div className="relative bg-primary-foreground/5 rounded-xl border border-primary-foreground/8 p-2">
          <svg viewBox="0 0 450 385" className="w-full h-auto" style={{ maxHeight: 200 }}>
            {Object.entries(CCAA_PATHS).map(([name, { d, label, x, y }]) => {
              const isSelected = selectedCCAA === name;
              const isHovered = hoveredCCAA === name;
              return (
                <g key={name}>
                  <path
                    d={d}
                    onClick={() => setSelectedCCAA(selectedCCAA === name ? "" : name)}
                    onMouseEnter={() => setHoveredCCAA(name)}
                    onMouseLeave={() => setHoveredCCAA("")}
                    className="cursor-pointer transition-all duration-200"
                    fill={
                      isSelected
                        ? "hsl(var(--accent) / 0.35)"
                        : isHovered
                        ? "hsl(var(--accent) / 0.15)"
                        : "hsl(var(--primary-foreground) / 0.08)"
                    }
                    stroke={
                      isSelected
                        ? "hsl(var(--accent) / 0.8)"
                        : isHovered
                        ? "hsl(var(--accent) / 0.4)"
                        : "hsl(var(--primary-foreground) / 0.15)"
                    }
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none"
                    fill={
                      isSelected
                        ? "hsl(var(--accent))"
                        : "hsl(var(--primary-foreground) / 0.4)"
                    }
                    fontSize={name === "Castilla y León" || name === "Castilla-La Mancha" || name === "Andalucía" ? 10 : 9}
                    fontWeight={isSelected ? 700 : 500}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover/selected tooltip */}
          {(hoveredCCAA || selectedCCAA) && (
            <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-primary-foreground/10">
              {hoveredCCAA || selectedCCAA}
            </div>
          )}
        </div>
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
