import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp, TrendingDown, Clock, Shield, Droplets, Euro,
  ChevronDown, ChevronUp, Calculator, Target, BarChart3, Info,
  Gavel, Home, ArrowRightLeft, Hammer,
} from "lucide-react";
import { enrichOpportunity, type EnrichmentInput, type EnrichmentResult, type ExitStrategy } from "@/lib/dynamicEnrichment";

// ─── Strategy icons ───
const strategyIcons: Record<string, typeof TrendingUp> = {
  reventa: TrendingUp, alquiler: Home, cesion: ArrowRightLeft, reforma: Hammer,
};

// ─── Helpers ───
const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

const riskColor = (level: string) =>
  level === "bajo" ? "text-emerald-600" : level === "medio" ? "text-amber-500" : "text-destructive";

const riskBg = (level: string) =>
  level === "bajo" ? "bg-emerald-500/10" : level === "medio" ? "bg-amber-500/10" : "bg-destructive/10";

// ─── Metric Row ───
const MetricRow = ({ icon: Icon, label, value, tooltip, highlight }: {
  icon: typeof Euro; label: string; value: string; tooltip?: string; highlight?: boolean;
}) => (
  <div className="flex items-center justify-between py-2.5">
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="w-4 h-4 text-accent shrink-0" />
      <span className="text-sm text-muted-foreground truncate">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <span className={`text-sm font-semibold ${highlight ? "text-accent" : "text-foreground"}`}>{value}</span>
  </div>
);

// ─── Strategy card ───
const StrategyRow = ({ strategy, isBest }: { strategy: ExitStrategy; isBest: boolean }) => {
  const Icon = strategyIcons[strategy.key] || TrendingUp;
  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${isBest ? "bg-accent/10 border border-accent/20" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${isBest ? "text-accent" : "text-muted-foreground"}`} />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isBest ? "text-accent" : "text-foreground"}`}>
            {strategy.label}
            {isBest && <span className="ml-1.5 text-[10px] font-bold uppercase">Óptima</span>}
          </p>
          <p className="text-[11px] text-muted-foreground">{strategy.timeMonths} meses · {fmt(strategy.netProfit)}</p>
        </div>
      </div>
      <Badge variant={strategy.roi > 15 ? "default" : strategy.roi > 0 ? "secondary" : "destructive"} className="text-xs shrink-0">
        {pct(strategy.roi)}
      </Badge>
    </div>
  );
};

// ─── MAIN COMPONENT ───
interface InvestmentIntelligenceCardProps {
  input: EnrichmentInput;
  riskLevel?: "bajo" | "medio" | "alto";
  className?: string;
  defaultExpanded?: boolean;
}

