import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, MapPin, Maximize, TrendingDown, ChevronDown, ChevronUp,
  LayoutGrid, List, X, Heart, Sparkles, Loader2, Building2, Euro, Map,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
const AssetMapView = lazy(() => import("@/components/AssetMapView"));
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import OpportunityTypeBadge, { resolveOpportunityType } from "@/components/intelligence/OpportunityTypeBadge";
import ComplexityMeter from "@/components/intelligence/ComplexityMeter";
import ListingScorePreview from "@/components/intelligence/ListingScorePreview";
import ExitStrategyChips from "@/components/intelligence/ExitStrategyChips";

/* ─── Types ─── */
interface NplAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  sqm: number | null;
  precio_orientativo: number | null;
  valor_mercado: number | null;
  referencia_fencia: string | null;
  cesion_remate: boolean | null;
  cesion_credito: boolean | null;
  postura_subasta: boolean | null;
  propiedad_sin_posesion: boolean | null;
  estado_judicial: string | null;
  estado_ocupacional: string | null;
  created_at: string;
  cartera: string | null;
}

type ViewMode = "grid" | "list" | "map";

export interface UnifiedAssetListingProps {
  initialSearch?: string;
  initialSaleType?: string;
  initialProvince?: string;
  initialType?: string;
  initialView?: ViewMode;
  /** Pre-apply a sale type filter (for investor pages) */
  defaultSaleType?: string;
  hideSaleTypeFilter?: boolean;
}

/* ─── Constants ─── */
const PAGE_SIZE = 24;

const saleTypeMap: Record<string, string> = {
  npl: "NPL",
  "cesion-remate": "Cesión remate",
  ocupado: "Ocupado",
  subasta: "Subasta",
  compraventa: "Compraventa",
};

const typeLabels: Record<string, string> = {
  Piso: "Piso", Vivienda: "Vivienda", Casa: "Casa",
  Local: "Local", "Local comercial": "Local comercial",
  Oficina: "Oficina", Terreno: "Terreno", "Solar": "Solar",
  Nave: "Nave", "Nave industrial": "Nave industrial",
  Edificio: "Edificio", Garaje: "Garaje", Trastero: "Trastero",
  "Obra parada": "Obra parada",
};

/* ─── Helpers ─── */
function resolveSaleType(a: NplAsset): string {
  if (a.cesion_remate) return "cesion-remate";
  if (a.cesion_credito) return "npl";
  if (a.propiedad_sin_posesion) return "ocupado";
  if (a.postura_subasta) return "subasta";
  return "compraventa";
}

function saleTypeLabel(st: string) {
  return saleTypeMap[st] || st;
}

function saleTypeBgClass(st: string) {
  switch (st) {
    case "npl": return "bg-amber-500/90 text-white";
    case "cesion-remate": return "bg-emerald-500/90 text-white";
    case "ocupado": return "bg-rose-500/90 text-white";
    case "subasta": return "bg-violet-500/90 text-white";
    default: return "bg-accent text-accent-foreground";
  }
}

