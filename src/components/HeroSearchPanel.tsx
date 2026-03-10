import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, MapPin, Euro, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ROUTE_TABS = [
  { key: "todos", label: "Todos", path: "/inmuebles" },
  { key: "npl", label: "NPL", path: "/inmuebles" },
  { key: "cdr", label: "Cesión Remate", path: "/inmuebles" },
  { key: "ocupados", label: "Ocupados", path: "/inmuebles" },
  { key: "subastas", label: "Subastas BOE", path: "/subastas" },
];

const HeroSearchPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [ccaa, setCcaa] = useState("");
  const [tipo, setTipo] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const [ccaas, setCcaas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("npl_assets").select("comunidad_autonoma").eq("publicado", true),
      supabase.from("npl_assets").select("tipo_activo").eq("publicado", true),
    ]).then(([ccaaRes, tipoRes]) => {
      if (ccaaRes.data) setCcaas([...new Set(ccaaRes.data.map((d: any) => d.comunidad_autonoma).filter(Boolean))].sort() as string[]);
      if (tipoRes.data) setTipos([...new Set(tipoRes.data.map((d: any) => d.tipo_activo).filter(Boolean))].sort() as string[]);
    });
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("npl_assets")
        .select("municipio, provincia, direccion")
        .eq("publicado", true)
        .or(`municipio.ilike.%${value}%,direccion.ilike.%${value}%,provincia.ilike.%${value}%`)
        .limit(8);
      if (data) {
        const unique = [...new Set(
          data.flatMap((d: any) => [d.municipio, d.provincia, d.direccion].filter(Boolean))
            .filter((s: string) => s.toLowerCase().includes(value.toLowerCase()))
        )].slice(0, 5);
        setSuggestions(unique as string[]);
        setShowSuggestions(unique.length > 0);
      }
    }, 250);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    const tab = ROUTE_TABS.find((t) => t.key === activeTab) || ROUTE_TABS[0];
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (ccaa) params.set("ccaa", ccaa);
    if (tipo) params.set("tipo", tipo);
    if (precioMax) params.set("precio_max", precioMax);
    const qs = params.toString();
    navigate(`${tab.path}${qs ? `?${qs}` : ""}`);
  };

  const activeFilters = [ccaa, tipo, precioMax, search].filter(Boolean).length;

  return (
    <form
      onSubmit={handleSearch}
      className="bg-primary-foreground/8 backdrop-blur-lg border border-primary-foreground/12 rounded-2xl p-5 shadow-2xl"
    >
      {/* Search input with autocomplete */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar municipio, dirección, referencia..."
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setShowSuggestions(false);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm placeholder:text-primary-foreground/35 focus:outline-none focus:border-accent/50 transition-colors"
        />
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 border-b border-border last:border-0"
                onMouseDown={() => { setSearch(s); setShowSuggestions(false); }}
              >
                <MapPin className="w-3 h-3 text-accent shrink-0" />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter row: Comunidad, Tipología, Precio */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40 pointer-events-none" />
          <select value={ccaa} onChange={(e) => setCcaa(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer">
            <option value="" className="text-foreground">Comunidad</option>
            {ccaas.map((c) => <option key={c} value={c} className="text-foreground">{c}</option>)}
          </select>
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40 pointer-events-none" />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer">
            <option value="" className="text-foreground">Tipología</option>
            {tipos.map((t) => <option key={t} value={t} className="text-foreground">{t}</option>)}
          </select>
        </div>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40 pointer-events-none" />
          <select value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer">
            <option value="" className="text-foreground">Precio máx.</option>
            <option value="50000" className="text-foreground">Hasta 50.000 €</option>
            <option value="100000" className="text-foreground">Hasta 100.000 €</option>
            <option value="200000" className="text-foreground">Hasta 200.000 €</option>
            <option value="500000" className="text-foreground">Hasta 500.000 €</option>
            <option value="1000000" className="text-foreground">Hasta 1M €</option>
          </select>
        </div>
      </div>

      {/* Route tabs — after filters */}
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

      {/* Active filter chips */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ccaa && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {ccaa}
              <button type="button" onClick={() => setCcaa("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {tipo && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <Building2 className="w-3 h-3" /> {tipo}
              <button type="button" onClick={() => setTipo("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {precioMax && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              ≤ {Number(precioMax).toLocaleString("es-ES")} €
              <button type="button" onClick={() => setPrecioMax("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <Search className="w-3 h-3" /> "{search}"
              <button type="button" onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
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
        {activeFilters > 0 && (
          <span className="bg-accent-foreground/20 text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {activeFilters}
          </span>
        )}
      </button>

      <p className="text-center text-primary-foreground/30 text-[11px] mt-2.5 flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3" />
        Datos reales de la base de activos IKESA
      </p>
    </form>
  );
};

export default HeroSearchPanel;
