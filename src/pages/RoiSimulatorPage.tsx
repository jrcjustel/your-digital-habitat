import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Shield, Flame, Info, BarChart3, Clock, Euro } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ASSET_TYPES = [
  { value: "npl", label: "NPL — Crédito impagado" },
  { value: "cdr", label: "Cesión de Remate" },
  { value: "ocupado", label: "REO Ocupado" },
  { value: "reo_libre", label: "REO Libre / Vacío" },
];

const ITP_RATES: Record<string, number> = {
  "Andalucía": 7, "Aragón": 8, "Asturias": 8, "Baleares": 8, "Canarias": 6.5,
  "Cantabria": 10, "Castilla-La Mancha": 9, "Castilla y León": 8, "Cataluña": 10,
  "Extremadura": 8, "Galicia": 10, "Madrid": 6, "Murcia": 8, "Navarra": 6,
  "País Vasco": 4, "La Rioja": 7, "Valencia": 10,
};

const CCAA_LIST = Object.keys(ITP_RATES).sort();

interface Scenario {
  label: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  saleMultiplier: number;
  reformExtra: number;
  timelineMultiplier: number;
}

const SCENARIOS: Scenario[] = [
  { label: "Conservador", icon: Shield, color: "text-blue-600", bgColor: "bg-blue-50", saleMultiplier: 0.85, reformExtra: 1.3, timelineMultiplier: 1.4 },
  { label: "Moderado", icon: TrendingUp, color: "text-amber-600", bgColor: "bg-amber-50", saleMultiplier: 0.93, reformExtra: 1.0, timelineMultiplier: 1.0 },
  { label: "Optimista", icon: Flame, color: "text-emerald-600", bgColor: "bg-emerald-50", saleMultiplier: 1.0, reformExtra: 0.8, timelineMultiplier: 0.75 },
];

