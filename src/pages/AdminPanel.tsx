import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SocialMediaManager from "@/components/SocialMediaManager";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import {
  BarChart3, Users, FileText, TrendingUp, Building2, Bell, Send,
  Search, ChevronDown, ChevronUp, Eye, Trash2, CheckCircle, XCircle,
  Clock, MessageCircle, Target, Activity, ArrowUpRight, ArrowDownRight,
  Zap, History, Share2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface KPIs {
  totalAssets: number;
  publishedAssets: number;
  totalUsers: number;
  totalOffers: number;
  pendingOffers: number;
  totalLeads: number;
  totalFavorites: number;
  totalAlerts: number;
  totalSubscribers: number;
  totalBroadcasts: number;
  avgLeadScore: number;
}

interface UserRow {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  persona_tipo: string | null;
  comunidad_autonoma: string | null;
  investor_level: string | null;
  lead_score: number | null;
  nda_signed: boolean;
  created_at: string;
  acepta_marketing: boolean;
  num_ofertas: number;
  num_favoritos: number;
}

interface OfferRow {
  id: string;
  property_id: string;
  property_reference: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  offer_amount: number;
  status: string;
  created_at: string;
}

interface BroadcastRow {
  id: string;
  channel: string;
  content: string;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "#6366f1", "#f59e0b"];

const AdminPanel = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [assetsByType, setAssetsByType] = useState<any[]>([]);
  const [assetsByProvince, setAssetsByProvince] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [offerFilter, setOfferFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [matchingAssetId, setMatchingAssetId] = useState("");
  const [matchingResult, setMatchingResult] = useState<number | null>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastChannel, setBroadcastChannel] = useState<"whatsapp" | "telegram" | "both">("both");
  const [broadcastSending, setBroadcastSending] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadKPIs(), loadUsers(), loadOffers(), loadBroadcasts(), loadChartData(), loadActivityLog()]);
    setLoading(false);
  };

  const loadKPIs = async () => {
    const [assets, published, usersRes, offersRes, pendingOffers, leadsRes, favsRes, alertsRes, subsRes, broadcastsRes, scoresRes] = await Promise.all([
      supabase.from("npl_assets").select("id", { count: "exact", head: true }),
      supabase.from("npl_assets").select("id", { count: "exact", head: true }).eq("publicado", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("offers").select("id", { count: "exact", head: true }),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("valuation_leads").select("id", { count: "exact", head: true }),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
      supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("channel_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("broadcast_messages").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("lead_score"),
    ]);

    const scores = (scoresRes.data || []).map((p: any) => p.lead_score || 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

    setKpis({
      totalAssets: assets.count || 0,
      publishedAssets: published.count || 0,
      totalUsers: usersRes.count || 0,
      totalOffers: offersRes.count || 0,
      pendingOffers: pendingOffers.count || 0,
      totalLeads: leadsRes.count || 0,
      totalFavorites: favsRes.count || 0,
      totalAlerts: alertsRes.count || 0,
      totalSubscribers: subsRes.count || 0,
      totalBroadcasts: broadcastsRes.count || 0,
      avgLeadScore: avgScore,
    });
  };

  const loadChartData = async () => {
    // Assets by type
    const { data: typeData } = await supabase.from("npl_assets").select("tipo_activo").eq("publicado", true);
    if (typeData) {
      const counts: Record<string, number> = {};
      typeData.forEach((a: any) => { counts[a.tipo_activo || "Sin tipo"] = (counts[a.tipo_activo || "Sin tipo"] || 0) + 1; });
      setAssetsByType(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })));
    }

    // Assets by province (top 10)
    const { data: provData } = await supabase.from("npl_assets").select("provincia").eq("publicado", true);
    if (provData) {
      const counts: Record<string, number> = {};
      provData.forEach((a: any) => { counts[a.provincia || "Sin provincia"] = (counts[a.provincia || "Sin provincia"] || 0) + 1; });
      setAssetsByProvince(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })));
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, phone, persona_tipo, comunidad_autonoma, investor_level, lead_score, nda_signed, created_at, acepta_marketing, num_ofertas, num_favoritos")
      .order("lead_score", { ascending: false })
      .limit(200);
    if (data) setUsers(data as unknown as UserRow[]);
  };

  const loadOffers = async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setOffers(data as unknown as OfferRow[]);
  };

  const loadBroadcasts = async () => {
    const { data } = await supabase
      .from("broadcast_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setBroadcasts(data as unknown as BroadcastRow[]);
  };

  const loadActivityLog = async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setActivityLog(data);
  };

  const runMatching = async () => {
    if (!matchingAssetId.trim()) {
      toast.error("Introduce el ID del activo");
      return;
    }
    setMatchingLoading(true);
    setMatchingResult(null);
    const { data, error } = await supabase.rpc("match_investors_to_asset", { p_asset_id: matchingAssetId.trim() });
    if (error) {
      toast.error("Error al ejecutar matching: " + error.message);
    } else {
      setMatchingResult(data as number);
      toast.success(`Matching completado: ${data} inversores encontrados`);
    }
    setMatchingLoading(false);
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) {
      toast.error("Escribe un mensaje para difundir");
      return;
    }
    setBroadcastSending(true);
    const channels = broadcastChannel === "both" ? ["telegram", "whatsapp"] : [broadcastChannel];
    let success = 0;
    let failed = 0;

    for (const ch of channels) {
      try {
        await supabase.from("broadcast_messages").insert({
          channel: ch as any,
          content: broadcastText.trim(),
          status: "sending",
        });

        if (ch === "telegram") {
          const { error } = await supabase.functions.invoke("telegram-bot", {
            body: { action: "broadcast", text: broadcastText.trim() },
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.functions.invoke("whatsapp-api", {
            body: { action: "broadcast", message: broadcastText.trim() },
          });
          if (error) throw error;
        }

        await supabase
          .from("broadcast_messages")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("content", broadcastText.trim())
          .eq("channel", ch as any)
          .eq("status", "sending");

        success++;
      } catch (e) {
        console.error(`Broadcast ${ch} failed:`, e);
        failed++;
        await supabase
          .from("broadcast_messages")
          .update({ status: "failed" })
          .eq("content", broadcastText.trim())
          .eq("channel", ch as any)
          .eq("status", "sending");
      }
    }

    if (success > 0) toast.success(`Difusión enviada a ${success} canal(es)`);
    if (failed > 0) toast.error(`${failed} canal(es) fallaron`);
    setBroadcastText("");
    setBroadcastSending(false);
    loadBroadcasts();
  };

  const updateOfferStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("offers").update({ status }).eq("id", id);
    if (error) toast.error("Error al actualizar oferta");
    else {
      toast.success(`Oferta ${status === "accepted" ? "aceptada" : "rechazada"}`);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.comunidad_autonoma || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOffers = offers.filter(o => offerFilter === "all" || o.status === offerFilter);

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

  const kpiCards = kpis ? [
    { label: "Activos totales", value: kpis.totalAssets, sub: `${kpis.publishedAssets} publicados`, icon: Building2, color: "text-primary" },
    { label: "Usuarios", value: kpis.totalUsers, sub: `Score medio: ${kpis.avgLeadScore}`, icon: Users, color: "text-accent" },
    { label: "Ofertas", value: kpis.totalOffers, sub: `${kpis.pendingOffers} pendientes`, icon: FileText, color: "text-destructive" },
    { label: "Leads valoración", value: kpis.totalLeads, sub: "Formulario valorador", icon: Target, color: "text-primary" },
    { label: "Favoritos", value: kpis.totalFavorites, sub: "Total guardados", icon: TrendingUp, color: "text-accent" },
    { label: "Alertas activas", value: kpis.totalAlerts, sub: "Usuarios con alertas", icon: Bell, color: "text-primary" },
    { label: "Suscriptores", value: kpis.totalSubscribers, sub: "WhatsApp + Telegram", icon: MessageCircle, color: "text-accent" },
    { label: "Broadcasts", value: kpis.totalBroadcasts, sub: "Mensajes enviados", icon: Send, color: "text-primary" },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestión integral del negocio IKESA</p>
          </div>
          <Button variant="outline" onClick={loadAll} className="gap-2">
            <Activity className="w-4 h-4" /> Actualizar datos
          </Button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value.toLocaleString("es-ES")}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl">
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Usuarios</TabsTrigger>
            <TabsTrigger value="offers" className="gap-2"><FileText className="w-4 h-4" /> Ofertas</TabsTrigger>
            <TabsTrigger value="charts" className="gap-2"><BarChart3 className="w-4 h-4" /> Gráficos</TabsTrigger>
            <TabsTrigger value="matching" className="gap-2"><Zap className="w-4 h-4" /> Matching</TabsTrigger>
            <TabsTrigger value="activity" className="gap-2"><History className="w-4 h-4" /> Actividad</TabsTrigger>
            <TabsTrigger value="broadcasts" className="gap-2"><Send className="w-4 h-4" /> Difusión</TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o CCAA..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
              </div>
              <Badge variant="secondary">{filteredUsers.length} usuarios</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 px-2 font-medium text-muted-foreground">Usuario</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">CCAA</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Nivel</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Score</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">NDA</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Ofertas</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Favs</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Marketing</th>
                    <th className="py-3 px-2 font-medium text-muted-foreground">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-2.5 px-2">
                        <p className="font-medium text-foreground">{u.display_name || "Sin nombre"}</p>
                        <p className="text-[10px] text-muted-foreground">{u.phone || "Sin teléfono"}</p>
                      </td>
                      <td className="py-2.5 px-2">
                        <Badge variant={u.persona_tipo === "juridica" ? "default" : "secondary"} className="text-[10px]">
                          {u.persona_tipo === "juridica" ? "Empresa" : "Particular"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2 text-xs">{u.comunidad_autonoma || "—"}</td>
                      <td className="py-2.5 px-2">
                        <Badge variant="outline" className="text-[10px]">{u.investor_level || "—"}</Badge>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`text-xs font-bold ${(u.lead_score || 0) >= 50 ? "text-primary" : "text-muted-foreground"}`}>
                          {u.lead_score || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        {u.nda_signed ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-muted-foreground/40" />}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-center">{u.num_ofertas || 0}</td>
                      <td className="py-2.5 px-2 text-xs text-center">{u.num_favoritos || 0}</td>
                      <td className="py-2.5 px-2 text-center">
                        {u.acepta_marketing ? <CheckCircle className="w-4 h-4 text-primary" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* OFFERS TAB */}
          <TabsContent value="offers">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2">
                {["all", "pending", "accepted", "rejected"].map((f) => (
                  <Button
                    key={f}
                    variant={offerFilter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOfferFilter(f)}
                    className="text-xs"
                  >
                    {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : f === "accepted" ? "Aceptadas" : "Rechazadas"}
                  </Button>
                ))}
              </div>
              <Badge variant="secondary">{filteredOffers.length} ofertas</Badge>
            </div>
            <div className="space-y-3">
              {filteredOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-accent">{offer.property_reference || offer.property_id}</span>
                        <Badge variant={offer.status === "pending" ? "secondary" : offer.status === "accepted" ? "default" : "destructive"} className="text-[10px]">
                          {offer.status === "pending" ? "Pendiente" : offer.status === "accepted" ? "Aceptada" : "Rechazada"}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{offer.full_name}</p>
                      <p className="text-xs text-muted-foreground">{offer.email} {offer.phone && `· ${offer.phone}`}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(offer.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{offer.offer_amount.toLocaleString("es-ES")} €</p>
                    </div>
                    {offer.status === "pending" && (
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" className="text-xs h-7 gap-1" onClick={() => updateOfferStatus(offer.id, "accepted")}>
                          <CheckCircle className="w-3 h-3" /> Aceptar
                        </Button>
                        <Button size="sm" variant="destructive" className="text-xs h-7 gap-1" onClick={() => updateOfferStatus(offer.id, "rejected")}>
                          <XCircle className="w-3 h-3" /> Rechazar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredOffers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay ofertas con este filtro</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CHARTS TAB */}
          <TabsContent value="charts">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Activos por tipo</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={assetsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                        {assetsByType.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Top 10 provincias</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assetsByProvince} layout="vertical">
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MATCHING TAB */}
          <TabsContent value="matching">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Ejecutar Matching Inversor-Activo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Introduce el ID de un activo para ejecutar el algoritmo de matching contra todos los inversores con NDA firmado. El sistema puntúa por zona geográfica (40%), tipo de activo (25%), rango de precio (20%) y nivel inversor (15%).
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="UUID del activo..."
                      value={matchingAssetId}
                      onChange={(e) => setMatchingAssetId(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={runMatching} disabled={matchingLoading} className="gap-2">
                      {matchingLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Ejecutar
                    </Button>
                  </div>
                  {matchingResult !== null && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                      <p className="text-sm font-semibold text-primary">
                        ✓ Matching completado: {matchingResult} inversores con score {">"}20 encontrados
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Criterios de puntuación</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Zona geográfica (CCAA + provincia)</span>
                      <span className="font-bold text-foreground">40 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tipo de activo preferido</span>
                      <span className="font-bold text-foreground">25 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rango de precio</span>
                      <span className="font-bold text-foreground">20 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Nivel inversor</span>
                      <span className="font-bold text-foreground">15 pts</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between items-center">
                      <span className="text-foreground font-semibold">Umbral mínimo</span>
                      <Badge variant="default">{">"}20 pts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ACTIVITY LOG TAB */}
          <TabsContent value="activity">
            <div className="space-y-3">
              {activityLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay actividad registrada</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left p-3 font-medium text-muted-foreground">Acción</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Entidad</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">ID Entidad</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Usuario</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((log: any) => (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                          </td>
                          <td className="p-3 text-foreground text-xs">{log.entity_type}</td>
                          <td className="p-3 text-muted-foreground text-xs font-mono">{log.entity_id?.slice(0, 8) || "—"}</td>
                          <td className="p-3 text-muted-foreground text-xs font-mono">{log.user_id?.slice(0, 8) || "Sistema"}</td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {new Date(log.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* BROADCASTS TAB */}
          <TabsContent value="broadcasts">
            <div className="space-y-6">
              {/* Composer */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-5 h-5" /> Enviar Difusión Manual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                    placeholder="Escribe el mensaje de difusión... Soporta *negrita* para WhatsApp y <b>negrita</b> para Telegram."
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">Canal:</span>
                    <div className="flex gap-2">
                      {(["both", "telegram", "whatsapp"] as const).map((ch) => (
                        <Button
                          key={ch}
                          variant={broadcastChannel === ch ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBroadcastChannel(ch)}
                          className="gap-1.5 text-xs"
                        >
                          {ch === "telegram" && <Send className="w-3.5 h-3.5" />}
                          {ch === "whatsapp" && <MessageCircle className="w-3.5 h-3.5" />}
                          {ch === "both" && <><Send className="w-3.5 h-3.5" /><MessageCircle className="w-3.5 h-3.5" /></>}
                          {ch === "both" ? "Ambos" : ch === "telegram" ? "Telegram" : "WhatsApp"}
                        </Button>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <span className="text-xs text-muted-foreground">{broadcastText.length} caracteres</span>
                    <Button
                      onClick={sendBroadcast}
                      disabled={broadcastSending || !broadcastText.trim()}
                      className="gap-2"
                    >
                      {broadcastSending ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Historial de difusiones</h3>
                {broadcasts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No se han enviado difusiones todavía</p>
                  </div>
                ) : broadcasts.map((b) => (
                  <Card key={b.id} className="mb-2">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        b.channel === "whatsapp" ? "bg-[#25D366]/15" : "bg-[#0088cc]/15"
                      }`}>
                        {b.channel === "whatsapp" ? <MessageCircle className="w-5 h-5 text-[#25D366]" /> : <Send className="w-5 h-5 text-[#0088cc]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">{b.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {b.sent_at ? new Date(b.sent_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sin enviar"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">{b.sent_count} enviados</p>
                        {(b.failed_count ?? 0) > 0 && <p className="text-xs text-destructive">{b.failed_count} fallidos</p>}
                        <Badge variant={b.status === "sent" ? "default" : b.status === "failed" ? "destructive" : "secondary"} className="text-[10px] mt-1">{b.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
