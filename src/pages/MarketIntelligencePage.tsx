import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, Legend, PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, BarChart3, Clock, Shield, Building2, MapPin,
  AlertTriangle, Info, CreditCard, Gavel, Home, Scale,
} from "lucide-react";

/* ─── Static market data (educational, no DB) ─── */

const MARKET_VOLUME = [
  { year: "2018", volumen: 42000 },
  { year: "2019", volumen: 38000 },
  { year: "2020", volumen: 28000 },
  { year: "2021", volumen: 35000 },
  { year: "2022", volumen: 31000 },
  { year: "2023", volumen: 27000 },
  { year: "2024", volumen: 24000 },
  { year: "2025", volumen: 22000 },
];

const DISCOUNTS_BY_TYPE = [
  { tipo: "NPL", min: 40, max: 70, media: 55 },
  { tipo: "CDR", min: 30, max: 50, media: 40 },
  { tipo: "REO Ocupado", min: 35, max: 55, media: 45 },
  { tipo: "REO Libre", min: 10, max: 25, media: 17 },
];

const JUDICIAL_TIMELINES = [
  { ccaa: "Madrid", ejecucion: 18, desahucio: 14, cesion: 6 },
  { ccaa: "Cataluña", ejecucion: 24, desahucio: 18, cesion: 8 },
  { ccaa: "Andalucía", ejecucion: 22, desahucio: 16, cesion: 7 },
  { ccaa: "Valencia", ejecucion: 20, desahucio: 15, cesion: 7 },
  { ccaa: "País Vasco", ejecucion: 16, desahucio: 12, cesion: 5 },
  { ccaa: "Galicia", ejecucion: 19, desahucio: 14, cesion: 6 },
  { ccaa: "Canarias", ejecucion: 26, desahucio: 20, cesion: 9 },
  { ccaa: "Baleares", ejecucion: 21, desahucio: 15, cesion: 7 },
];

const RISK_RETURN_DATA = [
  { name: "REO Libre", riesgo: 15, retorno: 18, size: 600, color: "hsl(142,71%,45%)" },
  { name: "CDR", riesgo: 40, retorno: 38, size: 700, color: "hsl(38,92%,50%)" },
  { name: "REO Ocupado", riesgo: 65, retorno: 45, size: 650, color: "hsl(217,91%,60%)" },
  { name: "NPL", riesgo: 75, retorno: 60, size: 750, color: "hsl(0,84%,60%)" },
];

const RADAR_DATA = [
  { factor: "Descuento", NPL: 90, CDR: 65, Ocupado: 75, REO: 30 },
  { factor: "Velocidad", NPL: 25, CDR: 70, Ocupado: 30, REO: 90 },
  { factor: "Simplicidad", NPL: 20, CDR: 55, Ocupado: 25, REO: 85 },
  { factor: "Liquidez salida", NPL: 50, CDR: 65, Ocupado: 45, REO: 80 },
  { factor: "Escalabilidad", NPL: 80, CDR: 50, Ocupado: 60, REO: 40 },
  { factor: "Control riesgo", NPL: 30, CDR: 60, Ocupado: 35, REO: 85 },
];

const SERVICERS = [
  { name: "Servihabitat", carteras: "CaixaBank", activos: "~45.000" },
  { name: "Aliseda", carteras: "Santander", activos: "~38.000" },
  { name: "Hipoges", carteras: "Fondos internacionales", activos: "~30.000" },
  { name: "Anticipa", carteras: "Blackstone / Cerberus", activos: "~25.000" },
  { name: "Axactor", carteras: "Fondos nórdicos", activos: "~12.000" },
  { name: "doValue", carteras: "Carteras italianas/españolas", activos: "~15.000" },
];

const EXIT_STRATEGIES = [
  { strategy: "Venta directa", roi: "15-30%", plazo: "3-6 meses", riesgo: "Bajo", tipos: ["REO Libre", "CDR"] },
  { strategy: "Reforma + venta", roi: "25-45%", plazo: "6-12 meses", riesgo: "Medio", tipos: ["CDR", "REO Ocupado"] },
  { strategy: "Alquiler (yield)", roi: "5-8% anual", plazo: "Indefinido", riesgo: "Bajo", tipos: ["REO Libre", "CDR"] },
  { strategy: "Negociación deudor", roi: "40-80%", plazo: "6-18 meses", riesgo: "Alto", tipos: ["NPL"] },
  { strategy: "Ejecución + venta", roi: "30-60%", plazo: "12-36 meses", riesgo: "Alto", tipos: ["NPL", "REO Ocupado"] },
];

const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{d.name}</p>
      <p className="text-muted-foreground">Riesgo: {d.riesgo}/100</p>
      <p className="text-muted-foreground">Retorno típico: {d.retorno}%</p>
    </div>
  );
};

