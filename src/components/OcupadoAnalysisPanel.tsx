import { Building2, Euro, Scale, Users, ShieldAlert, CreditCard, AlertTriangle, Info, Check, X, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { KpiCards, ComparisonBarChart, GanttCalendar, SensitivityRow } from "@/components/analysis/AnalysisCharts";

interface OcupadoAsset {
  direccion: string | null;
  codigo_postal: string | null;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  ref_catastral: string | null;
  sqm: number;
  anio_construccion: number | null;
  estado_ocupacional: string | null;
  vpo: boolean;
  valor_activo: number;
  valor_mercado: number;
  precio_orientativo: number;
  importe_preaprobado: number;
  deuda_ob: number;
  comision_porcentaje: number;
  deposito_porcentaje: number;
  finca_registral: string | null;
  registro_propiedad: string | null;
  persona_tipo: string | null;
  num_titulares: number;
  fase_judicial: string | null;
  estado_judicial: string | null;
  judicializado: boolean;
  cesion_credito: boolean;
  cesion_remate: boolean;
  postura_subasta: boolean;
  propiedad_sin_posesion: boolean;
  referencia_fencia: string | null;
  asset_id: string | null;
  rango_deuda: string | null;
  descripcion: string | null;
  ndg: string | null;
}

interface Props {
  asset: OcupadoAsset;
}

const fmt = (n: number) => n.toLocaleString("es-ES");
const fmtK = (n: number) => `€${(n / 1000).toFixed(0)}k`;
const fmtCF = (n: number) => {
  if (n === 0) return "–";
  return n < 0 ? `(${fmt(Math.abs(n))})` : fmt(n);
};

const DataRow = ({ label, value, highlight, note }: {
  label: string; value: string | number | null | undefined; highlight?: boolean; note?: string;
}) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {label}
        {note && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs">{note}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className={`text-sm font-medium text-right ${highlight ? "text-accent font-bold" : "text-foreground"}`}>{value}</span>
    </div>
  );
};

