import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Building2, Users,
  FileText, Target, BarChart3, Activity,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";

interface Snapshot {
  snapshot_date: string;
  total_assets: number;
  published_assets: number;
  total_users: number;
  total_offers: number;
  pending_offers: number;
  total_leads: number;
  total_subscribers: number;
  avg_lead_score: number;
  conversion_rate: number;
  assets_by_type: Record<string, number>;
  assets_by_province: Record<string, number>;
}

const AnalyticsTrends = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSnapshots = async () => {
    const { data, error } = await supabase
      .from("analytics_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: true })
      .limit(30);

    if (!error && data) {
      setSnapshots(data as unknown as Snapshot[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSnapshots(); }, []);

  const triggerSnapshot = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("scheduled-tasks", {
        body: { task: "analytics_snapshot" },
      });
      if (error) throw error;
      toast.success("Snapshot generado correctamente");
      await fetchSnapshots();
    } catch {
      toast.error("Error generando snapshot");
    }
    setRefreshing(false);
  };

  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots[snapshots.length - 2];

  const trend = (curr?: number, previous?: number) => {
    if (!curr || !previous) return { icon: Minus, color: "text-muted-foreground", delta: 0 };
    const d = curr - previous;
    if (d > 0) return { icon: TrendingUp, color: "text-[hsl(142,71%,45%)]", delta: d };
    if (d < 0) return { icon: TrendingDown, color: "text-destructive", delta: d };
    return { icon: Minus, color: "text-muted-foreground", delta: 0 };
  };

  const kpis = latest ? [
    { label: "Activos Publicados", value: latest.published_assets, prev: prev?.published_assets, icon: Building2 },
    { label: "Usuarios", value: latest.total_users, prev: prev?.total_users, icon: Users },
    { label: "Ofertas", value: latest.total_offers, prev: prev?.total_offers, icon: FileText },
    { label: "Leads Valorador", value: latest.total_leads, prev: prev?.total_leads, icon: Target },
    { label: "Suscriptores", value: latest.total_subscribers, prev: prev?.total_subscribers, icon: Activity },
    { label: "Lead Score Medio", value: latest.avg_lead_score, prev: prev?.avg_lead_score, icon: BarChart3 },
  ] : [];

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando tendencias...</div>;

  if (!snapshots.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay snapshots aún. Genera el primero para empezar a trackear tendencias.</p>
        <Button onClick={triggerSnapshot} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Generar Snapshot
        </Button>
      </div>
    );
  }

  const chartData = snapshots.map(s => ({
    date: new Date(s.snapshot_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    usuarios: s.total_users,
    ofertas: s.total_offers,
    leads: s.total_leads,
    activos: s.published_assets,
    conversion: s.conversion_rate,
    leadScore: s.avg_lead_score,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Tendencias Históricas</h3>
          <p className="text-sm text-muted-foreground">{snapshots.length} snapshots registrados</p>
        </div>
        <Button onClick={triggerSnapshot} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar ahora
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => {
          const t = trend(kpi.value, kpi.prev);
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">{kpi.value?.toLocaleString("es-ES")}</span>
                  {t.delta !== 0 && (
                    <Badge variant="outline" className={`text-xs ${t.color}`}>
                      {t.delta > 0 ? "+" : ""}{t.delta}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Crecimiento de Usuarios y Leads</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Usuarios" />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Ofertas y Conversión</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="ofertas" stroke="hsl(var(--primary))" name="Ofertas" strokeWidth={2} />
                <Line type="monotone" dataKey="conversion" stroke="hsl(142, 71%, 45%)" name="Conversión %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Lead Score Medio</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="leadScore" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.15)" name="Lead Score" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Activos Publicados</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="activos" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Activos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Latest distribution */}
      {latest?.assets_by_type && Object.keys(latest.assets_by_type).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Distribución por Tipo (último snapshot)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(latest.assets_by_type)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([tipo, count]) => (
                  <Badge key={tipo} variant="secondary" className="text-xs">
                    {tipo}: {(count as number).toLocaleString("es-ES")}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsTrends;
