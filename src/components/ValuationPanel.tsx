import { TrendingUp, AlertTriangle, Clock, DollarSign, Shield, BarChart3, Target } from "lucide-react";
import type { Property } from "@/data/property-types";
import { autoValuateProperty, type OpportunityScoreResult, type CesionRemateResult, type OcupadoResult, type SubastaResult, type ZoneLiquidity } from "@/lib/valuationEngine";

const ScoreGauge = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" strokeWidth="8" fill="none" className="stroke-muted" />
          <circle
            cx="50" cy="50" r="40" strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={score >= 90 ? "stroke-[hsl(142,71%,45%)]" : score >= 70 ? "stroke-accent" : score >= 50 ? "stroke-[hsl(48,90%,50%)]" : "stroke-destructive"}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-2 ${color}`}>{label}</span>
    </div>
  );
};

const RiskBadge = ({ level }: { level: "bajo" | "medio" | "alto" }) => {
  const styles = {
    bajo: "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]",
    medio: "bg-[hsl(48,90%,50%)]/15 text-[hsl(48,90%,40%)]",
    alto: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[level]}`}>
      Riesgo {level}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sublabel }: { icon: any; label: string; value: string; sublabel?: string }) => (
  <div className="bg-secondary rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
    {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
  </div>
);

const BreakdownBar = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value} pts</span>
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  </div>
);

const CesionRemateSection = ({ data }: { data: CesionRemateResult }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
      <Target className="w-4 h-4 text-accent" /> Valoración Cesión de Remate
    </h4>
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={DollarSign} label="Valor cesión estimado" value={`${data.valorCesion.toLocaleString("es-ES")} €`} />
      <StatCard icon={TrendingUp} label="Margen beneficio" value={`${data.margenPorcentaje}%`} sublabel={`${data.margenBeneficio.toLocaleString("es-ES")} €`} />
      <StatCard icon={Clock} label="Tiempo posesión est." value={`${data.tiempoPosesionEstimado} meses`} />
      <StatCard icon={Shield} label="Coef. liquidación" value={`${(data.coeficienteLiquidacion * 100).toFixed(0)}%`} />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Riesgo oposición judicial:</span>
      <RiskBadge level={data.riesgoOposicion} />
    </div>
    <div className="bg-secondary rounded-xl p-4">
      <h5 className="text-xs font-bold text-foreground mb-3">Desglose de costes</h5>
      <div className="space-y-2 text-sm">
        {Object.entries(data.desgloseCostes).map(([key, val]) => (
          val > 0 && (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">{key}</span>
              <span className="font-medium text-foreground">{val.toLocaleString("es-ES")} €</span>
            </div>
          )
        ))}
        <div className="flex justify-between border-t border-border pt-2 font-bold">
          <span className="text-foreground">Total costes</span>
          <span className="text-foreground">{data.costesTotales.toLocaleString("es-ES")} €</span>
        </div>
      </div>
    </div>
  </div>
);

const OcupadoSection = ({ data }: { data: OcupadoResult }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-accent" /> Valoración Activo Ocupado
    </h4>
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={DollarSign} label="Valor para inversor" value={`${data.valorInversor.toLocaleString("es-ES")} €`} />
      <StatCard icon={TrendingUp} label="Ahorro vs mercado" value={`-${data.ahorroPorcentaje}%`} sublabel={`${data.ahorro.toLocaleString("es-ES")} € de descuento`} />
      <StatCard icon={Clock} label="Tiempo recuperación" value={`${data.tiempoRecuperacion} meses`} />
      <StatCard icon={Shield} label="Penalización ocupación" value={`-${data.penalizacionPorcentaje}%`} />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Riesgo legal:</span>
      <RiskBadge level={data.riesgoLegal} />
    </div>
  </div>
);

const SubastaSection = ({ data }: { data: SubastaResult }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
      <BarChart3 className="w-4 h-4 text-accent" /> Análisis Subasta
    </h4>
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={DollarSign} label="Precio subasta est." value={`${data.precioSubastaEstimado.toLocaleString("es-ES")} €`} />
      <StatCard icon={TrendingUp} label="Descuento" value={`-${data.descuento}%`} sublabel={`Margen: ${data.margenPotencial.toLocaleString("es-ES")} €`} />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Riesgo judicial ({data.riesgoJudicial}/100):</span>
      <RiskBadge level={data.riesgoNivel} />
    </div>
    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
      <p className="text-sm text-foreground font-medium">{data.recomendacion}</p>
    </div>
  </div>
);

const LiquidityBadge = ({ liquidity }: { liquidity: ZoneLiquidity }) => {
  const styles = {
    alta: "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]",
    media: "bg-[hsl(48,90%,50%)]/15 text-[hsl(48,90%,40%)]",
    baja: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[liquidity]}`}>
      Liquidez {liquidity}
    </span>
  );
};

interface ValuationPanelProps {
  property: Property;
}

const ValuationPanel = ({ property }: ValuationPanelProps) => {
  const valuation = autoValuateProperty(property);
  const { opportunityScore, cesionRemate, ocupado, subasta, zoneLiquidity, discount } = valuation;

  return (
    <div className="space-y-6">
      {/* Opportunity Score */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Scoring de Oportunidad
          </h3>
          <LiquidityBadge liquidity={zoneLiquidity} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={opportunityScore.score} label={opportunityScore.label} color={opportunityScore.color} />
          <div className="flex-1 space-y-3 w-full">
            <BreakdownBar label="Descuento mercado (40%)" value={opportunityScore.breakdown.descuento} max={40} />
            <BreakdownBar label="Rentabilidad (30%)" value={opportunityScore.breakdown.rentabilidad} max={30} />
            <BreakdownBar label="Liquidez zona (20%)" value={opportunityScore.breakdown.liquidez} max={20} />
            <BreakdownBar label="Riesgo legal (−10%)" value={opportunityScore.breakdown.riesgoLegal} max={10} />
          </div>
        </div>

        {discount > 0 && (
          <div className="mt-4 bg-secondary rounded-xl p-3 text-center">
            <p className="text-sm text-muted-foreground">
              Este activo tiene un descuento del <span className="font-bold text-foreground">{discount}%</span> respecto al valor de mercado
            </p>
          </div>
        )}
      </div>

      {/* Specific valuations */}
      {cesionRemate && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <CesionRemateSection data={cesionRemate} />
        </div>
      )}

      {ocupado && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <OcupadoSection data={ocupado} />
        </div>
      )}

      {subasta && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <SubastaSection data={subasta} />
        </div>
      )}
    </div>
  );
};

export default ValuationPanel;
