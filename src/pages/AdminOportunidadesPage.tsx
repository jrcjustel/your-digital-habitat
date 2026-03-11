import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Search, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, XCircle, Activity, Building2, MapPin, BarChart3,
  Filter, ChevronUp, ChevronDown, ExternalLink, RefreshCw, Zap,
  Map as MapIcon, List, Home, Gavel, Key,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────
type OpStrategy = "all" | "npl" | "cdr" | "ocupado";
type ViewMode = "table" | "map";

interface Oportunidad {
  id: string;
  asset_id: string | null;
  ref_catastral: string | null;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  servicer: string | null;
  valor_activo: number | null;
  valor_mercado: number | null;
  precio_orientativo: number | null;
  deuda_ob: number | null;
  estado: string | null;
  estado_ocupacional: string | null;
  estado_judicial: string | null;
  publicado: boolean | null;
  sqm: number | null;
  cesion_remate: boolean | null;
  cesion_credito: boolean | null;
  judicializado: boolean | null;
  codigo_postal: string | null;
  // From oportunidades_extra
  score_inversion: number | null;
  roi_estimado: number | null;
  tir_estimada: number | null;
  liquidez_score: number | null;
  riesgo_judicial: number | null;
}

function getOpStrategy(op: Oportunidad): string {
  if (op.cesion_remate || op.cesion_credito) return "cdr";
  if ((op.estado_ocupacional || "").toLowerCase().includes("ocupado")) return "ocupado";
  return "npl";
}

type SortField = "score_inversion" | "roi_estimado" | "tir_estimada" | "precio_orientativo" | "valor_mercado" | "riesgo_judicial";
type SortDir = "asc" | "desc";

