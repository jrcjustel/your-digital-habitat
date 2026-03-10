import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Building2, ChevronLeft, ChevronRight, Loader2, LayoutGrid, List, SlidersHorizontal, X, TrendingDown, Sparkles, Clock, Map as MapIcon } from "lucide-react";
import NplAssetCard from "@/components/NplAssetCard";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";

interface NplAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  comunidad_autonoma: string | null;
  sqm: number;
  tipo_procedimiento: string | null;
  estado_judicial: string | null;
  cesion_remate: boolean;
  cesion_credito: boolean;
  cartera: string | null;
  precio_orientativo: number;
  valor_mercado: number;
  deuda_ob: number;
  estado: string | null;
  created_at?: string;
}

const PAGE_SIZE = 24;

type SortOption = "precio_desc" | "precio_asc" | "descuento" | "recientes" | "superficie" | "prioridad";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "prioridad", label: "Prioridad" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "descuento", label: "Mayor descuento" },
  { value: "recientes", label: "Más recientes" },
  { value: "superficie", label: "Mayor superficie" },
];

// Priority scoring for enterprise sort
function calcPriority(asset: NplAsset): number {
  let score = 0;
  const tipo = (asset.tipo_activo || "").toLowerCase();
  if (tipo.includes("nave") || tipo.includes("industrial")) score += 30;
  if (tipo.includes("local")) score += 20;
  if (asset.cesion_remate) score += 15;
  if (asset.cesion_credito) score += 10;
  if (asset.created_at) {
    const days = (Date.now() - new Date(asset.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 7) score += 25;
    else if (days <= 30) score += 10;
  }
  if (asset.valor_mercado > 0 && asset.precio_orientativo > 0) {
    const discount = (1 - asset.precio_orientativo / asset.valor_mercado) * 100;
    if (discount >= 50) score += 20;
    else if (discount >= 30) score += 10;
  }
  return score;
}

const NplListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [assets, setAssets] = useState<NplAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [provincia, setProvincia] = useState(searchParams.get("provincia") || "all");
  const [ccaa, setCcaa] = useState(searchParams.get("ccaa") || "all");
  const [tipo, setTipo] = useState(searchParams.get("tipo") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ccaas, setCcaas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("recientes");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precio_max") || "");
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [soloCdr, setSoloCdr] = useState(false);
  const [soloCc, setSoloCc] = useState(false);

  // Suggestions for autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load filter options once
  useEffect(() => {
    Promise.all([
      supabase.from("npl_assets").select("provincia").eq("publicado", true),
      supabase.from("npl_assets").select("tipo_activo").eq("publicado", true),
      supabase.from("npl_assets").select("comunidad_autonoma").eq("publicado", true),
    ]).then(([provRes, tipoRes, ccaaRes]) => {
      if (provRes.data) setProvincias([...new Set(provRes.data.map((d: any) => d.provincia).filter(Boolean))].sort() as string[]);
      if (tipoRes.data) setTipos([...new Set(tipoRes.data.map((d: any) => d.tipo_activo).filter(Boolean))].sort() as string[]);
      if (ccaaRes.data) setCcaas([...new Set(ccaaRes.data.map((d: any) => d.comunidad_autonoma).filter(Boolean))].sort() as string[]);
    });
  }, []);

  // Load user favorites
  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("property_id").eq("user_id", user.id).then(({ data }) => {
      if (data) setFavorites(new Set(data.map((f: any) => f.property_id)));
    });
  }, [user]);

  // Autocomplete suggestions
  const handleSearchInput = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

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
        )].slice(0, 6);
        setSuggestions(unique as string[]);
        setShowSuggestions(unique.length > 0);
      }
    }, 250);
  }, []);

  useEffect(() => {
    loadAssets();
  }, [page, provincia, ccaa, tipo, sortBy, soloCdr, soloCc, soloDisponibles, precioMin, precioMax, search]);

  const loadAssets = async () => {
    setLoading(true);
    let query = supabase
      .from("npl_assets")
      .select("id, municipio, provincia, tipo_activo, direccion, comunidad_autonoma, sqm, tipo_procedimiento, estado_judicial, cesion_remate, cesion_credito, cartera, precio_orientativo, valor_mercado, deuda_ob, estado, created_at", { count: "exact" })
      .eq("publicado", true);

    if (search) {
      query = query.or(`municipio.ilike.%${search}%,direccion.ilike.%${search}%,provincia.ilike.%${search}%,asset_id.ilike.%${search}%`);
    }
    if (provincia !== "all") query = query.eq("provincia", provincia);
    if (ccaa !== "all") query = query.eq("comunidad_autonoma", ccaa);
    if (tipo !== "all") query = query.eq("tipo_activo", tipo);
    if (soloDisponibles) query = query.not("estado", "in", '("cerrado","oferta_gestion")');
    if (soloCdr) query = query.eq("cesion_remate", true);
    if (soloCc) query = query.eq("cesion_credito", true);
    if (precioMin) query = query.gte("precio_orientativo", Number(precioMin));
    if (precioMax) query = query.lte("precio_orientativo", Number(precioMax));

    // Sort
    switch (sortBy) {
      case "prioridad":
        query = query.order("created_at", { ascending: false });
        break;
      case "precio_desc":
        query = query.order("precio_orientativo", { ascending: false, nullsFirst: false });
        break;
      case "precio_asc":
        query = query.order("precio_orientativo", { ascending: true, nullsFirst: false });
        break;
      case "recientes":
        query = query.order("created_at", { ascending: false });
        break;
      case "superficie":
        query = query.order("sqm", { ascending: false, nullsFirst: false });
        break;
      case "descuento":
        query = query.order("precio_orientativo", { ascending: true, nullsFirst: false });
        break;
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    let results = (data as unknown as NplAsset[]) || [];

    // Client-side priority sort
    if (sortBy === "prioridad") {
      results = results.sort((a, b) => calcPriority(b) - calcPriority(a));
    }

    setAssets(results);
    setTotal(count || 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = () => {
    setPage(1);
    setShowSuggestions(false);
    const params: any = {};
    if (search) params.q = search;
    if (provincia !== "all") params.provincia = provincia;
    if (ccaa !== "all") params.ccaa = ccaa;
    if (tipo !== "all") params.tipo = tipo;
    setSearchParams(params);
    loadAssets();
  };

  const handleFavoriteToggle = (assetId: string, favorited: boolean) => {
    setFavorites(prev => {
      const next = new Set(prev);
      favorited ? next.add(assetId) : next.delete(assetId);
      return next;
    });
  };

  const activeFiltersCount = [
    provincia !== "all",
    ccaa !== "all",
    tipo !== "all",
    soloCdr,
    soloCc,
    !!precioMin,
    !!precioMax,
    !!search,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setProvincia("all");
    setCcaa("all");
    setTipo("all");
    setSoloCdr(false);
    setSoloCc(false);
    setPrecioMin("");
    setPrecioMax("");
    setSoloDisponibles(true);
    setPage(1);
    setSearchParams({});
  };

  // Filter provincias by selected CCAA
  const filteredProvincias = useMemo(() => {
    if (ccaa === "all") return provincias;
    // We don't have a ccaa→provincia mapping from DB, so show all
    return provincias;
  }, [ccaa, provincias]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Activos NPL en Venta — Comprar Deuda Hipotecaria e Inmuebles Distressed"
        description={`Explora ${total > 0 ? total.toLocaleString("es-ES") + " " : ""}activos NPL en España: cesiones de remate, inmuebles ocupados y deuda hipotecaria con descuentos de hasta el 60%. Filtra por provincia, tipo y precio.`}
        canonical="/npl"
        keywords="comprar NPL España, activos distressed, deuda hipotecaria, cesiones de remate, inmuebles ocupados en venta, non-performing loans"
        jsonLd={createBreadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Activos NPL", url: "/npl" },
        ])}
      />
      <Navbar />

      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold mb-2">Oportunidades de Inversión</h1>
          <p className="text-primary-foreground/70">Explora activos NPL, cesiones de remate, inmuebles ocupados y compraventa directa. Accede a oportunidades con proyecciones de rentabilidad.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {activeFiltersCount} activos
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? "Menos filtros" : "Más filtros"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search with autocomplete */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar municipio, dirección, ref..."
                value={search}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2 border-b border-border last:border-0"
                      onMouseDown={() => {
                        setSearch(s);
                        setShowSuggestions(false);
                        setPage(1);
                        setTimeout(() => handleSearch(), 50);
                      }}
                    >
                      <MapPin className="w-3 h-3 text-accent shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Select value={ccaa} onValueChange={(v) => { setCcaa(v); setProvincia("all"); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Comunidad Autónoma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las CCAA</SelectItem>
                {ccaas.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={provincia} onValueChange={(v) => { setProvincia(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {filteredProvincias.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Tipo activo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" /> Buscar
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-border">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase mb-1 block">Precio desde</label>
                <Input
                  type="number"
                  placeholder="Min €"
                  value={precioMin}
                  onChange={(e) => { setPrecioMin(e.target.value); setPage(1); }}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase mb-1 block">Precio hasta</label>
                <Input
                  type="number"
                  placeholder="Max €"
                  value={precioMax}
                  onChange={(e) => { setPrecioMax(e.target.value); setPage(1); }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={soloCdr}
                    onChange={(e) => { setSoloCdr(e.target.checked); setPage(1); }}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-foreground text-xs font-medium">Solo CDR</span>
                </label>
              </div>
              <div className="flex items-end">
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={soloDisponibles}
                    onChange={(e) => { setSoloDisponibles(e.target.checked); setPage(1); }}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-foreground text-xs font-medium">Solo disponibles</span>
                </label>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase mb-1 block">Ordenar por</label>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
              {search && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => { setSearch(""); handleSearch(); }}>
                  "{search}" <X className="w-3 h-3" />
                </Badge>
              )}
              {ccaa !== "all" && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => setCcaa("all")}>
                  {ccaa} <X className="w-3 h-3" />
                </Badge>
              )}
              {provincia !== "all" && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => setProvincia("all")}>
                  {provincia} <X className="w-3 h-3" />
                </Badge>
              )}
              {tipo !== "all" && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => setTipo("all")}>
                  {tipo} <X className="w-3 h-3" />
                </Badge>
              )}
              {soloCdr && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => setSoloCdr(false)}>
                  CDR <X className="w-3 h-3" />
                </Badge>
              )}
              {soloCc && (
                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => setSoloCc(false)}>
                  Cesión crédito <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Dashboard summary */}
        {!loading && assets.length > 0 && (
          <div className="bg-card rounded-xl border border-border px-5 py-3 mb-4 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-foreground">{total.toLocaleString("es-ES")} activos</span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-1 text-accent">
              <Sparkles className="w-3 h-3" />
              {assets.filter(a => a.created_at && (Date.now() - new Date(a.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length} nuevos
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-1 text-blue-600">
              <Clock className="w-3 h-3" />
              {assets.filter(a => {
                if (!a.created_at) return false;
                const d = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
                return d > 30 && d <= 37;
              }).length} próximos a vencer
            </span>
            {activeFiltersCount > 0 && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{activeFiltersCount} filtros activos</span>
              </>
            )}
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total.toLocaleString("es-ES")}</span> activos encontrados
          </p>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-none border-x border-border" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "map" ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("map")}>
                <MapIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No se encontraron activos con estos filtros.</p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="w-3 h-3" /> Limpiar filtros
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((a, i) => (
              <NplAssetCard
                key={a.id}
                asset={a}
                isFavorited={favorites.has(a.id)}
                userId={user?.id}
                onFavoriteToggle={handleFavoriteToggle}
                isNew={a.created_at ? (Date.now() - new Date(a.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false}
                priority={calcPriority(a) >= 40}
              />
            ))}
          </div>
        ) : viewMode === "map" ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <MapIcon className="w-10 h-10 text-accent mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Vista de mapa disponible en la página dedicada.</p>
            <Link to="/mapa" className="text-sm text-accent font-semibold hover:underline">Abrir mapa completo →</Link>
          </div>
        ) : (
          /* List view */
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Municipio</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Provincia</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Precio orient.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Valor mercado</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Dto.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">m²</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">CDR</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">CC</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => {
                    const dto = a.valor_mercado > 0 && a.precio_orientativo > 0
                      ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100) : null;
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors group">
                        <td className="p-3 text-foreground font-medium">
                          <div className="flex items-center gap-1.5">
                            {a.municipio || "—"}
                            {a.created_at && (Date.now() - new Date(a.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                              <span className="inline-flex items-center gap-0.5 bg-accent/15 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5" /> Nuevo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" />{a.provincia || "—"}</td>
                        <td className="p-3 text-foreground">{a.tipo_activo || "—"}</td>
                        <td className="p-3 text-accent font-bold text-right">{a.precio_orientativo > 0 ? `${a.precio_orientativo.toLocaleString("es-ES")} €` : "—"}</td>
                        <td className="p-3 text-foreground text-right">{a.valor_mercado > 0 ? `${a.valor_mercado.toLocaleString("es-ES")} €` : "—"}</td>
                        <td className="p-3 text-right">
                          {dto && dto > 0 ? (
                            <span className="text-green-600 font-bold flex items-center justify-end gap-0.5">
                              <TrendingDown className="w-3 h-3" /> -{dto}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-3 text-foreground text-right">{a.sqm > 0 ? a.sqm.toLocaleString("es-ES") : "—"}</td>
                        <td className="p-3 text-center">
                          {a.cesion_remate ? <span className="text-xs font-bold text-accent">SÍ</span> : <span className="text-xs text-muted-foreground">NO</span>}
                        </td>
                        <td className="p-3 text-center">
                          {a.cesion_credito ? <span className="text-xs font-bold text-accent">SÍ</span> : <span className="text-xs text-muted-foreground">NO</span>}
                        </td>
                        <td className="p-3">
                          <Link to={`/npl/${a.id}`} className="text-xs text-accent hover:underline font-medium opacity-70 group-hover:opacity-100 transition-opacity">Ver →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page + i - 3;
              if (p < 1 || p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            {page + 3 < totalPages && <span className="text-muted-foreground">…</span>}
            {page + 3 < totalPages && (
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>
                {totalPages}
              </Button>
            )}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NplListing;
