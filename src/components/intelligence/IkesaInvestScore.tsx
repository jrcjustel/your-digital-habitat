import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, Scale, Users, MapPin, Clock } from "lucide-react";

interface ScoreFactors {
  discount: number;      // 0-100 weight 40%
  legalComplexity: number; // 0-100 weight 20%
  occupancy: number;     // 0-100 weight 15%
  liquidity: number;     // 0-100 weight 15%
  timeline: number;      // 0-100 weight 10%
}

interface IkesaInvestScoreProps {
  score: number; // 0-100
  factors?: ScoreFactors;
  size?: "sm" | "md" | "lg";
  showFactors?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 65) return { stroke: "hsl(142, 71%, 45%)", bg: "hsl(142, 71%, 45%, 0.1)", label: "Oportunidad destacada", textColor: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 40) return { stroke: "hsl(45, 93%, 47%)", bg: "hsl(45, 93%, 47%, 0.1)", label: "Equilibrada", textColor: "text-amber-600 dark:text-amber-400" };
  return { stroke: "hsl(0, 72%, 51%)", bg: "hsl(0, 72%, 51%, 0.1)", label: "Alto riesgo", textColor: "text-red-600 dark:text-red-400" };
};

const factorMeta = [
  { key: "discount" as const, label: "Descuento", icon: TrendingUp, weight: "40%" },
  { key: "legalComplexity" as const, label: "Complejidad legal", icon: Scale, weight: "20%" },
  { key: "occupancy" as const, label: "Ocupación", icon: Users, weight: "15%" },
  { key: "liquidity" as const, label: "Liquidez zona", icon: MapPin, weight: "15%" },
  { key: "timeline" as const, label: "Timeline", icon: Clock, weight: "10%" },
];

const sizes = {
  sm: { svgSize: 80, radius: 32, strokeWidth: 5, fontSize: "text-lg", labelSize: "text-[8px]" },
  md: { svgSize: 120, radius: 48, strokeWidth: 6, fontSize: "text-2xl", labelSize: "text-[10px]" },
  lg: { svgSize: 160, radius: 64, strokeWidth: 8, fontSize: "text-3xl", labelSize: "text-xs" },
};

/**
 * Calculate IKESA Invest Score from asset data without modifying existing structures.
 */
export function calculateInvestScore(params: {
  price: number;
  marketValue: number;
  ocupado: boolean;
  judicializado: boolean;
  faseJudicial?: string | null;
  provincia?: string | null;
  estadoOcupacional?: string | null;
}): { score: number; factors: ScoreFactors } {
  const { price, marketValue, ocupado, judicializado, faseJudicial, provincia, estadoOcupacional } = params;

  // Discount factor (higher discount = higher score)
  const discountPct = marketValue > 0 ? ((marketValue - price) / marketValue) * 100 : 0;
  const discount = Math.min(100, Math.max(0, discountPct * 2)); // 50% discount = 100 score

  // Legal complexity (lower complexity = higher score)
  const phaseScores: Record<string, number> = {
    "posesion": 90, "adjudicacion": 75, "subasta": 60,
    "ejecucion": 45, "demanda": 35, "oposicion": 30, "pre-demanda": 50,
  };
  const legalComplexity = judicializado
    ? (phaseScores[faseJudicial || ""] || 40)
    : 85;

  // Occupancy (libre = high score, ocupado = low)
  const occupancyScores: Record<string, number> = {
    "libre": 95, "desconocido": 50, "ocupado-con-derecho": 30,
    "ocupado-sin-derecho": 20, "ocupado": 25,
  };
  const occupancy = ocupado ? 25 : (occupancyScores[estadoOcupacional || "libre"] || 50);

  // Liquidity (simplified by province tier)
  const highLiquidity = ["Madrid", "Barcelona", "Valencia", "Málaga", "Sevilla", "Alicante", "Palma de Mallorca"];
  const medLiquidity = ["Bilbao", "Zaragoza", "Murcia", "Granada", "Las Palmas", "Santa Cruz de Tenerife", "Cádiz", "Córdoba"];
  const liquidity = highLiquidity.some(p => provincia?.includes(p)) ? 85
    : medLiquidity.some(p => provincia?.includes(p)) ? 65
    : 45;

  // Timeline (shorter = higher score)
  const timelineScores: Record<string, number> = {
    "posesion": 95, "adjudicacion": 80, "subasta": 60,
    "ejecucion": 40, "demanda": 30, "pre-demanda": 50,
  };
  const timeline = ocupado ? 25 : (timelineScores[faseJudicial || "posesion"] || 70);

  const factors: ScoreFactors = { discount, legalComplexity, occupancy, liquidity, timeline };

  const score = Math.round(
    discount * 0.4 +
    legalComplexity * 0.2 +
    occupancy * 0.15 +
    liquidity * 0.15 +
    timeline * 0.1
  );

  return { score: Math.min(100, Math.max(0, score)), factors };
}

const IkesaInvestScore = ({
  score,
  factors,
  size = "md",
  showFactors = true,
}: IkesaInvestScoreProps) => {
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const progress = (score / 100) * circumference;
  const colorInfo = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Gauge */}
      <div className="relative" style={{ width: config.svgSize, height: config.svgSize }}>
        <svg
          width={config.svgSize}
          height={config.svgSize}
          viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={config.radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.svgSize / 2}
            cy={config.svgSize / 2}
            r={config.radius}
            fill="none"
            stroke={colorInfo.stroke}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-heading font-black ${config.fontSize} ${colorInfo.textColor} tabular-nums`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`${config.labelSize} text-muted-foreground font-medium`}>/ 100</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IKESA Invest Score</p>
        <p className={`text-xs font-semibold ${colorInfo.textColor}`}>{colorInfo.label}</p>
      </div>

      {/* Factor breakdown */}
      {showFactors && factors && size !== "sm" && (
        <div className="w-full space-y-1.5 mt-1">
          {factorMeta.map(({ key, label, icon: Icon, weight }) => (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 group cursor-help">
                    <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground flex-1 truncate">{label}</span>
                    <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getScoreColor(factors[key]).stroke }}
                        initial={{ width: 0 }}
                        animate={{ width: `${factors[key]}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-foreground tabular-nums w-6 text-right">
                      {Math.round(factors[key])}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  {label} — Peso: {weight}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
};

export default IkesaInvestScore;
