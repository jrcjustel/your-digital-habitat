import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Target, TrendingUp, Shield, AlertTriangle, BarChart3, Calculator,
  CheckCircle2, XCircle, ArrowRight, Info, Zap, DollarSign, Clock,
  CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ScatterChart, Scatter, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  analyzeInvestment,
  type InvestmentInput, type InvestmentResult,
  type AssetType, type JudicialPhaseType, type OccupancyRisk,
} from "@/lib/investmentAnalysis";

const PROVINCES = [
  "Madrid", "Barcelona", "Málaga", "Valencia", "Sevilla", "Alicante",
  "Cádiz", "Granada", "Zaragoza", "Murcia", "Bilbao", "Palma de Mallorca",
  "Las Palmas", "Valladolid", "Salamanca", "Córdoba", "Toledo", "Otra",
];

const defaultInput: InvestmentInput = {
  salePrice: 65000,
  marketValue: 120000,
  judicialCosts: 4000,
  evictionCosts: 3000,
  reformCosts: 15000,
  estimatedMonths: 12,
  occupancyRisk: "medio",
  judicialPhase: "ejecucion",
  hasLitigations: false,
  hasPriorCharges: false,
  assetType: "npl",
  province: "Madrid",
  monthlyRentEstimate: 650,
};

const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const InvestmentAnalysisPage = () => {
  const [input, setInput] = useState<InvestmentInput>(defaultInput);
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => analyzeInvestment(input), [input]);

  const handleCalculate = () => setShowResults(true);

  const update = (key: keyof InvestmentInput, value: any) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const numField = (key: keyof InvestmentInput, label: string, placeholder?: string, suffix?: string) => (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={input[key] as number}
          onChange={e => update(key, Number(e.target.value))}
          placeholder={placeholder}
          className="pr-8"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );

  const trafficLightColors: Record<string, string> = {
    verde: "bg-[hsl(142,71%,45%)]",
    amarillo: "bg-[hsl(48,90%,50%)]",
    rojo: "bg-destructive",
  };

  const riskColors: Record<string, string> = {
    bajo: "text-[hsl(142,71%,45%)]",
    medio: "text-[hsl(48,90%,50%)]",
    alto: "text-destructive",
  };

  // Chart data
  const costChartData = showResults ? [
    { name: "Adquisición", value: result.costBreakdown.acquisition },
    { name: "Impuestos", value: result.costBreakdown.taxes },
    { name: "Judiciales", value: result.costBreakdown.judicial },
    { name: "Lanzamiento", value: result.costBreakdown.eviction },
    { name: "Reforma", value: result.costBreakdown.reform },
    { name: "Otros", value: result.costBreakdown.other },
  ] : [];

  const strategyChartData = showResults ? result.strategies.map(s => ({
    name: s.label,
    roi: s.roi,
    meses: s.timeMonths,
    beneficio: s.netProfit,
  })) : [];

  const riskRadarData = showResults ? result.riskFactors.map(f => ({
    factor: f.factor,
    impacto: f.impact,
    max: 30,
  })) : [];

  const comparisonData = showResults ? [
    { name: "Precio compra", tuyo: input.salePrice, mercado: input.marketValue },
    { name: "Inversión total", tuyo: result.totalInvestment, mercado: input.marketValue },
    { name: "Precio recomendado", tuyo: result.recommendedPrice, mercado: input.marketValue },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Análisis de Inversión Inmobiliaria | IKESA — Calculadora ROI Profesional"
        description="Calcula el ROI, riesgo y precio recomendado de cualquier activo inmobiliario: subastas BOE, NPL, cesiones de remate. Herramienta profesional gratuita."
        canonical="/analisis-inversion"
      />
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 text-xs">Herramienta Profesional</Badge>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Análisis de Inversión Inmobiliaria
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Introduce los datos del activo y obtén un análisis completo: ROI esperado, precio recomendado de compra,
            nivel de riesgo, estrategias de salida y gráficos interactivos.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ─── INPUT FORM ─── */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-accent" /> Datos del Activo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de activo</Label>
                    <Select value={input.assetType} onValueChange={v => update("assetType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subasta">Subasta BOE</SelectItem>
                        <SelectItem value="npl">NPL / Crédito</SelectItem>
                        <SelectItem value="cesion-remate">Cesión de Remate</SelectItem>
                        <SelectItem value="ocupado">Inmueble Ocupado</SelectItem>
                        <SelectItem value="libre">Inmueble Libre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Provincia</Label>
                    <Select value={input.province} onValueChange={v => update("province", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financiero</p>

                <div className="grid grid-cols-2 gap-3">
                  {numField("salePrice", "Precio / Deuda", "65000", "€")}
                  {numField("marketValue", "Valor de mercado", "120000", "€")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {numField("judicialCosts", "Costes judiciales", "4000", "€")}
                  {numField("evictionCosts", "Coste lanzamiento", "3000", "€")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {numField("reformCosts", "Coste reforma", "15000", "€")}
                  {numField("monthlyRentEstimate", "Alquiler mensual est.", "650", "€")}
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Riesgo y plazos</p>

                <div className="grid grid-cols-2 gap-3">
                  {numField("estimatedMonths", "Plazo venta (meses)", "12", "m")}
                  <div>
                    <Label className="text-xs text-muted-foreground">Fase judicial</Label>
                    <Select value={input.judicialPhase} onValueChange={v => update("judicialPhase", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-demanda">Pre-demanda</SelectItem>
                        <SelectItem value="demanda">Demanda</SelectItem>
                        <SelectItem value="ejecucion">Ejecución</SelectItem>
                        <SelectItem value="subasta">Subasta</SelectItem>
                        <SelectItem value="adjudicacion">Adjudicación</SelectItem>
                        <SelectItem value="posesion">Posesión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Riesgo ocupación</Label>
                  <Select value={input.occupancyRisk} onValueChange={v => update("occupancyRisk", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libre">Libre</SelectItem>
                      <SelectItem value="bajo">Bajo</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">¿Litigios activos?</Label>
                    <Switch checked={input.hasLitigations} onCheckedChange={v => update("hasLitigations", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">¿Cargas previas?</Label>
                    <Switch checked={input.hasPriorCharges} onCheckedChange={v => update("hasPriorCharges", v)} />
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleCalculate}>
                  <Zap className="w-4 h-4 mr-2" /> Analizar inversión
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ─── RESULTS ─── */}
          <div className="lg:col-span-3 space-y-5">
            {!showResults ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="py-20 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Introduce los datos y pulsa "Analizar inversión"</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Obtendrás ROI, riesgo, precio recomendado y gráficos interactivos</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Traffic light + Score */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Semáforo */}
                  <Card className="border-border/60">
                    <CardContent className="p-5 text-center">
                      <div className="flex justify-center gap-2 mb-3">
                        {(["verde", "amarillo", "rojo"] as const).map(c => (
                          <div key={c} className={`w-5 h-5 rounded-full ${result.trafficLight === c ? trafficLightColors[c] : "bg-muted"} transition-all ${result.trafficLight === c ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-accent" : "opacity-40"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Semáforo</p>
                      <p className={`text-sm font-bold capitalize ${result.trafficLight === "verde" ? "text-[hsl(142,71%,45%)]" : result.trafficLight === "rojo" ? "text-destructive" : "text-[hsl(48,90%,50%)]"}`}>
                        {result.trafficLight === "verde" ? "Favorable" : result.trafficLight === "rojo" ? "No recomendado" : "Con precaución"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Score */}
                  <Card className="border-border/60">
                    <CardContent className="p-5 text-center">
                      <p className="text-3xl font-bold text-accent">{result.investmentScore}</p>
                      <p className="text-xs text-muted-foreground">/100 Scoring</p>
                    </CardContent>
                  </Card>

                  {/* ROI */}
                  <Card className="border-border/60">
                    <CardContent className="p-5 text-center">
                      <p className={`text-3xl font-bold ${result.roi >= 15 ? "text-[hsl(142,71%,45%)]" : result.roi >= 5 ? "text-accent" : "text-destructive"}`}>{result.roi}%</p>
                      <p className="text-xs text-muted-foreground">ROI esperado</p>
                    </CardContent>
                  </Card>

                  {/* Risk */}
                  <Card className="border-border/60">
                    <CardContent className="p-5 text-center">
                      <p className={`text-3xl font-bold capitalize ${riskColors[result.riskLevel]}`}>
                        {result.riskLevel}
                      </p>
                      <p className="text-xs text-muted-foreground">Nivel de riesgo</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard icon={DollarSign} label="Precio recomendado" value={fmt(result.recommendedPrice)} />
                  <MetricCard icon={Shield} label="Margen seguridad" value={`${result.safetyMargin}%`} />
                  <MetricCard icon={TrendingUp} label="Descuento s/mercado" value={`${result.discount}%`} />
                  <MetricCard icon={Clock} label="Inversión total" value={fmt(result.totalInvestment)} />
                </div>

                {/* Explanation */}
                <Card className="border-accent/20 bg-accent/5">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-accent" /> Análisis para el inversor
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">{result.explanation}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.pros.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[hsl(142,71%,45%)] mb-2 uppercase tracking-wider">Ventajas</p>
                          {result.pros.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(142,71%,45%)] mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground/70">{p}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.cons.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-destructive mb-2 uppercase tracking-wider">Riesgos</p>
                          {result.cons.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                              <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground/70">{c}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Tabs */}
                <Tabs defaultValue="strategies" className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="strategies">Estrategias</TabsTrigger>
                    <TabsTrigger value="costs">Costes</TabsTrigger>
                    <TabsTrigger value="sensitivity">Sensibilidad</TabsTrigger>
                    <TabsTrigger value="risk">Riesgo</TabsTrigger>
                  </TabsList>

                  {/* Strategies */}
                  <TabsContent value="strategies" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">ROI por Estrategia de Salida</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={strategyChartData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                              <Tooltip
                                formatter={(value: number, name: string) => {
                                  if (name === "roi") return [`${value}%`, "ROI"];
                                  return [value, name];
                                }}
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                              />
                              <Bar dataKey="roi" radius={[0, 6, 6, 0]}>
                                {strategyChartData.map((entry, i) => (
                                  <Cell key={i} fill={entry.roi > 15 ? "hsl(142,71%,45%)" : entry.roi > 5 ? "hsl(var(--accent))" : entry.roi > 0 ? "hsl(48,90%,50%)" : "hsl(var(--destructive))"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {result.strategies.map((s, i) => (
                            <div key={i} className={`p-3 rounded-xl border ${s.strategy === result.bestStrategy ? "border-accent bg-accent/5" : "border-border"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                {s.strategy === result.bestStrategy && <Badge className="bg-accent text-[10px] py-0">Mejor</Badge>}
                                <span className="text-xs font-semibold text-foreground">{s.label}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>ROI: <strong className="text-foreground">{s.roi}%</strong></span>
                                <span>{s.timeMonths} meses</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Beneficio: {fmt(s.netProfit)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Costs */}
                  <TabsContent value="costs" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Comparativa con Mercado & Desglose de Costes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                              <Tooltip
                                formatter={(value: number) => [fmt(value)]}
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                              />
                              <Legend />
                              <Bar dataKey="tuyo" name="Tu inversión" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="mercado" name="Valor mercado" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-3 gap-2">
                          {costChartData.filter(c => c.value > 0).map((c, i) => (
                            <div key={i} className="text-center p-2 bg-secondary/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">{c.name}</p>
                              <p className="text-sm font-bold text-foreground">{fmt(c.value)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sensitivity */}
                  <TabsContent value="sensitivity" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Sensibilidad: ROI vs Descuento sobre Mercado</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.sensitivityData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="discountPercent" tick={{ fontSize: 11 }} unit="%" label={{ value: "Descuento %", position: "insideBottom", offset: -2, fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} unit="%" />
                              <Tooltip
                                formatter={(value: number, name: string) => {
                                  if (name === "roi") return [`${value}%`, "ROI"];
                                  if (name === "safetyMargin") return [`${value}%`, "Margen seguridad"];
                                  return [fmt(value as number), "Beneficio neto"];
                                }}
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                              />
                              <Legend />
                              <Area type="monotone" dataKey="roi" name="ROI %" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
                              <Area type="monotone" dataKey="safetyMargin" name="Margen seguridad %" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <CircleDot className="w-3 h-3 text-accent" />
                          Tu descuento actual: <strong>{result.discount}%</strong> — ROI: <strong>{result.roi}%</strong>
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Risk */}
                  <TabsContent value="risk" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Mapa de Riesgo ({result.riskScore}/100)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {riskRadarData.length > 0 ? (
                          <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={riskRadarData}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 10 }} />
                                <Radar name="Impacto" dataKey="impacto" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} strokeWidth={2} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <Shield className="w-10 h-10 text-[hsl(142,71%,45%)] mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Sin factores de riesgo significativos detectados.</p>
                          </div>
                        )}
                        <div className="space-y-2 mt-4">
                          {result.riskFactors.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${f.impact > 20 ? "text-destructive" : f.impact > 10 ? "text-[hsl(48,90%,50%)]" : "text-muted-foreground"}`} />
                              <div>
                                <p className="text-xs font-semibold text-foreground">{f.factor} <span className="text-muted-foreground font-normal">(impacto: {f.impact})</span></p>
                                <p className="text-xs text-muted-foreground">{f.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card className="border-border/60">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-accent" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

export default InvestmentAnalysisPage;
