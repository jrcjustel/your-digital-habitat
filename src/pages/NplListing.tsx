import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Building2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
}

const PAGE_SIZE = 25;

const NplListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<NplAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [provincia, setProvincia] = useState(searchParams.get("provincia") || "all");
  const [tipo, setTipo] = useState(searchParams.get("tipo") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);

  useEffect(() => {
    // Load filter options — use distinct-like approach to avoid 1000 row limit
    supabase.from("npl_assets").select("provincia").limit(10000).then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.provincia).filter(Boolean))].sort() as string[];
        setProvincias(unique);
      }
    });
    supabase.from("npl_assets").select("tipo_activo").limit(10000).then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.tipo_activo).filter(Boolean))].sort() as string[];
        setTipos(unique);
      }
    });
  }, []);

  useEffect(() => {
    loadAssets();
  }, [page, provincia, tipo, search]);

  const loadAssets = async () => {
    setLoading(true);
    let query = supabase
      .from("npl_assets")
      .select("id, municipio, provincia, tipo_activo, direccion, comunidad_autonoma, sqm, tipo_procedimiento, estado_judicial, cesion_remate, cesion_credito, cartera", { count: "exact" });

    if (search) {
      query = query.or(`municipio.ilike.%${search}%,direccion.ilike.%${search}%,provincia.ilike.%${search}%,asset_id.ilike.%${search}%`);
    }
    if (provincia !== "all") query = query.eq("provincia", provincia);
    if (tipo !== "all") query = query.eq("tipo_activo", tipo);

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1).order("provincia").order("municipio");

    const { data, count, error } = await query;
    if (error) console.error(error);
    setAssets((data as unknown as NplAsset[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = () => {
    setPage(1);
    const params: any = {};
    if (search) params.q = search;
    if (provincia !== "all") params.provincia = provincia;
    if (tipo !== "all") params.tipo = tipo;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold mb-2">Activos NPL</h1>
          <p className="text-primary-foreground/70">Base de datos de activos no productivos disponibles para inversión.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por municipio, dirección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={provincia} onValueChange={(v) => { setProvincia(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {provincias.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{total} activos encontrados</p>
          <p className="text-sm text-muted-foreground">Página {page} de {totalPages || 1}</p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron activos con estos filtros.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Municipio</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Provincia</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Dirección</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">m²</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Procedimiento</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">CDR</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">CC</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-3 text-foreground font-medium">{a.municipio || "—"}</td>
                      <td className="p-3 text-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" />{a.provincia || "—"}</td>
                      <td className="p-3 text-foreground">{a.tipo_activo || "—"}</td>
                      <td className="p-3 text-muted-foreground max-w-[250px] truncate">{a.direccion || "—"}</td>
                      <td className="p-3 text-foreground text-right">{a.sqm > 0 ? a.sqm.toLocaleString("es-ES") : "—"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{a.tipo_procedimiento || "—"}</td>
                      <td className="p-3 text-center">
                        {a.cesion_remate ? <span className="text-xs font-bold text-accent">SÍ</span> : <span className="text-xs text-muted-foreground">NO</span>}
                      </td>
                      <td className="p-3 text-center">
                        {a.cesion_credito ? <span className="text-xs font-bold text-accent">SÍ</span> : <span className="text-xs text-muted-foreground">NO</span>}
                      </td>
                      <td className="p-3">
                        <Link to={`/npl/${a.id}`} className="text-xs text-accent hover:underline">Ver</Link>
                      </td>
                    </tr>
                  ))}
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
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
