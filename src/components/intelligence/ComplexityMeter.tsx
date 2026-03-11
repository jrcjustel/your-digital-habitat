import type { OpportunityType } from "./OpportunityTypeBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ComplexityMeterProps {
  type: OpportunityType;
  estadoJudicial?: string | null;
}

interface ComplexityInfo {
  level: number; // 1-5
  label: string;
  recommendation: string;
}

function deriveComplexity(type: OpportunityType, estadoJudicial?: string | null): ComplexityInfo {
  let base: number;

  switch (type) {
    case "reo-libre":
      base = 1;
      break;
    case "cdr":
      base = 3;
      break;
    case "subasta":
      base = 3;
      break;
    case "reo-ocupado":
      base = 4;
      break;
    case "npl":
      base = 4;
      break;
    default:
      base = 3;
  }

  // Judicial state increases complexity
  if (estadoJudicial) {
    const ej = estadoJudicial.toLowerCase();
    if (ej.includes("ejecuci") || ej.includes("oposici")) base = Math.min(base + 1, 5);
    else if (ej.includes("pendiente") || ej.includes("recurso")) base = Math.min(base + 1, 5);
  }

  const labels: Record<number, { label: string; recommendation: string }> = {
    1: { label: "Muy baja", recommendation: "Principiante — Apto para primeras operaciones" },
    2: { label: "Baja", recommendation: "Principiante / Intermedio — Requiere conocimientos básicos" },
    3: { label: "Media", recommendation: "Intermedio — Se recomienda experiencia previa" },
    4: { label: "Alta", recommendation: "Avanzado — Requiere experiencia en procesos judiciales" },
    5: { label: "Muy alta", recommendation: "Profesional — Solo para inversores con equipo legal propio" },
  };

  const info = labels[base] || labels[3];
  return { level: base, ...info };
}

const barColors: Record<number, string> = {
  1: "bg-emerald-500",
  2: "bg-emerald-400",
  3: "bg-amber-400",
  4: "bg-orange-500",
  5: "bg-red-500",
};

const ComplexityMeter = ({ type, estadoJudicial }: ComplexityMeterProps) => {
  const { level, label, recommendation } = deriveComplexity(type, estadoJudicial);
  const activeColor = barColors[level] || "bg-muted";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-0.5 cursor-help">
            <div className="flex items-end gap-[2px]" aria-label={`Complejidad: ${label}`}>
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    "w-[4px] rounded-sm transition-colors",
                    bar <= level ? activeColor : "bg-muted/40"
                  )}
                  style={{ height: `${6 + bar * 3}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-muted-foreground leading-none whitespace-nowrap">
              {label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] p-2.5">
          <p className="text-[11px] font-bold text-foreground mb-0.5">Complejidad: {label}</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{recommendation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComplexityMeter;
