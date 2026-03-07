import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, Loader2, MapPin, Home, Euro, Phone, Mail, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface ValuationLead {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string;
  municipio: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  tipo_inmueble: string;
  superficie_m2: number;
  habitaciones: number | null;
  banos: number | null;
  anio_construccion: number | null;
  valor_estimado_min: number | null;
  valor_estimado_medio: number | null;
  valor_estimado_max: number | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const AdminValuationLeads = () => {
  const [leads, setLeads] = useState<ValuationLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [provincia, setProvincia] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [provincias, setProvincias] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("valuation_leads").select("provincia").then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map((d: any) => d.provincia).filter(Boolean))].sort() as string[];
        setProvincias(unique);
      }
    });
  }, []);

  useEffect(() => {
    loadLeads();
  }, [page, search, provincia, tipo]);

  const loadLeads = async () => {
    setLoading(true);
    let query = supabase
      .from("valuation_leads")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,direccion.ilike.%${search}%,municipio.ilike.%${search}%`);
    }
    if (provincia !== "all") query = query.eq("provincia", provincia);
    if (tipo !== "all") query = query.eq("tipo_inmueble", tipo);

    const from = (page - 1) * PAGE_SIZE;
    query = query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    setLeads((data as unknown as ValuationLead[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const exportCSV = async () => {
    let query = supabase.from("valuation_leads").select("*");
    if (search) query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,direccion.ilike.%${search}%,municipio.ilike.%${search}%`);
    if (provincia !== "all") query = query.eq("provincia", provincia);
    if (tipo !== "all") query = query.eq("tipo_inmueble", tipo);
    query = query.order("created_at", { ascending: false });

    const { data } = await query;
    if (!data || data.length === 0) return;

    const headers = ["Fecha", "Nombre", "Email", "Teléfono", "Dirección", "Municipio", "Provincia", "CP", "Tipo", "m²", "Hab.", "Baños", "Año", "Val. Mín", "Val. Medio", "Val. Máx"];
    const rows = data.map((l: any) => [
      new Date(l.created_at).toLocaleDateString("es-ES"),
      l.nombre, l.email, l.telefono || "", l.direccion, l.municipio || "", l.provincia || "", l.codigo_postal || "",
      l.tipo_inmueble, l.superficie_m2, l.habitaciones || "", l.banos || "", l.anio_construccion || "",
      l.valor_estimado_min || "", l.valor_estimado_medio || "", l.valor_estimado_max || "",
    ]);

    const csvContent = [headers, ...rows].map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-valoracion-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const fmt = (n: number | null) => n ? n.toLocaleString("es-ES") + " €" : "—";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Leads de Valoración</h1>
            <p className="text-sm text-muted-foreground">{total} solicitudes recibidas</p>
          </div>
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nombre, email, dirección..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                <SelectTrigger><SelectValue placeholder="Tipo inmueble" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="piso">Piso</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="nave">Nave</SelectItem>
                  <SelectItem value="edificio">Edificio</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => loadLeads()} className="gap-2">
                <Search className="w-4 h-4" /> Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No se encontraron leads con estos filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover:border-accent/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Contact info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full capitalize">{lead.tipo_inmueble}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground">{lead.nombre}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                        {lead.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefono}</span>}
                      </div>
                    </div>

                    {/* Property info */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-sm">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Ubicación</p>
                        <p className="font-medium text-foreground text-xs">{lead.direccion}</p>
                        <p className="text-xs text-muted-foreground">{lead.municipio}{lead.provincia ? `, ${lead.provincia}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Home className="w-3 h-3" /> {lead.superficie_m2} m²</p>
                        {lead.habitaciones && <p className="text-xs text-muted-foreground">{lead.habitaciones} hab. · {lead.banos || 0} baños</p>}
                      </div>
                    </div>

                    {/* Valuation */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Euro className="w-3 h-3" /> Valoración</p>
                        <p className="text-sm font-bold text-accent">{fmt(lead.valor_estimado_medio)}</p>
                        <p className="text-[10px] text-muted-foreground">{fmt(lead.valor_estimado_min)} — {fmt(lead.valor_estimado_max)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

export default AdminValuationLeads;