// ── Risk semaphore ──────────────────────────────────────────
const RiskSemaphore = ({ riesgo, liquidez }: { riesgo: number | null; liquidez: number | null }) => {
  const r = riesgo ?? 0;
  const l = liquidez ?? 0;
  const combined = Math.max(0, Math.min(100, (r * 0.6 + (100 - l) * 0.4)));

  let color = "bg-green-500";
  let label = "Bajo";
  let textColor = "text-green-700";
  if (combined > 65) { color = "bg-red-500"; label = "Alto"; textColor = "text-red-700"; }
  else if (combined > 35) { color = "bg-amber-500"; label = "Medio"; textColor = "text-amber-700"; }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
          <span className={`text-xs font-medium ${textColor}`}>{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>Riesgo judicial: {riesgo ?? "N/A"}/100</p>
        <p>Liquidez: {liquidez ?? "N/A"}/100</p>
        <p>Índice combinado: {Math.round(combined)}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// ── Score badge ─────────────────────────────────────────────
const ScoreBadge = ({ score }: { score: number | null }) => {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  if (score >= 70) variant = "default";
  else if (score < 40) variant = "destructive";

  return (
    <Badge variant={variant} className="text-xs font-bold tabular-nums min-w-[3rem] justify-center">
      {score}
    </Badge>
  );
};

// ── Metric pill ─────────────────────────────────────────────
const MetricPill = ({ label, value, suffix = "%", positive }: { label: string; value: number | null; suffix?: string; positive?: boolean }) => {
  if (value == null) return null;
  const icon = positive !== undefined
    ? (positive ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />)
    : null;
  return (
    <div className="flex items-center gap-1 text-xs">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground tabular-nums">{value.toFixed(1)}{suffix}</span>
    </div>
  );
};

// ── KPI Summary Card ────────────────────────────────────────
const KpiSummary = ({ data }: { data: Oportunidad[] }) => {
  const withScore = data.filter(d => d.score_inversion != null);
  const avgScore = withScore.length ? Math.round(withScore.reduce((s, d) => s + (d.score_inversion ?? 0), 0) / withScore.length) : 0;
  const withRoi = data.filter(d => d.roi_estimado != null && d.roi_estimado > 0);
  const avgRoi = withRoi.length ? (withRoi.reduce((s, d) => s + (d.roi_estimado ?? 0), 0) / withRoi.length) : 0;
  const withTir = data.filter(d => d.tir_estimada != null && d.tir_estimada > 0);
  const avgTir = withTir.length ? (withTir.reduce((s, d) => s + (d.tir_estimada ?? 0), 0) / withTir.length) : 0;
  const highRisk = data.filter(d => (d.riesgo_judicial ?? 0) > 65).length;

  const cards = [
    { label: "Oportunidades", value: data.length, icon: Building2, color: "text-primary" },
    { label: "Score medio", value: avgScore, icon: BarChart3, color: "text-accent" },
    { label: "ROI medio", value: `${avgRoi.toFixed(1)}%`, icon: TrendingUp, color: "text-green-600" },
    { label: "TIR media", value: `${avgTir.toFixed(1)}%`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Alto riesgo", value: highRisk, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(c => (
        <Card key={c.label} className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <c.icon className={`w-5 h-5 ${c.color} shrink-0`} />
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ── Province coordinates for map clustering ─────────────────
const PROVINCE_COORDS: Record<string, [number, number]> = {
  "madrid": [40.4168, -3.7038], "barcelona": [41.3851, 2.1734], "valencia": [39.4699, -0.3763],
  "sevilla": [37.3891, -5.9845], "malaga": [36.7213, -4.4214], "alicante": [38.3452, -0.4810],
  "zaragoza": [41.6488, -0.8891], "murcia": [37.9922, -1.1307], "bilbao": [43.2630, -2.9350],
  "palma de mallorca": [39.5696, 2.6502], "las palmas": [28.1235, -15.4363],
  "santa cruz de tenerife": [28.4636, -16.2518], "valladolid": [41.6523, -4.7245],
  "granada": [37.1773, -3.5986], "cordoba": [37.8882, -4.7794], "cadiz": [36.5271, -6.2886],
  "salamanca": [40.9688, -5.6633], "toledo": [39.8628, -4.0273], "tarragona": [41.1189, 1.2445],
  "girona": [41.9794, 2.8214], "almeria": [36.8340, -2.4637], "huelva": [37.2614, -6.9447],
  "jaen": [37.7796, -3.7849], "leon": [42.5987, -5.5671], "burgos": [42.3439, -3.6969],
  "a coruña": [43.3623, -8.4115], "vigo": [42.2406, -8.7207], "pontevedra": [42.4310, -8.6443],
  "lugo": [43.0097, -7.5568], "ourense": [42.3358, -7.8639], "oviedo": [43.3619, -5.8494],
  "gijon": [43.5322, -5.6611], "santander": [43.4623, -3.8100], "pamplona": [42.8125, -1.6458],
  "san sebastian": [43.3183, -1.9812], "vitoria": [42.8469, -2.6727], "logroño": [42.4627, -2.4445],
  "badajoz": [38.8794, -6.9707], "caceres": [39.4753, -6.3724], "castellon": [39.9864, -0.0513],
  "albacete": [38.9942, -1.8585], "ciudad real": [38.9848, -3.9274], "cuenca": [40.0704, -2.1374],
  "guadalajara": [40.6331, -3.1647], "huesca": [42.1401, -0.4089], "teruel": [40.3456, -1.1065],
  "lleida": [41.6176, 0.6200], "palencia": [42.0096, -4.5279], "segovia": [40.9429, -4.1088],
  "soria": [41.7636, -2.4649], "avila": [40.6564, -4.6818], "zamora": [41.5034, -5.7446],
};

function getCoords(provincia: string | null): [number, number] | null {
  if (!provincia) return null;
  const norm = provincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  for (const [key, coords] of Object.entries(PROVINCE_COORDS)) {
    if (norm.includes(key) || key.includes(norm)) return coords;
  }
  return null;
}

// ── Map View Component ──────────────────────────────────────
const AdminMapView = ({ data, onSelect }: { data: Oportunidad[]; onSelect: (id: string) => void }) => {
  // Group by province for clustering
  const clusters = useMemo(() => {
    const map = new Map<string, { coords: [number, number]; items: Oportunidad[] }>();
    for (const op of data) {
      const coords = getCoords(op.provincia);
      if (!coords) continue;
      const key = op.provincia || "unknown";
      if (!map.has(key)) map.set(key, { coords, items: [] });
      map.get(key)!.items.push(op);
    }
    return [...map.entries()];
  }, [data]);

  const withoutCoords = data.filter(d => !getCoords(d.provincia));

  return (
    <div className="space-y-3">
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[500px] relative bg-secondary/20">
            {/* Leaflet map */}
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Activity className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
              <MapContainer data={data} clusters={clusters} onSelect={onSelect} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
      {withoutCoords.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {withoutCoords.length} activos sin coordenadas de provincia (no aparecen en el mapa)
        </p>
      )}
    </div>
  );
};

// ── Leaflet Map Container ───────────────────────────────────
const MapContainer = ({ data, clusters, onSelect }: {
  data: Oportunidad[];
  clusters: [string, { coords: [number, number]; items: Oportunidad[] }][];
  onSelect: (id: string) => void;
}) => {
  const mapRef = useState<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const container = document.getElementById("admin-map-container");
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map(container).setView([40.0, -3.5], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Add cluster markers
      for (const [prov, { coords, items }] of clusters) {
        const npl = items.filter(i => getOpStrategy(i) === "npl").length;
        const cdr = items.filter(i => getOpStrategy(i) === "cdr").length;
        const ocu = items.filter(i => getOpStrategy(i) === "ocupado").length;

        const size = Math.min(50, 20 + items.length * 0.3);
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:hsl(221,83%,53%);color:white;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:bold;border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
          ">${items.length}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker(coords, { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:180px">
            <strong>${prov}</strong><br/>
            <span style="font-size:12px;color:#666">${items.length} activos</span>
            <div style="margin-top:6px;font-size:11px">
              ${npl > 0 ? `<span style="color:#2563eb">● NPL: ${npl}</span><br/>` : ""}
              ${cdr > 0 ? `<span style="color:#7c3aed">● CDR: ${cdr}</span><br/>` : ""}
              ${ocu > 0 ? `<span style="color:#ea580c">● Ocupados: ${ocu}</span><br/>` : ""}
            </div>
          </div>
        `);
      }

      setMapInstance(map);
    };

    loadMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [clusters]);

  return <div id="admin-map-container" className="h-full w-full" />;
};

// ── Main Page ───────────────────────────────────────────────
const AdminOportunidadesPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProvincia, setFilterProvincia] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterStrategy, setFilterStrategy] = useState<OpStrategy>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("score_inversion");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  // Batch scoring state
  const [scoring, setScoring] = useState(false);
  const [scoreProgress, setScoreProgress] = useState<{
    phase: string; offset: number; calculated: number; errors: number; done: boolean;
  } | null>(null);

  const runBatchScoring = async (onlyMissing: boolean) => {
    setScoring(true);
    setScoreProgress({ phase: "Iniciando...", offset: 0, calculated: 0, errors: 0, done: false });
    let offset = 0;
    const batchLimit = 500;
    let totalCalc = 0;
    let totalErr = 0;

    try {
      while (true) {
        setScoreProgress(p => ({ ...p!, phase: `Procesando lote desde ${offset}...`, offset }));
        const { data: result, error } = await supabase.functions.invoke("batch-scoring", {
          body: { limit: batchLimit, offset, only_missing: onlyMissing },
        });
        if (error) throw new Error(error.message);
        if (!result?.success) throw new Error(result?.error || "Error desconocido");

        totalCalc += result.calculated || 0;
        totalErr += result.errors || 0;
        setScoreProgress({ phase: `Calculados: ${totalCalc}`, offset, calculated: totalCalc, errors: totalErr, done: false });

        // If calculated less than batch, we're done
        if ((result.total_assets || 0) < batchLimit) break;
        offset += batchLimit;
      }

      setScoreProgress(p => ({ ...p!, phase: "Completado", done: true }));
      toast.success(`Scoring completado: ${totalCalc} activos calculados, ${totalErr} errores`);
      // Reload data to reflect new scores
      await load();
    } catch (e: any) {
      toast.error("Error en batch scoring: " + (e.message || "Error"));
      setScoreProgress(p => p ? { ...p, phase: "Error: " + (e.message || ""), done: true } : null);
    } finally {
      setScoring(false);
    }
  };

  const load = async () => {
    setLoading(true);
    // Fetch npl_assets
    const { data: assets } = await supabase
      .from("npl_assets")
      .select("id, asset_id, ref_catastral, municipio, provincia, comunidad_autonoma, tipo_activo, servicer, valor_activo, valor_mercado, precio_orientativo, deuda_ob, estado, estado_ocupacional, estado_judicial, publicado, sqm, cesion_remate, cesion_credito, judicializado, codigo_postal")
      .order("created_at", { ascending: false })
      .limit(1000);

    // Fetch extras
    const { data: extras } = await supabase
      .from("oportunidades_extra")
      .select("npl_asset_id, score_inversion, roi_estimado, tir_estimada, liquidez_score, riesgo_judicial");

    const extrasMap = new Map((extras || []).map(e => [e.npl_asset_id, e]));

    const merged: Oportunidad[] = (assets || []).map(a => {
      const ex = extrasMap.get(a.id);
      return {
        ...a,
        score_inversion: ex?.score_inversion ?? null,
        roi_estimado: ex?.roi_estimado ?? null,
        tir_estimada: ex?.tir_estimada ?? null,
        liquidez_score: ex?.liquidez_score ?? null,
        riesgo_judicial: ex?.riesgo_judicial ?? null,
      };
    });

    setData(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Derived data ────────────────────────────────────────
  const provincias = useMemo(() => [...new Set(data.map(d => d.provincia).filter(Boolean))].sort() as string[], [data]);
  const tipos = useMemo(() => [...new Set(data.map(d => d.tipo_activo).filter(Boolean))].sort() as string[], [data]);

  const strategyCounts = useMemo(() => {
    const counts = { all: data.length, npl: 0, cdr: 0, ocupado: 0 };
    data.forEach(d => { counts[getOpStrategy(d) as keyof typeof counts]++; });
    return counts;
  }, [data]);

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        (d.asset_id || "").toLowerCase().includes(q) ||
        (d.ref_catastral || "").toLowerCase().includes(q) ||
        (d.municipio || "").toLowerCase().includes(q) ||
        (d.provincia || "").toLowerCase().includes(q) ||
        (d.servicer || "").toLowerCase().includes(q) ||
        (d.codigo_postal || "").includes(q)
      );
    }
    if (filterProvincia !== "all") result = result.filter(d => d.provincia === filterProvincia);
    if (filterTipo !== "all") result = result.filter(d => d.tipo_activo === filterTipo);
    if (filterRisk === "low") result = result.filter(d => (d.riesgo_judicial ?? 0) <= 35);
    if (filterRisk === "medium") result = result.filter(d => { const r = d.riesgo_judicial ?? 0; return r > 35 && r <= 65; });
    if (filterRisk === "high") result = result.filter(d => (d.riesgo_judicial ?? 0) > 65);
    if (filterStrategy !== "all") result = result.filter(d => getOpStrategy(d) === filterStrategy);

    // Sort
    result = [...result].sort((a, b) => {
      const va = (a[sortField] ?? -Infinity) as number;
      const vb = (b[sortField] ?? -Infinity) as number;
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [data, search, filterProvincia, filterTipo, filterRisk, filterStrategy, sortField, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  };

  const fmt = (n: number | null) => n != null ? n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) : "—";
  const fmtEur = (n: number | null) => n != null && n > 0 ? `${n.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €` : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Oportunidades | Admin IKESA" description="Vista unificada de oportunidades de inversión" canonical="/admin/oportunidades" />
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/panel")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Oportunidades de Inversión</h1>
              <p className="text-sm text-muted-foreground">{filtered.length} activos · Score, ROI, TIR y semáforo de riesgo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => runBatchScoring(true)} disabled={scoring} className="gap-2">
              <Zap className="w-4 h-4" /> {scoring ? "Scoring..." : "Batch Scoring"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => runBatchScoring(false)} disabled={scoring} className="gap-2" title="Recalcular todos, incluso los ya calculados">
              <Zap className="w-4 h-4" /> Recalcular todo
            </Button>
            <Button variant="outline" size="sm" onClick={load} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </Button>
          </div>
        </div>

        {/* Batch Scoring Progress */}
        {scoreProgress && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{scoreProgress.phase}</span>
                </div>
                {scoreProgress.done && (
                  <Button variant="ghost" size="sm" onClick={() => setScoreProgress(null)} className="text-xs h-7">
                    Cerrar
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Calculados: <strong className="text-foreground">{scoreProgress.calculated}</strong></span>
                {scoreProgress.errors > 0 && (
                  <span>Errores: <strong className="text-destructive">{scoreProgress.errors}</strong></span>
                )}
              </div>
              {scoring && <Progress value={undefined} className="h-1.5" />}
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        <KpiSummary data={filtered} />

        {/* Strategy tabs + View toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            {([
              { value: "all", label: "Todos", icon: Building2 },
              { value: "npl", label: "NPL", icon: Home },
              { value: "cdr", label: "Cesión/Remate", icon: Gavel },
              { value: "ocupado", label: "Ocupados", icon: Key },
            ] as const).map(tab => (
              <Button
                key={tab.value}
                variant={filterStrategy === tab.value ? "default" : "ghost"}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => { setFilterStrategy(tab.value); setPage(0); }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <Badge variant="outline" className="text-[10px] ml-1 h-4 px-1">{strategyCounts[tab.value]}</Badge>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setViewMode("table")}>
              <List className="w-3.5 h-3.5" /> Tabla
            </Button>
            <Button variant={viewMode === "map" ? "default" : "ghost"} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setViewMode("map")}>
              <MapIcon className="w-3.5 h-3.5" /> Mapa
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por referencia, municipio, provincia, CP, servicer..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  className="pl-9"
                />
              </div>
              <Select value={filterProvincia} onValueChange={v => { setFilterProvincia(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Provincia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas provincias</SelectItem>
                  {provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterTipo} onValueChange={v => { setFilterTipo(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo activo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterRisk} onValueChange={v => { setFilterRisk(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Riesgo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo riesgo</SelectItem>
                  <SelectItem value="low">🟢 Bajo</SelectItem>
                  <SelectItem value="medium">🟡 Medio</SelectItem>
                  <SelectItem value="high">🔴 Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {viewMode === "table" ? (
          <>
          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-muted-foreground">
                  <th className="text-left p-3 font-medium">Referencia</th>
                  <th className="text-left p-3 font-medium">Ubicación</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-center p-3 font-medium">Estrategia</th>
                  <th className="text-left p-3 font-medium">Servicer</th>
                  <th className="text-right p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("precio_orientativo")}>
                    <span className="inline-flex items-center gap-1">Precio <SortIcon field="precio_orientativo" /></span>
                  </th>
                  <th className="text-right p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("valor_mercado")}>
                    <span className="inline-flex items-center gap-1">V. Mercado <SortIcon field="valor_mercado" /></span>
                  </th>
                  <th className="text-center p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("score_inversion")}>
                    <span className="inline-flex items-center gap-1">Score <SortIcon field="score_inversion" /></span>
                  </th>
                  <th className="text-right p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("roi_estimado")}>
                    <span className="inline-flex items-center gap-1">ROI <SortIcon field="roi_estimado" /></span>
                  </th>
                  <th className="text-right p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("tir_estimada")}>
                    <span className="inline-flex items-center gap-1">TIR <SortIcon field="tir_estimada" /></span>
                  </th>
                  <th className="text-center p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("riesgo_judicial")}>
                    <span className="inline-flex items-center gap-1">Riesgo <SortIcon field="riesgo_judicial" /></span>
                  </th>
                  <th className="text-center p-3 font-medium">Estado</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-muted-foreground">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No se encontraron oportunidades con esos filtros</p>
                    </td>
                  </tr>
                ) : paged.map(op => {
                  const descuento = (op.valor_mercado && op.precio_orientativo && op.valor_mercado > 0)
                    ? Math.round((1 - op.precio_orientativo / op.valor_mercado) * 100)
                    : null;
                  const strategy = getOpStrategy(op);
                  const strategyConfig = {
                    npl: { label: "NPL", class: "bg-blue-100 text-blue-800 border-blue-200" },
                    cdr: { label: "CDR", class: "bg-purple-100 text-purple-800 border-purple-200" },
                    ocupado: { label: "Ocupado", class: "bg-orange-100 text-orange-800 border-orange-200" },
                  }[strategy] || { label: "NPL", class: "bg-blue-100 text-blue-800 border-blue-200" };

                  return (
                    <tr key={op.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                      <td className="p-3">
                        <p className="font-mono text-xs font-medium text-foreground">{op.asset_id || op.ref_catastral || op.id.slice(0, 8)}</p>
                        {descuento != null && descuento > 0 && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 text-green-700 border-green-300">
                            -{descuento}%
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-foreground">{op.municipio || "—"}</p>
                            <p className="text-[10px] text-muted-foreground">{op.provincia}{op.codigo_postal ? ` · ${op.codigo_postal}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">{op.tipo_activo || "—"}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${strategyConfig.class}`}>{strategyConfig.label}</Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{op.servicer || "—"}</td>
                      <td className="p-3 text-right">
                        <span className="text-xs font-semibold text-foreground tabular-nums">{fmtEur(op.precio_orientativo)}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-xs text-muted-foreground tabular-nums">{fmtEur(op.valor_mercado)}</span>
                      </td>
                      <td className="p-3 text-center">
                        <ScoreBadge score={op.score_inversion} />
                      </td>
                      <td className="p-3 text-right">
                        <MetricPill label="" value={op.roi_estimado} positive={op.roi_estimado != null && op.roi_estimado > 10} />
                      </td>
                      <td className="p-3 text-right">
                        <MetricPill label="" value={op.tir_estimada} positive={op.tir_estimada != null && op.tir_estimada > 8} />
                      </td>
                      <td className="p-3 text-center">
                        <RiskSemaphore riesgo={op.riesgo_judicial} liquidez={op.liquidez_score} />
                      </td>
                      <td className="p-3 text-center">
                        {op.publicado
                          ? <CheckCircle className="w-4 h-4 text-green-600 inline-block" />
                          : <XCircle className="w-4 h-4 text-muted-foreground/40 inline-block" />
                        }
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/npl/${op.id}`)}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          </>
        ) : (
          /* Map View */
          <AdminMapView data={filtered} onSelect={(id) => navigate(`/npl/${id}`)} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminOportunidadesPage;
