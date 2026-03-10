import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingDown, Filter, Search, Maximize, Building2, Loader2, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Asset {
  id: string;
  tipo_activo: string | null;
  municipio: string | null;
  provincia: string | null;
  direccion: string | null;
  sqm: number | null;
  precio_orientativo: number | null;
  valor_mercado: number | null;
  comunidad_autonoma: string | null;
  estado: string | null;
  estado_ocupacional: string | null;
  cesion_credito: boolean | null;
  cesion_remate: boolean | null;
  deuda_ob: number | null;
  codigo_postal: string | null;
}

interface AssetImage {
  asset_id: string;
  file_path: string;
  is_cover: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const MarketplacePage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", propertyType: "all", province: "all" });
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<string>("recent");
  const PAGE_SIZE = 24;

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const [assetsRes, imagesRes] = await Promise.all([
        supabase
          .from("npl_assets")
          .select("id, tipo_activo, municipio, provincia, direccion, sqm, precio_orientativo, valor_mercado, comunidad_autonoma, estado, estado_ocupacional, cesion_credito, cesion_remate, deuda_ob, codigo_postal")
          .eq("publicado", true)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("asset_images")
          .select("asset_id, file_path, is_cover")
          .order("is_cover", { ascending: false })
          .order("sort_order", { ascending: true }),
      ]);
      if (assetsRes.error) throw assetsRes.error;
      setAssets((assetsRes.data as unknown as Asset[]) || []);

