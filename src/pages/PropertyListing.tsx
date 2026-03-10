import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Bed, Bath, Maximize, TrendingUp, ChevronDown, ChevronUp, LayoutGrid, List, Map as MapIcon, X, Heart, Clock, Sparkles, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";
import PropertyMap from "@/components/PropertyMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  properties,
  propertyTypes,
  provinces,
  communities,
  saleTypes,
  occupancyLabels,
  type PropertyType,
  type OperationType,
  type SaleType,
  type OccupancyStatus,
} from "@/data/properties";

type ViewMode = "grid" | "list" | "map";

/* ─── Recency helper ─── */
const daysAgo = (dateStr?: string) => {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
};
const isRecent = (p: typeof properties[0]) => p.isNew || daysAgo(p.publishedAt) <= 7;

/* ─── Label maps ─── */
const saleTypeLabels: Record<string, string> = {
  compraventa: "Compraventa", npl: "NPL", "cesion-remate": "Cesión remate", ocupado: "Ocupado",
};
const typeLabels: Record<string, string> = {
  vivienda: "Vivienda", local: "Local", oficina: "Oficina", terreno: "Terreno",
  nave: "Nave", edificio: "Edificio", "obra-parada": "Obra parada",
};

/* ─── Reusable filter components ─── */
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

const CheckboxFilter = ({ label, count, checked, onChange }: {
  label: string; count: number; checked: boolean; onChange: () => void;
}) => (
  <label className="flex items-center justify-between cursor-pointer group text-sm">
    <span className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-border text-accent focus:ring-accent" />
      <span className="text-foreground group-hover:text-accent transition-colors">{label}</span>
    </span>
    <span className="text-xs text-muted-foreground">({count})</span>
  </label>
);

