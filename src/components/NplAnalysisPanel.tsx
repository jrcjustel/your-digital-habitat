import { Building2, Euro, Scale, Users, CreditCard, TrendingUp, MapPin, Calendar, BarChart3, Info } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { KpiCards, ComparisonBarChart, GanttCalendar, SensitivityRow } from "@/components/analysis/AnalysisCharts";

interface NplAssetData {
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
  ndg: string | null;
}

interface Props {
  asset: NplAssetData;
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

const NplAnalysisPanel = ({ asset }: Props) => {
  const price = asset.precio_orientativo || 0;
  const market = asset.valor_mercado || asset.valor_activo || 0;
  const debt = asset.deuda_ob || 0;
  const area = asset.sqm || 0;
  const pricePerSqm = area > 0 ? Math.round(market / area) : 0;
  const cargasPreferentes = Math.round(area * 3.8 * 4);
  const discountRecovery = market > 0 && price > 0 ? Math.round((1 - price / market) * 100) : 0;

  // === SCENARIO 1: Buy credit → adjudication → possession → reform → sale ===
  const ajd1 = Math.round(price * 0.028);
  const itp1 = Math.round(market * 0.06);
  const reforma1 = Math.round(area * 25);
  const notaria1 = 1025;
  const notaria1b = 900;
  const comision1 = asset.comision_porcentaje > 0 ? Math.round(price * asset.comision_porcentaje / 100) : 500;
  const costesLegales1a = 1700;
  const costesLegales1b = 1100;
  const costeInmueble1 = Math.round(area * 15);
  const ventaPrice = Math.round(market * 0.92);

  const s1_invY1 = -(price + ajd1);
  const s1_invY3 = -itp1;
  const s1_invY4 = -reforma1;
  const s1_invTotal = s1_invY1 + s1_invY3 + s1_invY4;

  const s1_costesY1 = -(notaria1 + comision1);
  const s1_costesY3 = -(notaria1b + costesLegales1a + cargasPreferentes);
  const s1_costesY4 = -(costesLegales1b + Math.round(costeInmueble1 * 0.6));
  const s1_costesY5 = -Math.round(costeInmueble1 * 0.4);
  const s1_explotY1 = s1_costesY1;
  const s1_explotY3 = s1_costesY3;
  const s1_explotY4 = s1_costesY4;
  const s1_explotY5 = ventaPrice + s1_costesY5;
  const s1_explotTotal = s1_explotY1 + s1_explotY3 + s1_explotY4 + s1_explotY5;

  const s1_totalY1 = s1_invY1 + s1_explotY1;
  const s1_totalY3 = s1_invY3 + s1_explotY3;
  const s1_totalY4 = s1_invY4 + s1_explotY4;
  const s1_totalY5 = s1_explotY5;
  const s1_net = s1_invTotal + s1_explotTotal;
  const s1_months = 51;
  const s1_invested = Math.abs(s1_invTotal) + Math.abs(s1_costesY1 + s1_costesY3 + s1_costesY4 + s1_costesY5);
  const s1_tir = s1_invested > 0 ? Math.round((s1_net / s1_invested) * 100 / (s1_months / 12) * 10) / 10 : 0;

  // === SCENARIO 2: Buy credit → find bidder / assignment ===
  const ajd2 = ajd1;
  const cobroPrice = Math.round(market * 0.78);
  const costesLegales2 = 1700;

  const s2_invY1 = -(price + ajd2);
  const s2_invTotal = s2_invY1;
  const s2_explotY1 = -(notaria1 + comision1);
  const s2_explotY3 = cobroPrice - costesLegales2;
  const s2_explotTotal = s2_explotY1 + s2_explotY3;

  const s2_totalY1 = s2_invY1 + s2_explotY1;
  const s2_totalY3 = s2_explotY3;
  const s2_net = s2_invTotal + s2_explotTotal;
  const s2_months = 35;
  const s2_invested = Math.abs(s2_invTotal) + Math.abs(s2_explotY1);
  const s2_tir = s2_invested > 0 ? Math.round((s2_net / s2_invested) * 100 / (s2_months / 12) * 10) / 10 : 0;

  // Sensitivity
  const buildSensitivity = (baseNet: number, baseInvested: number, months: number) => {
    return [-5000, -2000, 0, 2000, 5000].map(delta => {
      const p = price + delta;
      const inv = baseInvested + delta;
      const net = baseNet - delta;
      const tir = inv > 0 ? Math.round((net / inv) * 100 / (months / 12) * 10) / 10 : 0;
      return { price: p, tir };
    });
  };
  const sens1 = buildSensitivity(s1_net, s1_invested, s1_months);
  const sens2 = buildSensitivity(s2_net, s2_invested, s2_months);

  // Bar chart
  const barData = [
    ...(debt > 0 ? [{ name: "Deuda Actual", value: debt, color: "hsl(var(--destructive))" }] : []),
    ...(asset.importe_preaprobado > 0 ? [{ name: "Valor Subasta", value: asset.importe_preaprobado, color: "hsl(var(--muted-foreground))" }] : []),
    ...(market > 0 ? [{ name: "Valoración", value: market, color: "hsl(var(--primary))" }] : []),
    ...(price > 0 ? [{ name: "Precio Orient.", value: price, color: "hsl(var(--accent))" }] : []),
  ];

  // Gantt calendars
  const ganttS1 = [
    { label: "Arras", startMonth: 0, durationMonths: 1 },
    { label: "Escritura", startMonth: 3, durationMonths: 2 },
    { label: "Testimonio", startMonth: 10, durationMonths: 22 },
    { label: "Posesión", startMonth: 33, durationMonths: 5 },
    { label: "Capex", startMonth: 38, durationMonths: 2 },
    { label: "Venta", startMonth: 45, durationMonths: 6 },
  ];

  const ganttS2 = [
    { label: "Arras", startMonth: 0, durationMonths: 1 },
    { label: "Escritura", startMonth: 3, durationMonths: 2 },
    { label: "Testimonio", startMonth: 10, durationMonths: 22 },
    { label: "Cobro", startMonth: 33, durationMonths: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Resumen Ejecutivo ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold text-foreground">Resumen Ejecutivo</h3>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Crédito por importe de <strong className="text-foreground">{fmtK(debt)}</strong>,
            con colateral sito en <strong className="text-foreground">{asset.municipio || "ubicación no disponible"}</strong>
            {asset.provincia && asset.provincia !== asset.municipio ? `, ${asset.provincia}` : ""},
            valorado en <strong className="text-foreground">{fmtK(market)}</strong>.
            El precio orientativo de compra es de <strong className="text-accent">{fmtK(price)}</strong>.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards items={[
        { label: "Deuda Actual", value: fmtK(debt) },
        { label: "Valoración Colateral", value: fmtK(market) },
        { label: "Precio Orientativo", value: fmtK(price), accent: true },
        { label: "Descuento s/ Recuperación", value: `${discountRecovery}%`, sublabel: "Máxima", accent: true },
      ]} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Colateral ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-bold text-foreground">Colateral</h4>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <DataRow label="Tipología" value={asset.tipo_activo} />
            <DataRow label="Referencia Catastral" value={asset.ref_catastral} />
            <DataRow label="Superficie construida (m²)" value={area > 0 ? `${fmt(area)} m²` : null} />
            <DataRow label="Año de construcción" value={asset.anio_construccion} />
            <DataRow label="Tipo de Ocupante" value={asset.estado_ocupacional || "No Disponible"} />
            <DataRow label="VPO" value={asset.vpo ? "SÍ" : "NO"} />
            <DataRow
              label="Cargas Preferentes (€)"
              value={`${fmt(cargasPreferentes)} €`}
              note="Asunción basada en datos estimados de IBI y Comunidad limitada a los últimos cuatro años."
            />
          </div>
        </div>

        {/* ── Valoración + Judicial ── */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Valoración Colateral</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Valoración (€/m²)" value={pricePerSqm > 0 ? `${fmt(pricePerSqm)} €/m²` : null} />
              <DataRow label="Superficie adoptada (m²)" value={area > 0 ? `${fmt(area)} m²` : null} />
              <DataRow label="Valoración total (€)" value={market > 0 ? `${fmt(market)} €` : null} highlight />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Estado Judicial</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Tipología Deudor" value={asset.persona_tipo === "juridica" ? "JURÍDICA" : asset.persona_tipo === "fisica" ? "FÍSICA" : asset.persona_tipo || "n.d."} />
              <DataRow label="Valor Efectos de Subasta" value={asset.importe_preaprobado > 0 ? `${fmt(asset.importe_preaprobado)} €` : "n.d."} />
              <DataRow label="Fase Judicial" value={asset.fase_judicial || asset.estado_judicial || "n.a."} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison Bar Chart ── */}
      {barData.length >= 2 && <ComparisonBarChart data={barData} height={250} />}

      {/* ── ESCENARIOS FINANCIEROS ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold text-foreground">Análisis Financiero</h3>
        </div>

        <Tabs defaultValue="scenario1" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="scenario1" className="text-xs">
              Adjudicación, Posesión y Venta
            </TabsTrigger>
            <TabsTrigger value="scenario2" className="text-xs">
              Postor en Subasta / Cesión
            </TabsTrigger>
          </TabsList>

          {/* ── SCENARIO 1 ── */}
          <TabsContent value="scenario1" className="space-y-5">
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                En este escenario se asume la compra del crédito, la adjudicación del bien, la obtención de la posesión, reforma y venta.
                Se estima un margen de <strong className="text-foreground">{fmtK(Math.max(s1_net, 0))}</strong> y
                una TIR Bruta del <strong className="text-accent">{s1_tir}%</strong> en
                una operación que finalizaría en <strong className="text-foreground">{s1_months} meses</strong>.
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
                    <TableHead className="text-right font-bold text-foreground">Año 4</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Año 5</TableHead>
                    <TableHead className="text-right font-bold text-accent">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">CF Inversión</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_invY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_invY3)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_invY4)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_invTotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Compra</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">AJD</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-ajd1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-ajd1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">IVA / ITP</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-itp1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-itp1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Reforma</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-reforma1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-reforma1)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Ingresos</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Venta</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-primary">{fmt(ventaPrice)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(ventaPrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Alquiler</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">–</TableCell>
                  </TableRow>

                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Costes</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_costesY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_costesY3)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_costesY4)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_costesY5)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_costesY1 + s1_costesY3 + s1_costesY4 + s1_costesY5)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Notaría y Registro</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-notaria1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-notaria1b)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-(notaria1 + notaria1b))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Comisión</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-comision1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-comision1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Costes Legales</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegales1a)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegales1b)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-(costesLegales1a + costesLegales1b))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Cargas</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-cargasPreferentes)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-cargasPreferentes)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Cashout <sup>(1)</sup></TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Coste Inmueble</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-Math.round(costeInmueble1 * 0.15))}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-Math.round(costeInmueble1 * 0.5))}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-Math.round(costeInmueble1 * 0.35))}</TableCell>
                    <TableCell className="text-right">{fmtCF(-costeInmueble1)}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-accent/10 border-t-2 border-accent/30">
                    <TableCell className="font-bold text-foreground text-base">Total</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_totalY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_totalY3)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s1_totalY4)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmtCF(s1_totalY5)}</TableCell>
                    <TableCell className={`text-right font-bold text-base ${s1_net < 0 ? "text-destructive" : "text-accent"}`}>{fmtCF(s1_net)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Gantt + Sensitivity */}
            <div className="grid md:grid-cols-2 gap-6">
              <GanttCalendar items={ganttS1} totalMonths={s1_months} />
              <SensitivityRow items={sens1} basePrice={price} />
            </div>
          </TabsContent>

          {/* ── SCENARIO 2 ── */}
          <TabsContent value="scenario2" className="space-y-5">
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compra del crédito y acuerdo con postor en subasta o cesión de remate a tercero.
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
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s2_invY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s2_invTotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Compra</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">AJD</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-ajd2)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-ajd2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Ingresos</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(cobroPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmt(cobroPrice)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-secondary/30">
                    <TableCell className="font-bold text-foreground">Costes</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s2_explotY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(-costesLegales2)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s2_explotY1 - costesLegales2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Notaría y Registro</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-notaria1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-notaria1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Comisión</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-comision1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right">{fmtCF(-comision1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">Costes Legales</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegales2)}</TableCell>
                    <TableCell className="text-right">{fmtCF(-costesLegales2)}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-accent/10 border-t-2 border-accent/30">
                    <TableCell className="font-bold text-foreground text-base">Total</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{fmtCF(s2_totalY1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">–</TableCell>
                    <TableCell className="text-right font-bold text-primary">{fmtCF(s2_totalY3)}</TableCell>
                    <TableCell className={`text-right font-bold text-base ${s2_net < 0 ? "text-destructive" : "text-accent"}`}>{fmtCF(s2_net)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Gantt + Sensitivity */}
            <div className="grid md:grid-cols-2 gap-6">
              <GanttCalendar items={ganttS2} totalMonths={s2_months} />
              <SensitivityRow items={sens2} basePrice={price} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Footnote ── */}
      <div className="bg-secondary/50 rounded-xl p-4 text-[10px] text-muted-foreground leading-relaxed space-y-1">
        <p><strong>(1)</strong> Dinero a consignar en el juzgado al superar el importe de adjudicación la deuda acreditada.</p>
        <p>Cargas preferentes: asunción basada en datos estimados de IBI y Comunidad limitada a los últimos cuatro años.</p>
        <p>Los datos financieros son estimativos y no constituyen asesoramiento de inversión. Se recomienda verificación independiente.</p>
      </div>
    </div>
  );
};

export default NplAnalysisPanel;
