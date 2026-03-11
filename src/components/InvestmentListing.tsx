import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Building2, ChevronLeft, ChevronRight, Loader2, TrendingDown } from "lucide-react";
import ListingScorePreview from "@/components/intelligence/ListingScorePreview";

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
  postura_subasta: boolean;
  propiedad_sin_posesion: boolean;
  cartera: string | null;
  valor_mercado: number;
  precio_orientativo: number;
  referencia_fencia: string | null;
}

interface InvestmentListingProps {
  /** Extra filter applied to the query */
  filterFn?: (query: any) => any;
  /** Columns to show — defaults to all */
  showColumns?: string[];
}

const PAGE_SIZE = 25;

const InvestmentListing = ({ filterFn, showColumns }: InvestmentListingProps) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [assets, setAssets] = useState<NplAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(initialQuery);
  const [provincia, setProvincia] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [page, setPage] = useState(1);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("npl_assets").select("provincia").then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.provincia).filter(Boolean))].sort() as string[];
        setProvincias(unique);
      }
    });
    supabase.from("npl_assets").select("tipo_activo").then(({ data }) => {
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
      .select("id, municipio, provincia, tipo_activo, direccion, comunidad_autonoma, sqm, tipo_procedimiento, estado_judicial, cesion_remate, cesion_credito, postura_subasta, propiedad_sin_posesion, cartera, valor_mercado, precio_orientativo, referencia_fencia", { count: "exact" });

    if (filterFn) query = filterFn(query);

    if (search) {
      query = query.or(`municipio.ilike.%${search}%,direccion.ilike.%${search}%,provincia.ilike.%${search}%`);
    }
    if (provincia !== "all") query = query.eq("provincia", provincia);
    if (tipo !== "all") query = query.eq("tipo_activo", tipo);

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1).order("provincia").order("municipio");

    const { data, count } = await query;
    setAssets((data as unknown as NplAsset[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por municipio, dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
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
          <Button onClick={() => setPage(1)} className="gap-2">
            <Search className="w-4 h-4" /> Buscar
          </Button>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{total} oportunidades encontradas</p>
        {totalPages > 1 && <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron oportunidades con estos filtros.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assets.map((a) => {
            const discount = a.valor_mercado > 0 && a.precio_orientativo > 0
              ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
              : null;

            return (
              <Link
                key={a.id}
                to={`/npl/${a.id}`}
                className="bg-card rounded-xl border border-border p-4 hover:border-accent/40 transition-all group flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {a.tipo_activo || "Activo"}
                    </span>
                    {a.referencia_fencia && (
                      <span className="text-xs font-mono text-muted-foreground">
                        Ref: {a.referencia_fencia}
                      </span>
                    )}
                    {a.cesion_remate && (
                      <span className="text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">CDR</span>
                    )}
                    {a.cesion_credito && (
                      <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">CC</span>
                    )}
                    {a.postura_subasta && (
                      <span className="text-[10px] font-bold bg-secondary text-foreground px-2 py-0.5 rounded-full">Subasta</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                    {a.direccion || a.municipio || "Ubicación no disponible"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {a.municipio}{a.provincia ? `, ${a.provincia}` : ""}{a.comunidad_autonoma ? ` · ${a.comunidad_autonoma}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <ListingScorePreview
                    price={a.precio_orientativo}
                    marketValue={a.valor_mercado}
                    ocupado={!!a.propiedad_sin_posesion}
                    provincia={a.provincia}
                  />
                  {a.sqm > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Superficie</p>
                      <p className="text-sm font-bold text-foreground">{a.sqm.toLocaleString("es-ES")} m²</p>
                    </div>
                  )}
                  {a.precio_orientativo > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Precio orient.</p>
                      <p className="text-sm font-bold text-accent">{a.precio_orientativo.toLocaleString("es-ES")} €</p>
                    </div>
                  )}
                  {discount !== null && discount > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Descuento</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                        <TrendingDown className="w-3 h-3" /> {discount}%
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
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
  );
};

export default InvestmentListing;