/* ─── Main component ─── */
const PropertyListing = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [referenceSearch, setReferenceSearch] = useState(searchParams.get("q") || "");
  const [selectedSaleTypes, setSelectedSaleTypes] = useState<SaleType[]>(
    searchParams.get("saleType") ? [searchParams.get("saleType") as SaleType] : []
  );
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
    searchParams.get("type") ? [searchParams.get("type") as PropertyType] : []
  );
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(
    searchParams.get("province") ? [searchParams.get("province")!] : []
  );
  const [selectedOccupancy, setSelectedOccupancy] = useState<OccupancyStatus[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<OperationType | "">(
    (searchParams.get("operation") || "") as OperationType | ""
  );
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Section open states
  const [openSections, setOpenSections] = useState({
    reference: true, price: true, saleType: true, community: true,
    province: true, propertyType: true, occupancy: true, operation: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFilter = <T extends string>(arr: T[], value: T, setter: (v: T[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  /* ─── Autocomplete logic ─── */
  const handleSearchInput = useCallback((value: string) => {
    setReferenceSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase();
      const matches = new Set<string>();
      properties.forEach((p) => {
        const fields = [p.title, p.location, p.province, p.municipality, p.reference, p.community];
        fields.forEach((f) => {
          if (f && f.toLowerCase().includes(q)) matches.add(f);
        });
      });
      const arr = [...matches].slice(0, 6);
      setSuggestions(arr);
      setShowSuggestions(arr.length > 0);
    }, 150);
  }, []);

  // Counts for filters
  const getCounts = (key: string, values: string[]) => {
    const counts: Record<string, number> = {};
    values.forEach((v) => { counts[v] = properties.filter((p) => (p as any)[key] === v).length; });
    return counts;
  };

  const typeCounts = getCounts("type", propertyTypes.map((t) => t.value));
  const provinceCounts = getCounts("province", provinces);
  const communityCounts = getCounts("community", communities);
  const saleTypeCounts = getCounts("saleType", saleTypes.map((t) => t.value));
  const occupancyCounts: Record<string, number> = {};
  (["libre", "ocupado-con-derecho", "ocupado-sin-derecho", "desconocido"] as OccupancyStatus[]).forEach((s) => {
    const c = properties.filter((p) => p.occupancyStatus === s).length;
    if (c > 0) occupancyCounts[s] = c;
  });

  /* ─── Filtering & sorting ─── */
  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (selectedOperation && p.operation !== selectedOperation) return false;
      if (selectedSaleTypes.length > 0 && !selectedSaleTypes.includes(p.saleType)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) return false;
      if (selectedProvinces.length > 0 && !selectedProvinces.includes(p.province)) return false;
      if (selectedCommunities.length > 0 && !selectedCommunities.includes(p.community)) return false;
      if (selectedOccupancy.length > 0 && !selectedOccupancy.includes(p.occupancyStatus)) return false;
      if (referenceSearch) {
        const q = referenceSearch.toLowerCase();
        const searchable = `${p.title} ${p.location} ${p.province} ${p.description} ${p.reference} ${p.features.join(" ")} ${p.municipality}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "area": result.sort((a, b) => b.area - a.area); break;
      case "profitability": result.sort((a, b) => (b.profitability ?? 0) - (a.profitability ?? 0)); break;
      case "discount": result.sort((a, b) => {
        const discA = a.marketValue ? ((a.marketValue - a.price) / a.marketValue) * 100 : 0;
        const discB = b.marketValue ? ((b.marketValue - b.price) / b.marketValue) * 100 : 0;
        return discB - discA;
      }); break;
      case "province": result.sort((a, b) => a.province.localeCompare(b.province)); break;
      case "type": result.sort((a, b) => a.type.localeCompare(b.type)); break;
      case "recent":
      default:
        // Prioritize new/recent items first, then by published date
        result.sort((a, b) => {
          const aRecent = isRecent(a) ? 1 : 0;
          const bRecent = isRecent(b) ? 1 : 0;
          if (bRecent !== aRecent) return bRecent - aRecent;
          return (daysAgo(a.publishedAt) - daysAgo(b.publishedAt));
        });
        break;
    }

    return result;
  }, [referenceSearch, selectedSaleTypes, selectedTypes, selectedProvinces, selectedCommunities, selectedOccupancy, selectedOperation, priceMin, priceMax, sortBy]);

  const clearFilters = () => {
    setReferenceSearch(""); setSelectedSaleTypes([]); setSelectedTypes([]);
    setSelectedProvinces([]); setSelectedCommunities([]); setSelectedOccupancy([]);
    setSelectedOperation(""); setPriceMin(""); setPriceMax("");
  };

  const activeFilterCount =
    selectedSaleTypes.length + selectedTypes.length + selectedProvinces.length +
    selectedCommunities.length + selectedOccupancy.length +
    (selectedOperation ? 1 : 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (referenceSearch ? 1 : 0);

  const formatPrice = (price: number, operation: OperationType) =>
    operation === "alquiler" ? `${price.toLocaleString("es-ES")} €/mes` : `${price.toLocaleString("es-ES")} €`;

  /* ─── Active filter chips ─── */
  const ActiveFilterChips = () => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (referenceSearch) chips.push({ label: `"${referenceSearch}"`, onRemove: () => setReferenceSearch("") });
    selectedSaleTypes.forEach((st) => chips.push({
      label: saleTypes.find((s) => s.value === st)?.label || st,
      onRemove: () => setSelectedSaleTypes((prev) => prev.filter((v) => v !== st)),
    }));
    selectedTypes.forEach((t) => chips.push({
      label: typeLabels[t] || t,
      onRemove: () => setSelectedTypes((prev) => prev.filter((v) => v !== t)),
    }));
    selectedCommunities.forEach((c) => chips.push({ label: c, onRemove: () => setSelectedCommunities((prev) => prev.filter((v) => v !== c)) }));
    selectedProvinces.forEach((p) => chips.push({ label: p, onRemove: () => setSelectedProvinces((prev) => prev.filter((v) => v !== p)) }));
    selectedOccupancy.forEach((o) => chips.push({
      label: occupancyLabels[o],
      onRemove: () => setSelectedOccupancy((prev) => prev.filter((v) => v !== o)),
    }));
    if (selectedOperation) chips.push({
      label: selectedOperation === "venta" ? "Comprar" : "Alquilar",
      onRemove: () => setSelectedOperation(""),
    });
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
            ref={searchInputRef}
            type="text"
            placeholder="Buscar referencia, ubicación..."
            value={referenceSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => { if (e.key === "Escape") setShowSuggestions(false); }}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent pr-8"
          />
          {referenceSearch && (
            <button onClick={() => { setReferenceSearch(""); setSuggestions([]); }}
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
                  onMouseDown={() => { setReferenceSearch(s); setShowSuggestions(false); }}
                >
                  <Search className="w-3 h-3 text-accent shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      <FilterSection title="€ Precio orientativo" isOpen={openSections.price} onToggle={() => toggleSection("price")}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <input type="number" placeholder="Máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </FilterSection>

      <FilterSection title="📋 Operación" isOpen={openSections.operation} onToggle={() => toggleSection("operation")}>
        <select value={selectedOperation} onChange={(e) => setSelectedOperation(e.target.value as any)} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">Todas</option>
          <option value="venta">Comprar</option>
          <option value="alquiler">Alquilar</option>
        </select>
      </FilterSection>

      <FilterSection title="📑 Tipo de venta" isOpen={openSections.saleType} onToggle={() => toggleSection("saleType")}>
        {saleTypes.map((st) => (
          <CheckboxFilter key={st.value} label={st.label} count={saleTypeCounts[st.value] || 0}
            checked={selectedSaleTypes.includes(st.value)}
            onChange={() => toggleArrayFilter(selectedSaleTypes, st.value, setSelectedSaleTypes)} />
        ))}
      </FilterSection>

      <FilterSection title="📍 Comunidad autónoma" isOpen={openSections.community} onToggle={() => toggleSection("community")}>
        {communities.map((c) => (
          <CheckboxFilter key={c} label={c} count={communityCounts[c] || 0}
            checked={selectedCommunities.includes(c)}
            onChange={() => toggleArrayFilter(selectedCommunities, c, setSelectedCommunities)} />
        ))}
      </FilterSection>

      <FilterSection title="📍 Provincia" isOpen={openSections.province} onToggle={() => toggleSection("province")}>
        {provinces.map((p) => (
          <CheckboxFilter key={p} label={p} count={provinceCounts[p] || 0}
            checked={selectedProvinces.includes(p)}
            onChange={() => toggleArrayFilter(selectedProvinces, p, setSelectedProvinces)} />
        ))}
      </FilterSection>

      <FilterSection title="🏠 Tipo de propiedad" isOpen={openSections.propertyType} onToggle={() => toggleSection("propertyType")}>
        {propertyTypes.map((t) => (
          <CheckboxFilter key={t.value} label={t.label} count={typeCounts[t.value] || 0}
            checked={selectedTypes.includes(t.value)}
            onChange={() => toggleArrayFilter(selectedTypes, t.value, setSelectedTypes)} />
        ))}
      </FilterSection>

      <FilterSection title="🔑 Estado ocupacional" isOpen={openSections.occupancy} onToggle={() => toggleSection("occupancy")}>
        {Object.entries(occupancyCounts).map(([key, count]) => (
          <CheckboxFilter key={key} label={occupancyLabels[key as OccupancyStatus]} count={count}
            checked={selectedOccupancy.includes(key as OccupancyStatus)}
            onChange={() => toggleArrayFilter(selectedOccupancy, key as OccupancyStatus, setSelectedOccupancy)} />
        ))}
      </FilterSection>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full text-sm text-accent hover:underline py-2">
          Limpiar todos los filtros ({activeFilterCount})
        </button>
      )}
    </div>
  );

  /* ─── Property Card (Grid) with micro-interactions ─── */
  const PropertyCard = ({ property }: { property: typeof properties[0] }) => {
    const discount = property.marketValue
      ? Math.round(((property.marketValue - property.price) / property.marketValue) * 100) : 0;
    const recent = isRecent(property);

    return (
      <TooltipProvider delayDuration={300}>
        <Link to={`/inmueble/${property.id}`} className="group bg-card rounded-2xl overflow-hidden card-elevated transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{property.reference}</span>
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{saleTypeLabels[property.saleType]}</span>
              <span className="bg-card/90 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">{typeLabels[property.type]}</span>
            </div>
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </div>
            )}
            {recent && (
              <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> Nuevo
              </div>
            )}
            {/* Hover overlay with quick info */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-primary-foreground text-xs font-medium">{occupancyLabels[property.occupancyStatus]}</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <MapPin className="w-3 h-3" />{property.municipality}, {property.province}
              </div>
              <Heart className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug text-sm">{property.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help"><Maximize className="w-3 h-3" />{property.area.toLocaleString("es-ES")} m²</span>
                </TooltipTrigger>
                <TooltipContent><p>Superficie construida</p></TooltipContent>
              </Tooltip>
              {property.bedrooms && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help"><Bed className="w-3 h-3" />{property.bedrooms}</span>
                  </TooltipTrigger>
                  <TooltipContent><p>Habitaciones</p></TooltipContent>
                </Tooltip>
              )}
              {property.bathrooms && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 cursor-help"><Bath className="w-3 h-3" />{property.bathrooms}</span>
                  </TooltipTrigger>
                  <TooltipContent><p>Baños</p></TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-end justify-between border-t border-border pt-3">
              <div>
                {property.marketValue && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground line-through cursor-help">{property.marketValue.toLocaleString("es-ES")} €</p>
                    </TooltipTrigger>
                    <TooltipContent><p>Valor de mercado estimado</p></TooltipContent>
                  </Tooltip>
                )}
                <p className="font-heading text-lg font-bold text-foreground">{formatPrice(property.price, property.operation)}</p>
              </div>
              {property.profitability && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs font-bold text-accent cursor-help">
                      <TrendingUp className="w-3 h-3" />{property.profitability}%
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Rentabilidad estimada bruta anual</p></TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </Link>
      </TooltipProvider>
    );
  };

  /* ─── Property List Item with micro-interactions ─── */
  const PropertyListItem = ({ property }: { property: typeof properties[0] }) => {
    const discount = property.marketValue
      ? Math.round(((property.marketValue - property.price) / property.marketValue) * 100) : 0;
    const recent = isRecent(property);

    return (
      <TooltipProvider delayDuration={300}>
        <Link to={`/inmueble/${property.id}`} className="group bg-card rounded-2xl overflow-hidden card-elevated flex flex-col sm:flex-row transition-all duration-300 hover:shadow-xl hover:border-accent/30">
          <div className="relative sm:w-72 aspect-[16/10] sm:aspect-auto overflow-hidden flex-shrink-0">
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{property.reference}</span>
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{saleTypeLabels[property.saleType]}</span>
            </div>
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </div>
            )}
            {recent && (
              <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> Nuevo
              </div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{property.municipality}, {property.province}</span>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{typeLabels[property.type]}</span>
              </div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 text-sm">{property.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{property.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{property.area.toLocaleString("es-ES")} m²</span>
                {property.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms} hab.</span>}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{occupancyLabels[property.occupancyStatus]}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                {property.marketValue && <p className="text-xs text-muted-foreground line-through">{property.marketValue.toLocaleString("es-ES")} € mercado</p>}
                <p className="font-heading text-lg font-bold text-foreground">{formatPrice(property.price, property.operation)}</p>
              </div>
              {property.profitability && (
                <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-foreground">{property.profitability}% rent.</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </TooltipProvider>
    );
  };

  const recentCount = filtered.filter(isRecent).length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Inmuebles en Venta — Viviendas, Locales, Oficinas y Terrenos | IKESA"
        description="Encuentra inmuebles en venta en toda España: viviendas, locales comerciales, oficinas y terrenos. Inversión inmobiliaria con descuentos sobre valor de mercado."
        canonical="/inmuebles"
        keywords="inmuebles en venta España, viviendas baratas, locales comerciales, oficinas inversión, terrenos en venta, comprar piso descuento"
        jsonLd={createBreadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Inmuebles", url: "/inmuebles" },
        ])}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Oportunidades</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Descubre nuestras oportunidades
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Invierte en oportunidades exclusivas: NPLs, cesiones de remate, inmuebles ocupados y compraventa directa. Accede a información verificada y análisis financiero con proyecciones de rentabilidad.
          </p>
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filtered.length}</strong> oportunidades encontradas
            </p>
            {recentCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> {recentCount} nuevas
              </span>
            )}
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
                { mode: "map" as ViewMode, icon: MapIcon },
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

            {/* Sort — enhanced options */}
            <div className="relative hidden sm:block">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
                <option value="discount">Mayor descuento</option>
                <option value="profitability">Mayor rentabilidad</option>
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
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="recent">Más recientes</option>
                    <option value="price-asc">Precio ↑</option>
                    <option value="price-desc">Precio ↓</option>
                    <option value="discount">Mayor descuento</option>
                    <option value="profitability">Mayor rentabilidad</option>
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
                  Ver {filtered.length} resultados
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground text-lg mb-2">No se encontraron oportunidades</p>
                <button onClick={clearFilters} className="text-sm text-accent hover:underline">Limpiar filtros</button>
              </div>
            ) : viewMode === "map" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="h-[600px] rounded-2xl overflow-hidden border border-border">
                  <PropertyMap properties={filtered} />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filtered.map((p) => <PropertyListItem key={p.id} property={p} />)}
                </div>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {filtered.map((p) => <PropertyListItem key={p.id} property={p} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyListing;