      // Build a map: asset_id -> first cover image URL
      const imgMap: Record<string, string> = {};
      if (imagesRes.data) {
        for (const img of imagesRes.data as unknown as AssetImage[]) {
          if (!imgMap[img.asset_id]) {
            const { data: urlData } = supabase.storage.from("asset-images").getPublicUrl(img.file_path);
            imgMap[img.asset_id] = urlData.publicUrl;
          }
        }
      }
      setCoverImages(imgMap);
    } catch {
      toast.error("Error cargando activos");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique provinces and types for filter dropdowns
  const provinces = useMemo(() => [...new Set(assets.map(a => a.provincia).filter(Boolean))].sort() as string[], [assets]);
  const types = useMemo(() => [...new Set(assets.map(a => a.tipo_activo).filter(Boolean))].sort() as string[], [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        a.municipio?.toLowerCase().includes(s) ||
        a.provincia?.toLowerCase().includes(s) ||
        a.direccion?.toLowerCase().includes(s) ||
        a.tipo_activo?.toLowerCase().includes(s) ||
        a.codigo_postal?.includes(s);
      const matchMin = !filters.minPrice || (a.precio_orientativo && a.precio_orientativo >= +filters.minPrice);
      const matchMax = !filters.maxPrice || (a.precio_orientativo && a.precio_orientativo <= +filters.maxPrice);
      const matchType = !filters.propertyType || filters.propertyType === "all" || a.tipo_activo === filters.propertyType;
      const matchProv = !filters.province || filters.province === "all" || a.provincia === filters.province;
      return matchSearch && matchMin && matchMax && matchType && matchProv;
    });
  }, [assets, searchTerm, filters]);

  const getDiscount = (a: Asset) =>
    a.valor_mercado && a.precio_orientativo && a.valor_mercado > 0
      ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
      : 0;

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "price-asc":
        return arr.sort((a, b) => (a.precio_orientativo || 0) - (b.precio_orientativo || 0));
      case "price-desc":
        return arr.sort((a, b) => (b.precio_orientativo || 0) - (a.precio_orientativo || 0));
      case "discount":
        return arr.sort((a, b) => getDiscount(b) - getDiscount(a));
      case "recent":
      default:
        return arr;
    }
  }, [filtered, sortBy]);

  const paged = sorted.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paged.length < sorted.length;

  const activeFilterCount = [filters.minPrice, filters.maxPrice, filters.propertyType !== "all" && filters.propertyType, filters.province !== "all" && filters.province].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", propertyType: "all", province: "all" });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Marketplace de Inversión Inmobiliaria | IKESA" description="Descubre las mejores oportunidades de inversión inmobiliaria con análisis de rentabilidad en tiempo real" canonical="/marketplace" />
      <Navbar />

      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Marketplace de Inversión</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Activos inmobiliarios con descuentos significativos sobre valor de mercado. Filtra, compara y accede a oportunidades exclusivas.
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="outline" className="px-3 py-1.5 text-sm">{assets.length} activos publicados</Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm">{provinces.length} provincias</Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">{activeFilterCount}</Badge>
              )}
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />Limpiar
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por ubicación, tipo, código postal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="Precio mín. €" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
              <Input placeholder="Precio máx. €" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
              <Select value={filters.propertyType} onValueChange={(v) => setFilters({ ...filters, propertyType: v })}>
                <SelectTrigger><SelectValue placeholder="Tipo activo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.province} onValueChange={(v) => setFilters({ ...filters, province: v })}>
                <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las provincias</SelectItem>
                  {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "activo encontrado" : "activos encontrados"}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mt-4">No se encontraron activos</h3>
            <p className="text-muted-foreground mt-1">Prueba ajustando los filtros de búsqueda</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((a) => {
                const discount =
                  a.valor_mercado && a.precio_orientativo && a.valor_mercado > 0
                    ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
                    : null;
                return (
                  <Link key={a.id} to={`/npl/${a.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full border-border/60">
                      {coverImages[a.id] ? (
                        <div className="relative h-44 overflow-hidden bg-muted">
                          <img
                            src={coverImages[a.id]}
                            alt={`${a.tipo_activo || "Activo"} en ${a.municipio || "ubicación desconocida"}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            {a.cesion_credito && <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-secondary/80">NPL</Badge>}
                            {a.cesion_remate && <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-secondary/80">CDR</Badge>}
                          </div>
                          {discount !== null && discount > 0 && (
                            <Badge className="absolute top-2 right-2 bg-emerald-600 text-white hover:bg-emerald-700 backdrop-blur-sm">
                              <TrendingDown className="h-3 w-3 mr-1" />-{discount}%
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-44 bg-muted/60 flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground/30" />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            {a.cesion_credito && <Badge variant="secondary" className="text-[10px]">NPL</Badge>}
                            {a.cesion_remate && <Badge variant="secondary" className="text-[10px]">CDR</Badge>}
                          </div>
                          {discount !== null && discount > 0 && (
                            <Badge className="absolute top-2 right-2 bg-emerald-600 text-white hover:bg-emerald-700">
                              <TrendingDown className="h-3 w-3 mr-1" />-{discount}%
                            </Badge>
                          )}
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <Badge variant="outline">{a.tipo_activo || "Activo"}</Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {a.tipo_activo}{a.municipio ? ` en ${a.municipio}` : ""}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {[a.municipio, a.provincia].filter(Boolean).join(", ") || "Ubicación no disponible"}
                          </p>
                        </div>

                        <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                          {a.precio_orientativo && a.precio_orientativo > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Precio orientativo</span>
                              <span className="font-bold text-accent">{fmt(a.precio_orientativo)}</span>
                            </div>
                          )}
                          {a.valor_mercado && a.valor_mercado > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Valor mercado</span>
                              <span className="text-sm line-through text-muted-foreground">{fmt(a.valor_mercado)}</span>
                            </div>
                          )}
                          {a.sqm && a.sqm > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Maximize className="h-3 w-3" />Superficie</span>
                              <span className="text-sm font-medium">{a.sqm} m²</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {a.estado && (
                            <Badge variant="outline" className="text-[10px] font-normal">{a.estado}</Badge>
                          )}
                          {a.estado_ocupacional && (
                            <Badge variant="outline" className="text-[10px] font-normal">{a.estado_ocupacional}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                  Cargar más activos ({filtered.length - paged.length} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