const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${n.toFixed(1)}%`;

const InfoTip = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline ml-1" />
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
  </Tooltip>
);

const RoiSimulatorPage = () => {
  const [purchasePrice, setPurchasePrice] = useState(80000);
  const [marketValue, setMarketValue] = useState(160000);
  const [reformCost, setReformCost] = useState(15000);
  const [legalCost, setLegalCost] = useState(5000);
  const [timelineMonths, setTimelineMonths] = useState(12);
  const [assetType, setAssetType] = useState("cdr");
  const [ccaa, setCcaa] = useState("Madrid");

  const itpRate = ITP_RATES[ccaa] || 7;
  const itpCost = purchasePrice * (itpRate / 100);
  const notaryCost = Math.min(Math.max(purchasePrice * 0.005, 300), 1200);
  const registryCost = Math.min(Math.max(purchasePrice * 0.003, 200), 800);

  const scenarios = useMemo(() => {
    return SCENARIOS.map((s) => {
      const totalReformCost = reformCost * s.reformExtra;
      const totalInvestment = purchasePrice + itpCost + notaryCost + registryCost + legalCost + totalReformCost;
      const salePrice = marketValue * s.saleMultiplier;
      const sellingCosts = salePrice * 0.03; // agency + taxes on sale
      const netProfit = salePrice - totalInvestment - sellingCosts;
      const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
      const adjustedTimeline = Math.round(timelineMonths * s.timelineMultiplier);
      const annualizedRoi = adjustedTimeline > 0 ? (roi / adjustedTimeline) * 12 : 0;

      return {
        ...s,
        totalInvestment,
        salePrice,
        sellingCosts,
        netProfit,
        roi,
        adjustedTimeline,
        annualizedRoi,
        costBreakdown: [
          { name: "Adquisición", value: purchasePrice },
          { name: "ITP", value: Math.round(itpCost) },
          { name: "Notaría+Reg.", value: Math.round(notaryCost + registryCost) },
          { name: "Legal", value: legalCost },
          { name: "Reforma", value: Math.round(totalReformCost) },
        ],
      };
    });
  }, [purchasePrice, marketValue, reformCost, legalCost, timelineMonths, itpCost, notaryCost, registryCost]);

  const barChartData = scenarios.map((s) => ({
    name: s.label,
    "Inversión total": Math.round(s.totalInvestment),
    "Precio venta": Math.round(s.salePrice),
    "Beneficio neto": Math.round(s.netProfit),
  }));

  const roiChartData = scenarios.map((s) => ({
    name: s.label,
    ROI: parseFloat(s.roi.toFixed(1)),
    "ROI anualizado": parseFloat(s.annualizedRoi.toFixed(1)),
  }));

  const timelineChartData = scenarios.map((s, i) => ({
    name: s.label,
    Meses: s.adjustedTimeline,
    fill: ["hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)"][i],
  }));

  const discount = marketValue > 0 ? ((marketValue - purchasePrice) / marketValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Simulador ROI — Calcula la rentabilidad de tu inversión | IKESA"
        description="Simula el retorno de inversión en activos distressed: NPL, cesiones de remate, inmuebles ocupados y REO. Tres escenarios con desglose de costes."
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-accent/20 rounded-xl">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Herramientas de inversión</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Simulador de ROI</h1>
          <p className="text-primary-foreground/75 text-base md:text-lg max-w-2xl">
            Introduce los datos de tu operación y obtén una proyección en tres escenarios: conservador, moderado y optimista. 
            Incluye desglose de costes de adquisición con ITP por comunidad autónoma.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Inputs */}
        <Card className="mb-8 border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="w-5 h-5 text-accent" />
              Datos de la operación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Asset type */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tipo de activo
                </Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CCAA */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Comunidad Autónoma <InfoTip text={`El ITP varía según la CCAA. ${ccaa}: ${itpRate}%`} />
                </Label>
                <Select value={ccaa} onValueChange={setCcaa}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CCAA_LIST.map((c) => (
                      <SelectItem key={c} value={c}>{c} ({ITP_RATES[c]}% ITP)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Purchase price */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Precio de adquisición <InfoTip text="Precio que pagas por el activo o crédito" />
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Market value */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor de mercado estimado <InfoTip text="Valor estimado del inmueble libre y reformado" />
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={marketValue}
                  onChange={(e) => setMarketValue(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Reform */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Coste reforma estimado
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={reformCost}
                  onChange={(e) => setReformCost(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Legal */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Costes legales <InfoTip text="Abogado, procurador, tasas judiciales" />
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={legalCost}
                  onChange={(e) => setLegalCost(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plazo estimado (meses): {timelineMonths}
                  <InfoTip text="Meses desde la compra hasta la venta. Se ajusta en cada escenario." />
                </Label>
                <Slider
                  value={[timelineMonths]}
                  onValueChange={([v]) => setTimelineMonths(v)}
                  min={3}
                  max={48}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>3 meses</span>
                  <span>48 meses</span>
                </div>
              </div>
            </div>

            {/* Quick KPIs */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Descuento</p>
                <p className="text-lg font-bold text-foreground">{pct(discount)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">ITP ({ccaa})</p>
                <p className="text-lg font-bold text-foreground">{fmt(itpCost)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Notaría + Registro</p>
                <p className="text-lg font-bold text-foreground">{fmt(notaryCost + registryCost)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Costes adquisición total</p>
                <p className="text-lg font-bold text-foreground">{fmt(purchasePrice + itpCost + notaryCost + registryCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {scenarios.map((s, i) => {
            const Icon = s.icon;
            const isProfit = s.netProfit > 0;
            return (
              <Card key={s.label} className={`border-border shadow-sm overflow-hidden`}>
                <div className={`${s.bgColor} px-4 py-3 flex items-center gap-2 border-b border-border`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                  <span className={`font-semibold text-sm ${s.color}`}>{s.label}</span>
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inversión total</span>
                    <span className="font-semibold text-foreground">{fmt(s.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio venta</span>
                    <span className="font-semibold text-foreground">{fmt(s.salePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Costes venta (~3%)</span>
                    <span className="font-semibold text-foreground">-{fmt(s.sellingCosts)}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">Beneficio neto</span>
                    <span className={`font-bold ${isProfit ? "text-emerald-600" : "text-destructive"}`}>
                      {fmt(s.netProfit)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wider">ROI</p>
                      <p className={`text-base font-bold ${isProfit ? "text-emerald-600" : "text-destructive"}`}>
                        {pct(s.roi)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wider">ROI anual.</p>
                      <p className={`text-base font-bold ${isProfit ? "text-emerald-600" : "text-destructive"}`}>
                        {pct(s.annualizedRoi)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{s.adjustedTimeline} meses estimados</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar chart - investment vs sale vs profit */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                Comparativa por escenario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip formatter={(value: number) => fmt(value)} />
                  <Bar dataKey="Inversión total" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Precio venta" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Beneficio neto" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ROI chart */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                ROI por escenario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={roiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="ROI" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROI anualizado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cost breakdown per scenario */}
        <Card className="border-border shadow-sm mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Euro className="w-4 h-4 text-accent" />
              Desglose de costes — Escenario Moderado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={scenarios[1].costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${fmt(value)}`}
                  labelLine={false}
                >
                  {scenarios[1].costBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={[
                        "hsl(var(--primary))",
                        "hsl(var(--accent))",
                        "hsl(var(--muted-foreground))",
                        "hsl(38,92%,50%)",
                        "hsl(142,71%,45%)",
                      ][idx]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => fmt(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed mb-4">
          <p className="font-semibold text-foreground mb-1">⚠️ Aviso importante</p>
          <p>
            Este simulador ofrece proyecciones orientativas con fines educativos. Los resultados no constituyen asesoramiento
            financiero ni garantía de rentabilidad. Cada operación tiene variables únicas que pueden alterar significativamente
            el resultado. Consulta siempre con profesionales cualificados antes de invertir. Los tipos de ITP pueden variar
            según el tipo de inmueble y las bonificaciones aplicables en cada comunidad autónoma.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoiSimulatorPage;
