import { useMemo } from "react";
import { calculateInvestScore } from "./IkesaInvestScore";
import { deriveRiskLevel } from "./RiskTrafficLight";
import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ListingScorePreviewProps {
  price: number;
  marketValue: number;
  ocupado: boolean;
  judicializado?: boolean;
  faseJudicial?: string | null;
  provincia?: string | null;
  estadoOcupacional?: string | null;
}

const scoreColor = (s: number) =>
  s >= 65
    ? "text-emerald-600 dark:text-emerald-400"
    : s >= 40
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

const scoreBg = (s: number) =>
  s >= 65
    ? "bg-emerald-500"
    : s >= 40
      ? "bg-amber-500"
      : "bg-red-500";

const riskMeta: Record<string, { icon: typeof ShieldCheck; color: string; label: string; desc: string }> = {
  bajo: { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", label: "Bajo", desc: "Baja complejidad. Apto para principiantes." },
  medio: { icon: Shield, color: "text-amber-600 dark:text-amber-400", label: "Medio", desc: "Complejidad moderada. Requiere análisis." },
  alto: { icon: ShieldAlert, color: "text-red-600 dark:text-red-400", label: "Alto", desc: "Alta complejidad. Para expertos." },
};

const ListingScorePreview = ({
  price,
  marketValue,
  ocupado,
  judicializado = false,
  faseJudicial,
  provincia,
  estadoOcupacional,
}: ListingScorePreviewProps) => {
  const { score } = useMemo(
    () =>
      calculateInvestScore({
        price,
        marketValue,
        ocupado,
        judicializado,
        faseJudicial,
        provincia,
        estadoOcupacional,
      }),
    [price, marketValue, ocupado, judicializado, faseJudicial, provincia, estadoOcupacional],
  );

  const risk = useMemo(
    () =>
      deriveRiskLevel({
        ocupado,
        judicializado,
        faseJudicial,
        estadoOcupacional,
      }),
    [ocupado, judicializado, faseJudicial, estadoOcupacional],
  );

  if (marketValue <= 0 || price <= 0) return null;

  const rm = riskMeta[risk];
  const RiskIcon = rm.icon;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 shrink-0">
        {/* Score */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${(score / 100) * 94.25} 94.25`}
                    strokeLinecap="round"
                    className={scoreColor(score)}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${scoreColor(score)}`}>
                  {score}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] p-2.5">
            <p className="text-[11px] font-semibold mb-1">IKESA Invest Score</p>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full bg-muted/30 overflow-hidden`}>
                <div className={`h-full rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
              </div>
              <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}/100</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {score >= 65 ? "Oportunidad destacada" : score >= 40 ? "Equilibrada" : "Alto riesgo"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Risk */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`cursor-help ${rm.color}`}>
              <RiskIcon className="w-4 h-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] p-2.5">
            <p className="text-[11px] font-semibold">Riesgo: {rm.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{rm.desc}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ListingScorePreview;
