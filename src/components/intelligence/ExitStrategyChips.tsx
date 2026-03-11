import type { OpportunityType } from "./OpportunityTypeBadge";
import { Handshake, Gavel, Home, Banknote, KeyRound, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExitStrategy {
  label: string;
  icon: LucideIcon;
}

const strategiesByType: Record<OpportunityType, ExitStrategy[]> = {
  npl: [
    { label: "Negociación", icon: Handshake },
    { label: "Ejecución", icon: Gavel },
    { label: "Dación", icon: KeyRound },
  ],
  "reo-ocupado": [
    { label: "Desahucio + Venta", icon: Home },
    { label: "Cash-flow", icon: Banknote },
    { label: "Negociación salida", icon: Handshake },
  ],
  "reo-libre": [
    { label: "Reforma + Venta", icon: Wrench },
    { label: "Alquiler", icon: Banknote },
  ],
  cdr: [
    { label: "Reforma + Venta", icon: Wrench },
    { label: "Alquiler", icon: Banknote },
  ],
  subasta: [
    { label: "Reforma + Venta", icon: Wrench },
    { label: "Alquiler", icon: Banknote },
    { label: "Reventa", icon: Home },
  ],
};

interface ExitStrategyChipsProps {
  type: OpportunityType;
}

const ExitStrategyChips = ({ type }: ExitStrategyChipsProps) => {
  const strategies = strategiesByType[type];
  if (!strategies) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      <span className="text-[10px] text-muted-foreground/60 mr-0.5">Salida:</span>
      {strategies.map((s) => {
        const Icon = s.icon;
        return (
          <span
            key={s.label}
            className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md"
          >
            <Icon className="w-2.5 h-2.5" />
            {s.label}
          </span>
        );
      })}
    </div>
  );
};

export default ExitStrategyChips;
