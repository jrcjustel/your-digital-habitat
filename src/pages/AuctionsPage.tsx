import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Filter, Gavel, Loader2, Search, TrendingDown, Maximize, SlidersHorizontal, X, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetImage {
  asset_id: string;
  file_path: string;
  is_cover: boolean;
}

interface AuctionAsset {
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
  estado_judicial: string | null;
  fase_judicial: string | null;
  cesion_credito: boolean | null;
  cesion_remate: boolean | null;
  postura_subasta: boolean | null;
  deuda_ob: number | null;
  tipo_procedimiento: string | null;
}

const investmentTypes = [
  { id: "npl", label: "NPL - Cesión de créditos", description: "Carteras de créditos morosos de entidades financieras", filter: "cesion_credito" },
  { id: "subasta", label: "Postura en subasta", description: "Coordina tu oferta en una subasta pública", filter: "postura_subasta" },
  { id: "cesion", label: "Cesión de remate", description: "Negocia la cesión de remate del inmueble", filter: "cesion_remate" },
  { id: "all", label: "Compraventa", description: "Inmuebles con o sin posesión", filter: "all" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const AuctionsPage = () => {
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});
  const [assets, setAssets] = useState<AuctionAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const [assetsRes, imagesRes] = await Promise.all([
        supabase
          .from("npl_assets")
          .select("id, tipo_activo, municipio, provincia, direccion, sqm, precio_orientativo, valor_mercado, comunidad_autonoma, estado, estado_judicial, fase_judicial, cesion_credito, cesion_remate, postura_subasta, deuda_ob, tipo_procedimiento")
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
      setAssets((assetsRes.data as unknown as AuctionAsset[]) || []);

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
      toast.error("Error cargando activos de subasta");
    } finally {
      setLoading(false);
    }
  };

  const provinces = useMemo(() => [...new Set(assets.map((a) => a.provincia).filter(Boolean))].sort() as string[], [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        a.municipio?.toLowerCase().includes(s) ||
        a.provincia?.toLowerCase().includes(s) ||
        a.direccion?.toLowerCase().includes(s) ||
        a.tipo_activo?.toLowerCase().includes(s);

      let matchType = true;
      if (typeFilter === "npl") matchType = a.cesion_credito === true;
      else if (typeFilter === "subasta") matchType = a.postura_subasta === true;
      else if (typeFilter === "cesion") matchType = a.cesion_remate === true;

      const matchProv = provinceFilter === "all" || a.provincia === provinceFilter;

      return matchSearch && matchType && matchProv;
    });
  }, [assets, searchTerm, typeFilter, provinceFilter]);

  const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  // Stats
  const stats = useMemo(() => ({
    npl: assets.filter((a) => a.cesion_credito).length,
    subasta: assets.filter((a) => a.postura_subasta).length,
    cesion: assets.filter((a) => a.cesion_remate).length,
    total: assets.length,
  }), [assets]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setProvinceFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Subastas e Inversión Inmobiliaria | IKESA" description="Oportunidades de inversión inmobiliaria en tiempo real con análisis completo" canonical="/subastas" />
      <Navbar />

      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <Gavel className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Subastas Activas</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Oportunidades de inversión inmobiliaria en tiempo real con análisis completo
          </p>
        </div>
      </div>

      {/* Type cards */}
      <section className="py-10 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-heading text-center mb-8">Tipos de Inversión</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {investmentTypes.map((t) => {
              const count = t.id === "all" ? stats.total : stats[t.id as keyof typeof stats] || 0;
              return (
                <Card
                  key={t.id}
                  className={`hover:shadow-lg transition-all cursor-pointer border-border/60 ${typeFilter === t.id ? "ring-2 ring-accent" : ""}`}
                  onClick={() => setTypeFilter(t.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{t.description}</CardDescription>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary">{count} activos</Badge>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Ver Subastas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters + listing */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros</span>
              {(typeFilter !== "all" || provinceFilter !== "all" || searchTerm) && (
                <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />Limpiar
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por ubicación, tipo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tipo inversión" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {investmentTypes.filter(t => t.id !== "all").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Provincia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "activo encontrado" : "activos encontrados"}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Gavel className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mt-4">No se encontraron activos</h3>
            <p className="text-muted-foreground mt-1">Prueba ajustando los filtros</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((a) => {
                const discount =
                  a.valor_mercado && a.precio_orientativo && a.valor_mercado > 0
                    ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
                    : null;

                return (
                  <Link key={a.id} to={`/npl/${a.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full border-border/60">
                      {/* Cover image */}
                      <div className="relative h-44 bg-muted overflow-hidden">
                        {coverImages[a.id] ? (
                          <img src={coverImages[a.id]} alt={a.tipo_activo || "Activo"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">{a.tipo_activo || "Activo"}</Badge>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            {a.cesion_credito && <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">NPL</Badge>}
                            {a.cesion_remate && <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">CDR</Badge>}
                            {a.postura_subasta && <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">Subasta</Badge>}
                            {discount !== null && discount > 0 && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                <TrendingDown className="h-3 w-3 mr-1" />-{discount}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {a.tipo_activo}{a.municipio ? ` en ${a.municipio}` : ""}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {[a.municipio, a.provincia].filter(Boolean).join(", ") || "—"}
                          </p>
                        </div>

                        {/* Prices */}
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
                          {a.deuda_ob && a.deuda_ob > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Deuda OB</span>
                              <span className="text-sm font-medium">{fmt(a.deuda_ob)}</span>
                            </div>
                          )}
                          {a.sqm && a.sqm > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Maximize className="h-3 w-3" />Superficie</span>
                              <span className="text-sm font-medium">{a.sqm} m²</span>
                            </div>
                          )}
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {a.estado && <Badge variant="outline" className="text-[10px] font-normal">{a.estado}</Badge>}
                          {a.estado_judicial && <Badge variant="outline" className="text-[10px] font-normal">{a.estado_judicial}</Badge>}
                          {a.fase_judicial && <Badge variant="outline" className="text-[10px] font-normal">{a.fase_judicial}</Badge>}
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
                  Cargar más ({filtered.length - paged.length} restantes)
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

export default AuctionsPage;