const FlagChip = ({ label, active }: { label: string; active: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
    {active ? <Check className="w-4 h-4 text-accent" /> : <X className="w-4 h-4 text-muted-foreground/40" />}
    <span className={`text-xs font-medium ${active ? "text-accent" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

const OcupadoAnalysisPanel = ({ asset }: Props) => {
  const market = asset.valor_mercado || asset.valor_activo || 0;
  const price = asset.precio_orientativo || 0;
  const debt = asset.deuda_ob || 0;
  const area = asset.sqm || 0;
  const discount = market > 0 && price > 0 ? Math.round((1 - price / market) * 100) : null;
  const pricePerSqm = area > 0 && market > 0 ? Math.round(market / area) : 0;

  // === FINANCIAL MODEL: Ocupado ===
  // Scenario 1: Buy → Negotiate exit → Reform → Sell (shorter, with compensation)
  const compensacion = Math.round(market * 0.05); // 5% of market value for voluntary exit
  const itp = Math.round(price * 0.10);
  const reforma = Math.round(area * 30); // higher capex due to neglect
  const notariaRegistro = 1200;
  const comisionCosts = asset.comision_porcentaje > 0 ? Math.round(price * asset.comision_porcentaje / 100) : 500;
  const costesLegalesNeg = 800; // negotiation legal
  const cargasPreferentes = Math.round(area * 3.8 * 4);
  const costeInmueble = Math.round(area * 12);
  const ventaPrice = Math.round(market * 0.90); // 90% due to market discount from history

  const s1_compra = price + itp;
  const s1_costesY1 = notariaRegistro + comisionCosts + costesLegalesNeg + compensacion;
  const s1_costesY2 = reforma + cargasPreferentes + costeInmueble;
  const s1_totalCostes = s1_compra + s1_costesY1 + s1_costesY2;
  const s1_net = ventaPrice - s1_totalCostes;
  const s1_months = 18;
  const s1_tir = s1_totalCostes > 0 ? Math.round((s1_net / s1_totalCostes) * 100 / (s1_months / 12) * 10) / 10 : 0;

  // Scenario 2: Buy → Judicial eviction → Reform → Sell (longer)
  const costesLegalesJud = 3500;
  const costesLegalesJud2 = 1500;
  const s2_costesY1 = notariaRegistro + comisionCosts;
  const s2_costesY2 = costesLegalesJud;
  const s2_costesY3 = costesLegalesJud2 + cargasPreferentes;
  const s2_costesY4 = reforma + costeInmueble;
  const s2_totalCostes = s1_compra + s2_costesY1 + s2_costesY2 + s2_costesY3 + s2_costesY4;
  const s2_net = ventaPrice - s2_totalCostes;
  const s2_months = 36;
  const s2_tir = s2_totalCostes > 0 ? Math.round((s2_net / s2_totalCostes) * 100 / (s2_months / 12) * 10) / 10 : 0;

  // Sensitivity
  const buildSensitivity = (netBase: number, investedBase: number, months: number) => {
    return [-5000, -2000, 0, 2000, 5000].map(delta => {
      const p = price + delta;
      const inv = investedBase + delta;
      const net = netBase - delta;
      const tir = inv > 0 ? Math.round((net / inv) * 100 / (months / 12) * 10) / 10 : 0;
      return { price: p, tir };
    });
  };
  const sens1 = buildSensitivity(s1_net, s1_totalCostes, s1_months);
  const sens2 = buildSensitivity(s2_net, s2_totalCostes, s2_months);

  // Gantt calendars
  const ganttS1 = [
    { label: "Compra", startMonth: 0, durationMonths: 2 },
    { label: "Negociación", startMonth: 2, durationMonths: 4 },
    { label: "Salida", startMonth: 6, durationMonths: 2 },
    { label: "Reforma", startMonth: 8, durationMonths: 3 },
    { label: "Venta", startMonth: 12, durationMonths: 6 },
  ];

  const ganttS2 = [
    { label: "Compra", startMonth: 0, durationMonths: 2 },
    { label: "Demanda", startMonth: 2, durationMonths: 6 },
    { label: "Desahucio", startMonth: 12, durationMonths: 12 },
    { label: "Posesión", startMonth: 24, durationMonths: 2 },
    { label: "Reforma", startMonth: 26, durationMonths: 3 },
    { label: "Venta", startMonth: 30, durationMonths: 6 },
  ];

  // Bar chart
  const barData = [
    ...(debt > 0 ? [{ name: "Deuda", value: debt, color: "hsl(var(--destructive))" }] : []),
    ...(market > 0 ? [{ name: "Valor Mercado", value: market, color: "hsl(var(--primary))" }] : []),
    ...(price > 0 ? [{ name: "Precio Compra", value: price, color: "hsl(var(--accent))" }] : []),
    ...(ventaPrice > 0 ? [{ name: "Venta Est.", value: ventaPrice, color: "hsl(var(--muted-foreground))" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* ── Description ── */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {asset.descripcion || (
            <>
              Inmueble situado en <strong>{asset.municipio || "ubicación no disponible"}</strong>
              {asset.provincia ? `, (${asset.provincia})` : ""}.
              {area > 0 ? ` Superficie construida de ${fmt(area)} m²` : ""}
              {market > 0 ? ` con un valor de mercado estimado de ${fmt(market)} €` : ""}.
              {" "}Dicho inmueble <strong className="text-destructive">se transmite sin posesión</strong>.
            </>
          )}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards items={[
        { label: "Valor de Mercado", value: fmtK(market) },
        { label: "Precio Orientativo", value: fmtK(price), accent: true },
        { label: "Margen Est. (Neg.)", value: fmtK(Math.max(s1_net, 0)), sublabel: `TIR ${s1_tir}%` },
        { label: "Descuento s/ Mercado", value: `${discount || 0}%`, accent: true },
      ]} />

      {/* ── Operation type flags ── */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Tipo de operación</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <FlagChip label="Compra de crédito" active={asset.cesion_credito} />
          <FlagChip label="Cesión de remate" active={asset.cesion_remate} />
          <FlagChip label="Propiedad sin posesión" active={asset.propiedad_sin_posesion} />
          <FlagChip label="Postura en subasta" active={asset.postura_subasta} />
        </div>
      </div>

      {/* ── Occupation warning ── */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-destructive mb-1">Inmueble transmitido sin posesión</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Este inmueble se transmite sin posesión efectiva. El adquirente deberá gestionar la recuperación
              posesoria por vía amistosa o judicial, asumiendo los plazos y costes asociados.
            </p>
            {asset.estado_ocupacional && (
              <Badge variant="outline" className="mt-2 text-destructive border-destructive/30">
                Estado: {asset.estado_ocupacional}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Property info ── */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Información de la propiedad</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Dirección" value={asset.direccion} />
              <DataRow label="Código postal" value={asset.codigo_postal} />
              <DataRow label="Municipio" value={asset.municipio} />
              <DataRow label="Provincia" value={asset.provincia} />
              <DataRow label="Tipología" value={asset.tipo_activo} />
              <DataRow label="Superficie (m²)" value={area > 0 ? `${fmt(area)} m²` : null} />
              <DataRow label="Año construcción" value={asset.anio_construccion} />
              <DataRow label="Referencia catastral" value={asset.ref_catastral} />
              <DataRow label="Tipo de Ocupante" value={asset.estado_ocupacional || "No Disponible"} />
              <DataRow label="VPO" value={asset.vpo ? "SÍ" : "NO"} />
              <DataRow label="€/m²" value={pricePerSqm > 0 ? `${fmt(pricePerSqm)} €/m²` : null} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Deudor</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Titulares" value={asset.num_titulares} />
              <DataRow label="Tipo persona" value={asset.persona_tipo === "juridica" ? "Jurídica" : asset.persona_tipo === "fisica" ? "Física" : asset.persona_tipo || "n.d."} />
            </div>
          </div>
        </div>

        {/* ── Deuda + Judicial + Valoración ── */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Deuda</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Deuda actual" value={debt > 0 ? `${fmt(debt)} €` : "–"} highlight />
              <DataRow label="Rango" value={asset.rango_deuda || "–"} />
              {debt > 0 && market > 0 && (
                <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">LTV (Deuda / Valor)</span>
                  <span className="text-sm font-bold text-foreground">{Math.round((debt / market) * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Información judicial</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Judicializado" value={asset.judicializado ? "SÍ" : "NO"} highlight={asset.judicializado} />
              <DataRow label="Fase judicial" value={asset.fase_judicial || asset.estado_judicial || "n.a."} />
              <DataRow label="Importe pre-aprobado" value={asset.importe_preaprobado > 0 ? `${fmt(asset.importe_preaprobado)} €` : "n.a."} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Valoración</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Valor de mercado" value={market > 0 ? `${fmt(market)} €` : "–"} highlight />
              <DataRow label="Precio orientativo" value={price > 0 ? `${fmt(price)} €` : "–"} highlight />
              {discount !== null && discount > 0 && (
                <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Descuento s/ mercado</span>
                  <Badge className="bg-accent/10 text-accent border-accent/20 font-bold">-{discount}%</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison Chart ── */}
      {barData.length >= 2 && <ComparisonBarChart data={barData} height={220} />}

      {/* ── ANÁLISIS FINANCIERO OCUPADO ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold text-foreground">Análisis Financiero – Inmueble Ocupado</h3>
        </div>

        <Tabs defaultValue="negotiation" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="negotiation" className="text-xs">
              Salida Negociada (Amistosa)
            </TabsTrigger>
            <TabsTrigger value="judicial" className="text-xs">
              Desahucio Judicial
            </TabsTrigger>
          </TabsList>

          {/* ── Scenario 1: Negotiated exit ── */}
          <TabsContent value="negotiation" className="space-y-5">
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compra del inmueble, negociación de salida voluntaria con compensación, reforma y venta.
                Margen estimado: <strong className="text-foreground">{fmtK(Math.max(s1_net, 0))}</strong> —
                TIR Bruta: <strong className="text-accent">{s1_tir}%</strong> —
                Duración: <strong className="text-foreground">{s1_months} meses</strong>.
              </p>
            </div>

            <div className="border border-border rounded-xl overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="font-bold text-foreground">CF</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 1</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 2</TableHead>
                    <TableHead className="text-right font-bold text-accent">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">CF Inversión</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s1_compra)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s1_compra)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Compra</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">IVA / ITP</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-itp)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-itp)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Reforma</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-reforma)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-reforma)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Ingresos</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Costes</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s1_costesY1)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s1_costesY2)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s1_costesY1 + s1_costesY2))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Notaría y Registro</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-notariaRegistro)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-notariaRegistro)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Comisión</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-comisionCosts)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-comisionCosts)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Costes Legales</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegalesNeg)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-costesLegalesNeg)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Compensación ocupante</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-compensacion)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-compensacion)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Cargas</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-cargasPreferentes)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-cargasPreferentes)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Coste Inmueble</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costeInmueble)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-costeInmueble)}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-accent/10 border-t-2 border-accent/30">
                    <TableCell className="font-bold text-foreground text-base">Total</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s1_compra + s1_costesY1))}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmtCF(ventaPrice - s1_costesY2 - reforma)}</TableCell>
                    <TableCell className={`text-right font-bold text-base ${s1_net < 0 ? "text-destructive" : "text-accent"}`}>{fmtCF(s1_net)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GanttCalendar items={ganttS1} totalMonths={s1_months} />
              <SensitivityRow items={sens1} basePrice={price} />
            </div>
          </TabsContent>

          {/* ── Scenario 2: Judicial ── */}
          <TabsContent value="judicial" className="space-y-5">
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compra del inmueble y proceso judicial de desahucio, reforma y venta.
                Margen estimado: <strong className="text-foreground">{fmtK(Math.max(s2_net, 0))}</strong> —
                TIR Bruta: <strong className="text-accent">{s2_tir}%</strong> —
                Duración: <strong className="text-foreground">{s2_months} meses</strong>.
              </p>
            </div>

            <div className="border border-border rounded-xl overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="font-bold text-foreground">CF</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 1</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 2</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 3</TableHead>
                    <TableHead className="text-right font-bold text-accent">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">CF Inversión</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s1_compra)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-reforma)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s1_compra + reforma))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Compra</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">IVA / ITP</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-itp)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-itp)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Reforma</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-reforma)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-reforma)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Ingresos</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Costes</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s2_costesY1)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s2_costesY2)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s2_costesY3 + s2_costesY4))}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s2_costesY1 + s2_costesY2 + s2_costesY3 + s2_costesY4))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Notaría y Registro</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-notariaRegistro)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-notariaRegistro)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Comisión</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-comisionCosts)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-comisionCosts)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Costes Legales (demanda)</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegalesJud)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegalesJud2)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-(costesLegalesJud + costesLegalesJud2))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Cargas</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-cargasPreferentes)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-cargasPreferentes)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Coste Inmueble</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costeInmueble)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-costeInmueble)}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-accent/10 border-t-2 border-accent/30">
                    <TableCell className="font-bold text-foreground text-base">Total</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-(s1_compra + s2_costesY1))}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-s2_costesY2)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmtCF(ventaPrice - reforma - s2_costesY3 - s2_costesY4)}</TableCell>
                    <TableCell className={`text-right font-bold text-base ${s2_net < 0 ? "text-destructive" : "text-accent"}`}>{fmtCF(s2_net)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GanttCalendar items={ganttS2} totalMonths={s2_months} />
              <SensitivityRow items={sens2} basePrice={price} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Consideraciones ── */}
      <div className="bg-secondary/50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-foreground mb-2">Consideraciones importantes</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>El proceso de desahucio puede tardar entre 6-18 meses según la jurisdicción.</li>
              <li>Evalúe la posibilidad de negociación de salida voluntaria con compensación económica.</li>
              <li>Considere los costes legales adicionales en el cálculo de rentabilidad.</li>
              <li>El estado de conservación del inmueble puede ser desconocido o deteriorado.</li>
              <li>Los valores de mercado se refieren al inmueble libre de ocupantes.</li>
              {asset.vpo && <li className="text-destructive font-semibold">⚠️ Inmueble VPO: puede tener restricciones de venta y precio máximo.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Footnote ── */}
      <div className="text-[10px] text-muted-foreground leading-relaxed">
        Los datos tienen carácter meramente informativo y no constituyen asesoramiento de inversión. Se recomienda verificación independiente y asesoramiento legal especializado.
      </div>
    </div>
  );
};

export default OcupadoAnalysisPanel;