/* ─── Filter section ─── */
const FilterSection = ({ title, isOpen, onToggle, children }: {
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="border-b border-border pb-4">
    <button onClick={onToggle} className="flex items-center justify-between w-full py-2 text-sm font-bold text-foreground">
      {title}
      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
    {isOpen && <div className="mt-2 space-y-1.5">{children}</div>}
  </div>
);

const CheckboxFilter = ({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) => (
  <label className="flex items-center gap-2 cursor-pointer group text-sm">
    <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-border text-accent focus:ring-accent" />
    <span className="text-foreground group-hover:text-accent transition-colors">{label}</span>
  </label>
);

/* ─── Main component ─── */
const UnifiedAssetListing = ({
  initialSearch = "",
  initialSaleType = "",
  initialProvince = "",
  initialType = "",
  initialView = "grid",
  defaultSaleType,
  hideSaleTypeFilter = false,
}: UnifiedAssetListingProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [sortBy, setSortBy] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState(initialSearch);
  const [selectedSaleTypes, setSelectedSaleTypes] = useState<string[]>(
    defaultSaleType ? [defaultSaleType] : initialSaleType ? [initialSaleType] : []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialType ? [initialType] : []);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(initialProvince ? [initialProvince] : []);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Data
  const [assets, setAssets] = useState<NplAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  // Filter options (loaded from DB)
  const [ccaaList, setCcaaList] = useState<string[]>([]);
  const [provinciaList, setProvinciaList] = useState<string[]>([]);
  const [tipoList, setTipoList] = useState<string[]>([]);

  // Section open states
  const [openSections, setOpenSections] = useState({
    reference: true, price: true, saleType: !defaultSaleType, community: true,
    province: true, propertyType: true,
  });

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleArrayFilter = (arr: string[], value: string, setter: (v: string[]) => void) =>
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchInput = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("npl_assets")
        .select("municipio, direccion, provincia")
        .or(`municipio.ilike.%${value}%,direccion.ilike.%${value}%,provincia.ilike.%${value}%`)
        .limit(20);
      if (data) {
        const matches = new Set<string>();
        data.forEach((d: any) => {
          [d.municipio, d.direccion, d.provincia].forEach((f: string | null) => {
            if (f && f.toLowerCase().includes(value.toLowerCase())) matches.add(f);
          });
        });
        const arr = [...matches].slice(0, 6);
        setSuggestions(arr);
        setShowSuggestions(arr.length > 0);
      }
    }, 150);
  }, []);

  /* ─── Load filter options ─── */
  useEffect(() => {
    Promise.all([
      supabase.from("npl_assets").select("comunidad_autonoma").then(({ data }) =>
        data ? [...new Set(data.map((d: any) => d.comunidad_autonoma).filter(Boolean))].sort() as string[] : []
      ),
      supabase.from("npl_assets").select("provincia").then(({ data }) =>
        data ? [...new Set(data.map((d: any) => d.provincia).filter(Boolean))].sort() as string[] : []
      ),
      supabase.from("npl_assets").select("tipo_activo").then(({ data }) =>
        data ? [...new Set(data.map((d: any) => d.tipo_activo).filter(Boolean))].sort() as string[] : []
      ),
    ]).then(([ccaa, prov, tipos]) => {
      setCcaaList(ccaa);
      setProvinciaList(prov);
      setTipoList(tipos);
    });
  }, []);

  /* ─── Load assets ─── */
  useEffect(() => {
    loadAssets();
  }, [page, search, selectedSaleTypes, selectedTypes, selectedCommunities, selectedProvinces, priceMin, priceMax, sortBy]);

  const loadAssets = async () => {
    setLoading(true);
    let query = supabase
      .from("npl_assets")
      .select("id, municipio, provincia, comunidad_autonoma, tipo_activo, direccion, sqm, precio_orientativo, valor_mercado, referencia_fencia, cesion_remate, cesion_credito, postura_subasta, propiedad_sin_posesion, estado_judicial, estado_ocupacional, created_at, cartera", { count: "exact" });

    // Search
    if (search) {
      query = query.or(`municipio.ilike.%${search}%,direccion.ilike.%${search}%,provincia.ilike.%${search}%,referencia_fencia.ilike.%${search}%`);
    }

    // Sale type filters
    const effectiveSaleTypes = selectedSaleTypes.length > 0 ? selectedSaleTypes : [];
    if (effectiveSaleTypes.length === 1) {
      const st = effectiveSaleTypes[0];
      if (st === "npl") query = query.eq("cesion_credito", true);
      else if (st === "cesion-remate") query = query.eq("cesion_remate", true);
      else if (st === "ocupado") query = query.eq("propiedad_sin_posesion", true);
      else if (st === "subasta") query = query.eq("postura_subasta", true);
    } else if (effectiveSaleTypes.length > 1) {
      const orParts: string[] = [];
      effectiveSaleTypes.forEach((st) => {
        if (st === "npl") orParts.push("cesion_credito.eq.true");
        else if (st === "cesion-remate") orParts.push("cesion_remate.eq.true");
        else if (st === "ocupado") orParts.push("propiedad_sin_posesion.eq.true");
        else if (st === "subasta") orParts.push("postura_subasta.eq.true");
      });
      if (orParts.length > 0) query = query.or(orParts.join(","));
    }

    // Other filters
    if (selectedCommunities.length === 1) query = query.eq("comunidad_autonoma", selectedCommunities[0]);
    else if (selectedCommunities.length > 1) query = query.in("comunidad_autonoma", selectedCommunities);

    if (selectedProvinces.length === 1) query = query.eq("provincia", selectedProvinces[0]);
    else if (selectedProvinces.length > 1) query = query.in("provincia", selectedProvinces);

    if (selectedTypes.length === 1) query = query.eq("tipo_activo", selectedTypes[0]);
    else if (selectedTypes.length > 1) query = query.in("tipo_activo", selectedTypes);

    if (priceMin) query = query.gte("precio_orientativo", Number(priceMin));
    if (priceMax) query = query.lte("precio_orientativo", Number(priceMax));

    // Sorting
    switch (sortBy) {
      case "price-asc": query = query.order("precio_orientativo", { ascending: true }); break;
      case "price-desc": query = query.order("precio_orientativo", { ascending: false }); break;
      case "area": query = query.order("sqm", { ascending: false }); break;
      case "province": query = query.order("provincia").order("municipio"); break;
      case "type": query = query.order("tipo_activo").order("municipio"); break;
      case "recent":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    const loaded = (data as unknown as NplAsset[]) || [];
    setAssets(loaded);
    setTotal(count || 0);
    setLoading(false);

    // Load cover images for displayed assets
    if (loaded.length > 0) {
      const ids = loaded.map((a) => a.id);
      const { data: images } = await supabase
        .from("asset_images")
        .select("asset_id, file_path")
        .in("asset_id", ids)
        .eq("is_cover", true);
      if (images && images.length > 0) {
        const imgMap: Record<string, string> = {};
        images.forEach((img: any) => {
          const { data: urlData } = supabase.storage.from("asset-images").getPublicUrl(img.file_path);
          imgMap[img.asset_id] = urlData.publicUrl;
        });
        setCoverImages((prev) => ({ ...prev, ...imgMap }));
      }
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setSelectedSaleTypes(defaultSaleType ? [defaultSaleType] : []);
    setSelectedTypes([]);
    setSelectedCommunities([]);
    setSelectedProvinces([]);
    setPriceMin("");
    setPriceMax("");
    setPage(1);
  };

  const activeFilterCount =
    (defaultSaleType ? selectedSaleTypes.filter((s) => s !== defaultSaleType).length : selectedSaleTypes.length) +
    selectedTypes.length + selectedCommunities.length + selectedProvinces.length +
    (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (search ? 1 : 0);

  /* ─── Active filter chips ─── */
  const ActiveFilterChips = () => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (search) chips.push({ label: `"${search}"`, onRemove: () => setSearch("") });
    selectedSaleTypes.forEach((st) => {
      if (st === defaultSaleType) return; // Don't show chip for default pre-applied filter
      chips.push({ label: saleTypeLabel(st), onRemove: () => setSelectedSaleTypes((prev) => prev.filter((v) => v !== st)) });
    });
    selectedTypes.forEach((t) => chips.push({ label: t, onRemove: () => setSelectedTypes((prev) => prev.filter((v) => v !== t)) }));
    selectedCommunities.forEach((c) => chips.push({ label: c, onRemove: () => setSelectedCommunities((prev) => prev.filter((v) => v !== c)) }));
    selectedProvinces.forEach((p) => chips.push({ label: p, onRemove: () => setSelectedProvinces((prev) => prev.filter((v) => v !== p)) }));
    if (priceMin) chips.push({ label: `Desde ${Number(priceMin).toLocaleString("es-ES")} €`, onRemove: () => setPriceMin("") });
    if (priceMax) chips.push({ label: `Hasta ${Number(priceMax).toLocaleString("es-ES")} €`, onRemove: () => setPriceMax("") });
    if (chips.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-border">
        {chips.map((chip, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-accent/15 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
            {chip.label}
            <button onClick={chip.onRemove} className="hover:text-accent-foreground transition-colors"><X className="w-3 h-3" /></button>
          </span>
        ))}
        <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline ml-1">Limpiar</button>
      </div>
    );
  };

  /* ─── Sidebar filters ─── */
  const SidebarFilters = () => (
    <div className="space-y-4">
      <ActiveFilterChips />

      {/* Search with autocomplete */}
      <FilterSection title="🔍 Referencia" isOpen={openSections.reference} onToggle={() => toggleSection("reference")}>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar referencia, ubicación..."
            value={search}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSuggestions(false);
              if (e.key === "Enter") { setShowSuggestions(false); setPage(1); }
            }}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent pr-8"
          />
          {search && (
            <button onClick={() => { setSearch(""); setSuggestions([]); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i} type="button"
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 border-b border-border last:border-0"
                  onMouseDown={() => { setSearch(s); setShowSuggestions(false); setPage(1); }}
                >
                  <Search className="w-3 h-3 text-accent shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="€ Precio orientativo" isOpen={openSections.price} onToggle={() => toggleSection("price")}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <input type="number" placeholder="Máx" value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </FilterSection>

      {/* Sale type */}
      {!hideSaleTypeFilter && (
        <FilterSection title="📑 Tipo de inversión" isOpen={openSections.saleType} onToggle={() => toggleSection("saleType")}>
          {(["compraventa", "npl", "cesion-remate", "ocupado", "subasta"] as const).map((st) => (
            <CheckboxFilter
              key={st}
              label={saleTypeLabel(st)}
              checked={selectedSaleTypes.includes(st)}
              onChange={() => { toggleArrayFilter(selectedSaleTypes, st, setSelectedSaleTypes); setPage(1); }}
            />
          ))}
        </FilterSection>
      )}

      {/* Community */}
      <FilterSection title="📍 Comunidad autónoma" isOpen={openSections.community} onToggle={() => toggleSection("community")}>
        {ccaaList.map((c) => (
          <CheckboxFilter
            key={c} label={c}
            checked={selectedCommunities.includes(c)}
            onChange={() => { toggleArrayFilter(selectedCommunities, c, setSelectedCommunities); setPage(1); }}
          />
        ))}
      </FilterSection>

      {/* Province */}
      <FilterSection title="📍 Provincia" isOpen={openSections.province} onToggle={() => toggleSection("province")}>
        {provinciaList.map((p) => (
          <CheckboxFilter
            key={p} label={p}
            checked={selectedProvinces.includes(p)}
            onChange={() => { toggleArrayFilter(selectedProvinces, p, setSelectedProvinces); setPage(1); }}
          />
        ))}
      </FilterSection>

      {/* Property type */}
      <FilterSection title="🏠 Tipo de activo" isOpen={openSections.propertyType} onToggle={() => toggleSection("propertyType")}>
        {tipoList.map((t) => (
          <CheckboxFilter
            key={t} label={t}
            checked={selectedTypes.includes(t)}
            onChange={() => { toggleArrayFilter(selectedTypes, t, setSelectedTypes); setPage(1); }}
          />
        ))}
      </FilterSection>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full text-sm text-accent hover:underline py-2">
          Limpiar todos los filtros ({activeFilterCount})
        </button>
      )}
    </div>
  );

  /* ─── Property Card (Grid) ─── */
  const PropertyCard = ({ asset }: { asset: NplAsset }) => {
    const st = resolveSaleType(asset);
    const discount = asset.valor_mercado && asset.precio_orientativo && asset.valor_mercado > 0
      ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100) : 0;
    const imgUrl = coverImages[asset.id] || "/placeholder.svg";
    const oppType = resolveOpportunityType({
      cesionRemate: !!asset.cesion_remate,
      propiedadSinPosesion: !!asset.propiedad_sin_posesion,
      posturaSubasta: !!asset.postura_subasta,
    });

    return (
      <TooltipProvider delayDuration={300}>
        <Link to={`/npl/${asset.id}`} className="group bg-card rounded-2xl overflow-hidden card-elevated transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            <img src={imgUrl} alt={asset.direccion || asset.municipio || "Activo"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {asset.referencia_fencia && (
                <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{asset.referencia_fencia}</span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${saleTypeBgClass(st)}`}>
                {saleTypeLabel(st)}
              </span>
              {asset.tipo_activo && (
                <span className="bg-card/90 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">{asset.tipo_activo}</span>
              )}
            </div>
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <ExitStrategyChips type={oppType} />
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <MapPin className="w-3 h-3" />
                {asset.municipio}{asset.provincia ? `, ${asset.provincia}` : ""}
              </div>
              <Heart className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug text-sm line-clamp-2">
              {asset.direccion || asset.municipio || "Ubicación no disponible"}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              {asset.sqm && asset.sqm > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help"><Maximize className="w-3 h-3" />{asset.sqm.toLocaleString("es-ES")} m²</span>
                  </TooltipTrigger>
                  <TooltipContent><p>Superficie</p></TooltipContent>
                </Tooltip>
              )}
              <ComplexityMeter type={oppType} estadoJudicial={asset.estado_judicial} />
            </div>
            <div className="flex items-end justify-between border-t border-border pt-3">
              <div>
                {asset.valor_mercado && asset.valor_mercado > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground line-through cursor-help">{asset.valor_mercado.toLocaleString("es-ES")} €</p>
                    </TooltipTrigger>
                    <TooltipContent><p>Valor de mercado estimado</p></TooltipContent>
                  </Tooltip>
                )}
                <p className="font-heading text-lg font-bold text-foreground">
                  {asset.precio_orientativo && asset.precio_orientativo > 0
                    ? `${asset.precio_orientativo.toLocaleString("es-ES")} €`
                    : "Consultar"}
                </p>
              </div>
              {discount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-help">
                      <TrendingDown className="w-3 h-3" />{discount}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Descuento sobre valor de mercado</p></TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </Link>
      </TooltipProvider>
    );
  };

  /* ─── Property List Item ─── */
  const PropertyListItem = ({ asset }: { asset: NplAsset }) => {
    const st = resolveSaleType(asset);
    const discount = asset.valor_mercado && asset.precio_orientativo && asset.valor_mercado > 0
      ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100) : 0;
    const imgUrl = coverImages[asset.id] || "/placeholder.svg";
    const oppType = resolveOpportunityType({
      cesionRemate: !!asset.cesion_remate,
      propiedadSinPosesion: !!asset.propiedad_sin_posesion,
      posturaSubasta: !!asset.postura_subasta,
    });

    return (
      <TooltipProvider delayDuration={300}>
        <Link to={`/npl/${asset.id}`} className="group bg-card rounded-2xl overflow-hidden card-elevated flex flex-col sm:flex-row transition-all duration-300 hover:shadow-xl hover:border-accent/30">
          <div className="relative sm:w-72 aspect-[16/10] sm:aspect-auto overflow-hidden flex-shrink-0 bg-secondary">
            <img src={imgUrl} alt={asset.direccion || asset.municipio || "Activo"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {asset.referencia_fencia && (
                <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{asset.referencia_fencia}</span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${saleTypeBgClass(st)}`}>
                {saleTypeLabel(st)}
              </span>
            </div>
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{asset.municipio}{asset.provincia ? `, ${asset.provincia}` : ""}
                  {asset.comunidad_autonoma ? ` · ${asset.comunidad_autonoma}` : ""}
                </span>
                {asset.tipo_activo && (
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{asset.tipo_activo}</span>
                )}
              </div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 text-sm">
                {asset.direccion || asset.municipio || "Ubicación no disponible"}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                {asset.sqm && asset.sqm > 0 && (
                  <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{asset.sqm.toLocaleString("es-ES")} m²</span>
                )}
                <ComplexityMeter type={oppType} estadoJudicial={asset.estado_judicial} />
                <ListingScorePreview price={asset.precio_orientativo || 0} marketValue={asset.valor_mercado || 0} ocupado={!!asset.propiedad_sin_posesion} provincia={asset.provincia} />
              </div>
              <ExitStrategyChips type={oppType} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                {asset.valor_mercado && asset.valor_mercado > 0 && (
                  <p className="text-xs text-muted-foreground line-through">{asset.valor_mercado.toLocaleString("es-ES")} € mercado</p>
                )}
                <p className="font-heading text-lg font-bold text-foreground">
                  {asset.precio_orientativo && asset.precio_orientativo > 0
                    ? `${asset.precio_orientativo.toLocaleString("es-ES")} €`
                    : "Consultar"}
                </p>
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-foreground">{discount}% dto.</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </TooltipProvider>
    );
  };

  /* ─── Pagination ─── */
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          ← Anterior
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => setPage(p)}
            className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${p === page ? "bg-accent text-accent-foreground" : "border border-border bg-card hover:bg-secondary text-foreground"}`}>
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Siguiente →
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{total.toLocaleString("es-ES")}</strong> oportunidades encontradas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Filtros {activeFilterCount > 0 && <span className="bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
            {([
              { mode: "grid" as ViewMode, icon: LayoutGrid },
              { mode: "list" as ViewMode, icon: List },
              { mode: "map" as ViewMode, icon: Map },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2.5 transition-colors ${viewMode === mode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative hidden sm:block">
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="recent">Más recientes</option>
              <option value="price-asc">Precio ↑</option>
              <option value="price-desc">Precio ↓</option>
              <option value="area">Mayor superficie</option>
              <option value="province">Por provincia</option>
              <option value="type">Por tipología</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <SidebarFilters />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card p-5 overflow-y-auto animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Filtros</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
              </div>
              {/* Mobile sort */}
              <div className="mb-4 pb-4 border-b border-border">
                <label className="text-sm font-bold text-foreground mb-2 block">Ordenar por</label>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Precio ↑</option>
                  <option value="price-desc">Precio ↓</option>
                  <option value="area">Mayor superficie</option>
                  <option value="province">Por provincia</option>
                  <option value="type">Por tipología</option>
                </select>
              </div>
              <SidebarFilters />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-4 bg-accent text-accent-foreground font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
              >
                Ver {total.toLocaleString("es-ES")} resultados
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No se encontraron oportunidades</p>
              <button onClick={clearFilters} className="text-sm text-accent hover:underline">Limpiar filtros</button>
            </div>
          ) : viewMode === "map" ? (
            <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
              <AssetMapView assets={assets} coverImages={coverImages} />
            </Suspense>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {assets.map((a) => <PropertyListItem key={a.id} asset={a} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {assets.map((a) => <PropertyCard key={a.id} asset={a} />)}
            </div>
          )}

          <Pagination />

          {/* Page info */}
          {totalPages > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Página {page} de {totalPages} · {total.toLocaleString("es-ES")} resultados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAssetListing;
