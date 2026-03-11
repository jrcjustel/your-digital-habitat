import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export type RiskLevel = "bajo" | "medio" | "alto";

interface RiskTrafficLightProps {
  level: RiskLevel;
  label?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const riskConfig: Record<RiskLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
}> = {
  bajo: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    label: "Riesgo bajo",
    description: "Operación con baja complejidad legal, activo libre o en fase avanzada. Ideal para inversores principiantes.",
    icon: ShieldCheck,
  },
  medio: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    label: "Riesgo medio",
    description: "Operación con complejidad moderada. Puede incluir ocupación parcial o fase judicial intermedia. Requiere análisis detallado.",
    icon: Shield,
  },
  alto: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/20",
    label: "Riesgo alto",
    description: "Operación compleja con litigios activos, ocupación conflictiva o fase judicial temprana. Recomendado para inversores experimentados.",
    icon: ShieldAlert,
  },
};

/**
 * Derive risk level from asset data without modifying existing structures.
 */
export function deriveRiskLevel(params: {
  ocupado: boolean;
  judicializado: boolean;
  faseJudicial?: string | null;
  estadoOcupacional?: string | null;
  discount?: number;
}): RiskLevel {
  const { ocupado, judicializado, faseJudicial, estadoOcupacional } = params;

  let riskScore = 0;

  // Occupancy risk
  if (ocupado || estadoOcupacional === "ocupado" || estadoOcupacional === "ocupado-sin-derecho") riskScore += 3;
  else if (estadoOcupacional === "ocupado-con-derecho") riskScore += 2;
  else if (estadoOcupacional === "desconocido") riskScore += 1;

  // Judicial risk
  if (judicializado) {
    const earlyPhases = ["pre-demanda", "demanda", "oposicion"];
    if (earlyPhases.includes(faseJudicial || "")) riskScore += 3;
    else if (faseJudicial === "ejecucion") riskScore += 2;
    else riskScore += 1;
  }

  if (riskScore >= 4) return "alto";
  if (riskScore >= 2) return "medio";
  return "bajo";
}

const RiskTrafficLight = ({ level, label, size = "md", showLabel = true }: RiskTrafficLightProps) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${config.bgColor} ${config.borderColor} cursor-help transition-shadow hover:shadow-md ${config.glowColor}`}
          >
            <Icon className={`${iconSize} ${config.color}`} />
            {/* Traffic light dots */}
            <div className="flex gap-0.5">
              <span className={`${dotSize} rounded-full ${level === "bajo" ? "bg-emerald-500" : "bg-emerald-500/20"}`} />
              <span className={`${dotSize} rounded-full ${level === "medio" ? "bg-amber-500" : "bg-amber-500/20"}`} />
              <span className={`${dotSize} rounded-full ${level === "alto" ? "bg-red-500" : "bg-red-500/20"}`} />
            </div>
            {showLabel && (
              <span className={`${textSize} font-semibold ${config.color}`}>
                {label || config.label}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] p-3" side="bottom">
          <p className="text-xs leading-relaxed">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RiskTrafficLight;