const InvestmentIntelligenceCard = ({
  input, riskLevel = "medio", className = "", defaultExpanded = false,
}: InvestmentIntelligenceCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const data: EnrichmentResult = useMemo(() => enrichOpportunity(input), [
    input.price, input.marketValue, input.sqm, input.occupied,
    input.occupancyStatus, input.judicialPhase, input.province, input.commissionPct,
  ]);

  const discountIcon = data.discount > 0 ? TrendingDown : TrendingUp;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Panel de Inteligencia
          </CardTitle>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label={expanded ? "Contraer panel" : "Expandir panel"}
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-0">
        {/* Always visible summary row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-lg font-bold text-accent">{data.discount > 0 ? `-${data.discount}%` : `${data.discount}%`}</p>
            <p className="text-[10px] text-muted-foreground">vs. mercado</p>
          </div>
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-lg font-bold text-foreground">{data.bestStrategy.roi}%</p>
            <p className="text-[10px] text-muted-foreground">ROI estimado</p>
          </div>
          <div className={`rounded-xl p-3 ${riskBg(riskLevel)}`}>
            <p className={`text-lg font-bold capitalize ${riskColor(riskLevel)}`}>{riskLevel}</p>
            <p className="text-[10px] text-muted-foreground">Riesgo</p>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Financial metrics */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Análisis Financiero</p>
              <div className="divide-y divide-border">
                <MetricRow icon={Euro} label="Inversión total estimada" value={fmt(data.estimatedTotalInvestment)}
                  tooltip="Precio + ITP + notaría + registro + abogado + desahucio + reforma + comisión" highlight />
                <MetricRow icon={discountIcon} label="Descuento sobre mercado" value={`${data.discount}%`}
                  tooltip="Diferencia porcentual entre el precio de adquisición y el valor de mercado estimado" />
                {data.pricePerSqm && (
                  <MetricRow icon={Calculator} label="Precio/m²" value={`${data.pricePerSqm} €/m²`}
                    tooltip="Precio de adquisición por metro cuadrado construido" />
                )}
                {data.marketPricePerSqm && (
                  <MetricRow icon={Target} label="Mercado/m²" value={`${data.marketPricePerSqm} €/m²`}
                    tooltip="Valor de mercado por metro cuadrado en la zona" />
                )}
              </div>
            </div>

            <Separator />

            {/* Cost breakdown */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Desglose de Costes Estimados</p>
              <div className="space-y-2">
                {[
                  { label: "ITP (8%)", value: data.costs.itp },
                  { label: "Notaría", value: data.costs.notary },
                  { label: "Registro", value: data.costs.registry },
                  { label: "Abogado / Procurador", value: data.costs.legal },
                  ...(data.costs.eviction > 0 ? [{ label: "Desahucio estimado", value: data.costs.eviction }] : []),
                  { label: "Reforma estimada", value: data.costs.reform },
                  ...(data.costs.commission > 0 ? [{ label: "Comisión IKESA", value: data.costs.commission }] : []),
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="text-foreground font-medium">{fmt(c.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-bold border-t border-border pt-2">
                  <span className="text-foreground">Total inversión</span>
                  <span className="text-accent">{fmt(data.estimatedTotalInvestment)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timelines */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Plazos Estimados</p>
              <div className="divide-y divide-border">
                <MetricRow icon={Gavel} label="Proceso judicial" value={`~${data.legalTimelineMonths} meses`}
                  tooltip="Estimación del tiempo restante hasta resolución judicial según la fase actual" />
                <MetricRow icon={Clock} label="Posesión efectiva" value={`~${data.possessionTimelineMonths} meses`}
                  tooltip="Tiempo estimado hasta obtener la posesión real del inmueble (incluye desahucio si aplica)" />
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Progreso estimado</span>
                  <span>{Math.max(0, Math.round((1 - data.possessionTimelineMonths / 36) * 100))}%</span>
                </div>
                <Progress value={Math.max(5, Math.round((1 - data.possessionTimelineMonths / 36) * 100))} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* Liquidity */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Liquidez de Zona</p>
              <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{input.province || "Zona"}</span>
                    <span className="font-semibold text-foreground">{data.liquidityScore}/100</span>
                  </div>
                  <Progress value={data.liquidityScore} className="h-2" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {data.liquidityScore >= 80 ? "Mercado muy líquido — alta demanda y rotación." :
                 data.liquidityScore >= 60 ? "Liquidez moderada — demanda estable." :
                 data.liquidityScore >= 40 ? "Liquidez baja — puede requerir más tiempo de venta." :
                 "Mercado poco líquido — considerar horizontes largos."}
              </p>
            </div>

            <Separator />

            {/* Exit strategies */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Estrategias de Salida</p>
              <div className="space-y-1.5">
                {data.exitStrategies.map((s) => (
                  <StrategyRow key={s.key} strategy={s} isBest={s.key === data.bestStrategy.key} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expand prompt */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full mt-3 text-xs text-accent font-semibold hover:underline flex items-center justify-center gap-1"
          >
            Ver análisis completo <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentIntelligenceCard;