const MarketIntelligencePage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Inteligencia de Mercado — Datos del mercado distressed español | IKESA"
      description="Datos del mercado de activos distressed en España: volumen, descuentos típicos, plazos judiciales por CCAA, matriz riesgo-retorno y estrategias de salida."
    />
    <Navbar />

    {/* Hero */}
    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-accent/20 rounded-xl">
            <BarChart3 className="w-6 h-6 text-accent" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Inteligencia de mercado</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Market Intelligence</h1>
        <p className="text-primary-foreground/75 text-base md:text-lg max-w-3xl">
          Datos agregados del mercado de activos distressed en España. Descuentos típicos, plazos judiciales por comunidad
          autónoma, matriz de riesgo-retorno y estrategias de salida para cada tipo de activo.
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Visión general</TabsTrigger>
          <TabsTrigger value="timelines">Plazos judiciales</TabsTrigger>
          <TabsTrigger value="risk">Riesgo-Retorno</TabsTrigger>
          <TabsTrigger value="exit">Estrategias salida</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Overview ── */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Stock distressed estimado", value: "~150.000", sub: "activos en España", icon: Building2 },
              { label: "Descuento medio NPL", value: "40-70%", sub: "sobre deuda pendiente", icon: CreditCard },
              { label: "Plazo medio ejecución", value: "18-36 meses", sub: "media nacional", icon: Clock },
              { label: "Servicers activos", value: "6+", sub: "principales operadores", icon: Scale },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border shadow-sm">
                <CardContent className="pt-4 pb-4">
                  <kpi.icon className="w-5 h-5 text-accent mb-2" />
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider mt-0.5">{kpi.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Volume chart */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Evolución del volumen de transacciones distressed (miles de activos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MARKET_VOLUME} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RTooltip formatter={(v: number) => `${fmt(v)} activos`} />
                  <Bar dataKey="volumen" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Discounts by type */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                Descuentos típicos por tipo de activo (% sobre valor de mercado/deuda)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DISCOUNTS_BY_TYPE.map((d) => (
                  <div key={d.tipo}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{d.tipo}</span>
                      <span className="text-sm text-muted-foreground">{d.min}% – {d.max}% <span className="text-foreground font-semibold">(media {d.media}%)</span></span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-accent/30 rounded-full"
                        style={{ left: `${d.min}%`, width: `${d.max - d.min}%` }}
                      />
                      <div
                        className="absolute h-full w-1 bg-accent rounded-full"
                        style={{ left: `${d.media}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Servicers table */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" />
                Principales servicers en España
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs uppercase text-muted-foreground tracking-wider">Servicer</th>
                      <th className="text-left py-2 text-xs uppercase text-muted-foreground tracking-wider">Carteras principales</th>
                      <th className="text-right py-2 text-xs uppercase text-muted-foreground tracking-wider">Activos est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SERVICERS.map((s) => (
                      <tr key={s.name} className="border-b border-border/50">
                        <td className="py-2.5 font-medium text-foreground">{s.name}</td>
                        <td className="py-2.5 text-muted-foreground">{s.carteras}</td>
                        <td className="py-2.5 text-right text-foreground">{s.activos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Judicial Timelines ── */}
        <TabsContent value="timelines" className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Plazos judiciales medios por Comunidad Autónoma (meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={JUDICIAL_TIMELINES} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" unit=" m" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="ccaa" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={75} />
                  <RTooltip formatter={(v: number) => `${v} meses`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ejecucion" name="Ejecución hipotecaria" fill="hsl(0,84%,60%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="desahucio" name="Desahucio" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="cesion" name="Cesión remate" fill="hsl(142,71%,45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table view */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Detalle por CCAA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs uppercase text-muted-foreground tracking-wider">CCAA</th>
                      <th className="text-center py-2 text-xs uppercase text-muted-foreground tracking-wider">Ejecución</th>
                      <th className="text-center py-2 text-xs uppercase text-muted-foreground tracking-wider">Desahucio</th>
                      <th className="text-center py-2 text-xs uppercase text-muted-foreground tracking-wider">Cesión remate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JUDICIAL_TIMELINES.map((t) => (
                      <tr key={t.ccaa} className="border-b border-border/50">
                        <td className="py-2.5 font-medium text-foreground">{t.ccaa}</td>
                        <td className="py-2.5 text-center">
                          <Badge variant="secondary" className="text-xs">{t.ejecucion} meses</Badge>
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge variant="secondary" className="text-xs">{t.desahucio} meses</Badge>
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge className="text-xs bg-accent text-accent-foreground">{t.cesion} meses</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Risk-Return ── */}
        <TabsContent value="risk" className="space-y-6">
          {/* Scatter plot */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Matriz Riesgo vs Retorno por tipo de activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="riesgo" type="number" name="Riesgo" unit="/100"
                    tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Riesgo →", position: "bottom", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    dataKey="retorno" type="number" name="Retorno" unit="%"
                    tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Retorno ↑", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <RTooltip content={<CustomScatterTooltip />} />
                  <Scatter data={RISK_RETURN_DATA} name="Activos">
                    {RISK_RETURN_DATA.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {RISK_RETURN_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Radar chart */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                Perfil comparativo por dimensiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Radar name="NPL" dataKey="NPL" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.15} />
                  <Radar name="CDR" dataKey="CDR" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.15} />
                  <Radar name="Ocupado" dataKey="Ocupado" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.15} />
                  <Radar name="REO" dataKey="REO" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Exit Strategies ── */}
        <TabsContent value="exit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXIT_STRATEGIES.map((e) => (
              <Card key={e.strategy} className="border-border shadow-sm">
                <CardContent className="pt-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{e.strategy}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wider">ROI típico</p>
                      <p className="text-sm font-bold text-foreground">{e.roi}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Plazo</p>
                      <p className="text-sm font-bold text-foreground">{e.plazo}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Riesgo</p>
                      <p className={`text-sm font-bold ${e.riesgo === "Bajo" ? "text-emerald-600" : e.riesgo === "Medio" ? "text-amber-600" : "text-red-600"}`}>
                        {e.riesgo}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {e.tipos.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-1">⚠️ Aviso importante</p>
            <p>
              Los datos presentados son estimaciones basadas en información pública y estadísticas del sector con fines
              educativos. No constituyen asesoramiento financiero. Los plazos judiciales, descuentos y rentabilidades pueden
              variar significativamente según el caso concreto, la ubicación y las circunstancias del mercado.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <Footer />
  </div>
);

export default MarketIntelligencePage;
