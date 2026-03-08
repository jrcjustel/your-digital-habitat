import { Building2, Euro, Calendar, TrendingUp, Scale, Landmark, Info } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { KpiCards, ComparisonBarChart, GanttCalendar, SensitivityRow } from "@/components/analysis/AnalysisCharts";

interface CdrAsset {
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
}

interface Props {
  asset: CdrAsset;
}

const fmt = (n: number) => n.toLocaleString("es-ES");
const fmtK = (n: number) => `€${(n / 1000).toFixed(0)}k`;

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

const CdrAnalysisPanel = ({ asset }: Props) => {
  const price = asset.precio_orientativo || 0;
  const market = asset.valor_mercado || asset.valor_activo || 0;
  const area = asset.sqm || 0;
  const pricePerSqm = area > 0 ? Math.round(market / area) : 0;

  // === Financial model (CDR) ===
  const itp = Math.round(price * 0.10);
  const ajd = 0;
  const reforma = Math.round(area * 25);
  const notariaRegistro = 900;
  const comisionCosts = asset.comision_porcentaje > 0 ? Math.round(price * asset.comision_porcentaje / 100) : 500;
  const costesLegales = 1100;
  const cargasPreferentes = Math.round(area * 3.8 * 4);
  const costeInmueble = Math.round((notariaRegistro + comisionCosts + costesLegales + cargasPreferentes) * 0.3);

  const cfInversionY1 = -(price + itp + ajd);
  const cfInversionY2 = -reforma;
  const cfInversionTotal = cfInversionY1 + cfInversionY2;

  const ventaPrice = Math.round(market * 0.92);
  const costesY1 = -(notariaRegistro + comisionCosts + cargasPreferentes);
  const costesY2 = -(costesLegales + costeInmueble);
  const costesTotal = costesY1 + costesY2;
  const cfExplotacionY1 = costesY1;
  const cfExplotacionY2 = ventaPrice + costesY2;
  const cfExplotacionTotal = cfExplotacionY1 + cfExplotacionY2;

  const totalY1 = cfInversionY1 + cfExplotacionY1;
  const totalY2 = cfInversionY2 + cfExplotacionY2;
  const totalNet = cfInversionTotal + cfExplotacionTotal;

  const durationMonths = 24;
  const totalInvested = Math.abs(cfInversionTotal) + Math.abs(costesTotal);
  const tirBruta = totalInvested > 0 ? Math.round((totalNet / totalInvested) * 100 / (durationMonths / 12) * 10) / 10 : 0;

  const discount = market > 0 && price > 0 ? Math.round((1 - price / market) * 100) : 0;

  // Sensitivity
  const sensitivities = [-5000, -2000, 0, 2000, 5000].map(delta => {
    const p = price + delta;
    const itpS = Math.round(p * 0.10);
    const invested = p + itpS + reforma + notariaRegistro + comisionCosts + costesLegales + cargasPreferentes + costeInmueble;
    const net = ventaPrice - invested;
    const tir = invested > 0 ? Math.round((net / invested) * 100 / (durationMonths / 12) * 10) / 10 : 0;
    return { price: p, tir };
  });

  // Gantt calendar items
  const ganttItems = [
    { label: "Arras", startMonth: 0, durationMonths: 1 },
    { label: "Escritura", startMonth: 4, durationMonths: 2 },
    { label: "Posesión", startMonth: 8, durationMonths: 5 },
    { label: "Capex", startMonth: 13, durationMonths: 2 },
    { label: "Venta", startMonth: 18, durationMonths: 6 },
  ];

  // Bar chart data
  const barData = [
    ...(asset.deuda_ob > 0 ? [{ name: "Deuda Actual", value: asset.deuda_ob, color: "hsl(var(--destructive))" }] : []),
    ...(asset.importe_preaprobado > 0 ? [{ name: "Valor Subasta", value: asset.importe_preaprobado, color: "hsl(var(--muted-foreground))" }] : []),
    ...(market > 0 ? [{ name: "Valoración", value: market, color: "hsl(var(--primary))" }] : []),
    ...(price > 0 ? [{ name: "Precio Compra", value: price, color: "hsl(var(--accent))" }] : []),
  ];

  const fmtCF = (n: number) => {
    if (n === 0) return "–";
    return n < 0 ? `(${fmt(Math.abs(n))})` : fmt(n);
  };

  return (
    <div className="space-y-6">
      {/* ── Detalle General ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold text-foreground">Detalle General</h3>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Se comercializa <strong>{asset.tipo_activo || "Inmueble"}</strong> en cesión de remate
            {asset.municipio ? ` sito en ${asset.municipio}` : ""}
            {market > 0 ? `, valorado en ${fmtK(market)}` : ""}
            {price > 0 ? `. El precio potencial de compra propuesto es de ${fmtK(price)}.` : "."}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards items={[
        { label: "Valoración Colateral", value: fmtK(market) },
        { label: "Precio Orientativo", value: fmtK(price), accent: true },
        { label: "Margen Estimado", value: `${fmtK(Math.max(totalNet, 0))}` },
        { label: "TIR Bruta", value: `${tirBruta}%`, sublabel: `${durationMonths} meses`, accent: true },
      ]} />

      {/* ── Colateral + Valoración ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-bold text-foreground">Colateral</h4>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <DataRow label="Dirección" value={asset.direccion} />
            <DataRow label="Código Postal" value={asset.codigo_postal} />
            <DataRow label="Municipio" value={asset.municipio} />
            <DataRow label="Provincia" value={asset.provincia} />
            <DataRow label="Tipología" value={asset.tipo_activo} />
            <DataRow label="Referencia Catastral" value={asset.ref_catastral} />
            <DataRow label="Superficie construida (m²)" value={area > 0 ? `${fmt(area)} m²` : null} />
            <DataRow label="Año de construcción" value={asset.anio_construccion} />
            <DataRow label="Tipo de Ocupante" value={asset.estado_ocupacional || "No Disponible"} />
            <DataRow
              label="Cargas Preferentes (€)"
              value={`${fmt(cargasPreferentes)} €`}
              note="Asunción basada en datos estimados de IBI y Comunidad limitada a los últimos cuatro años."
            />
            {asset.vpo && <DataRow label="VPO" value="SÍ" highlight />}
          </div>
        </div>

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
              <h4 className="text-sm font-bold text-foreground">Situación Judicial</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Judicializado" value={asset.judicializado ? "SÍ" : "NO"} />
              <DataRow label="Fase judicial" value={asset.fase_judicial || asset.estado_judicial || "n.a."} />
              <DataRow label="Importe pre-aprobado" value={asset.importe_preaprobado > 0 ? `${fmt(asset.importe_preaprobado)} €` : "n.a."} highlight />
            </div>
          </div>

          {/* Bar chart */}
          {barData.length >= 2 && <ComparisonBarChart data={barData} />}
        </div>
      </div>

      {/* ── Análisis Financiero CDR ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold text-foreground">Análisis – Cesión de Remate</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          En este escenario, se asume la compra del inmueble en cesión de remate.
          Se estima un margen de <strong className="text-foreground">{fmtK(Math.max(totalNet, 0))}</strong> y
          una TIR Bruta del <strong className="text-accent">{tirBruta}%</strong> en
          una operación que finalizaría en <strong className="text-foreground">{durationMonths} meses</strong>.
        </p>

        {/* Cashflow Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-bold text-foreground">CDR</TableHead>
                <TableHead className="text-right font-bold text-foreground">Año 1</TableHead>
                <TableHead className="text-right font-bold text-foreground">Año 2</TableHead>
                <TableHead className="text-right font-bold text-accent">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-secondary/30">
                <TableCell className="font-bold text-foreground">CF Inversión</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(cfInversionY1)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(cfInversionY2)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(cfInversionTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Compra</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmtCF(-price)}</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right">{fmtCF(-price)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">AJD</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right">–</TableCell>
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

              {/* Ingresos */}
              <TableRow className="bg-secondary/30">
                <TableCell className="font-bold text-foreground">Ingresos</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
                <TableCell className="text-right font-bold text-primary">{fmt(ventaPrice)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Venta</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right text-primary">{fmt(ventaPrice)}</TableCell>
                <TableCell className="text-right font-bold">{fmt(ventaPrice)}</TableCell>
              </TableRow>

              {/* Costes */}
              <TableRow className="bg-secondary/30">
                <TableCell className="font-bold text-foreground">Costes</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(costesY1)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(costesY2)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">{fmtCF(costesTotal)}</TableCell>
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
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmtCF(-costesLegales)}</TableCell>
                <TableCell className="text-right">{fmtCF(-costesLegales)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Cargas</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmtCF(-cargasPreferentes)}</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right">{fmtCF(-cargasPreferentes)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Cashout <sup>(1)</sup></TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right">–</TableCell>
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
                <TableCell className={`text-right font-bold ${totalY1 < 0 ? "text-destructive" : "text-primary"}`}>{fmtCF(totalY1)}</TableCell>
                <TableCell className={`text-right font-bold ${totalY2 < 0 ? "text-destructive" : "text-primary"}`}>{fmtCF(totalY2)}</TableCell>
                <TableCell className={`text-right font-bold text-base ${totalNet < 0 ? "text-destructive" : "text-accent"}`}>{fmtCF(totalNet)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* ── Gantt Calendar + Sensitivity side by side ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <GanttCalendar items={ganttItems} totalMonths={durationMonths} />
        <SensitivityRow items={sensitivities} basePrice={price} />
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

export default CdrAnalysisPanel;
