import { CreditCard, ShieldAlert, Home, Gavel, Scale, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export type OpportunityType = "npl" | "reo-ocupado" | "reo-libre" | "cdr" | "subasta";

interface TypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  tooltip: string;
  learnMoreSlug: string;
}

const typeConfigs: Record<OpportunityType, TypeConfig> = {
  npl: {
    label: "NPL",
    icon: CreditCard,
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    tooltip: "Non-Performing Loan: Compra de deuda hipotecaria impagada con descuento significativo sobre el valor del activo subyacente.",
    learnMoreSlug: "ruta-deuda-npl",
  },
  "reo-ocupado": {
    label: "REO Ocupado",
    icon: ShieldAlert,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    tooltip: "Inmueble propiedad de entidad financiera con ocupante. Requiere proceso de desocupación. Mayor descuento por la complejidad.",
    learnMoreSlug: "ruta-inmuebles-ocupados",
  },
  "reo-libre": {
    label: "REO Libre",
    icon: Home,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    tooltip: "Inmueble libre de ocupantes. Posesión inmediata tras la compra. Menor descuento pero menor riesgo operativo.",
    learnMoreSlug: "ruta-inmuebles-ocupados",
  },
  cdr: {
    label: "Cesión de Remate",
    icon: Gavel,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    tooltip: "Cesión del derecho de adjudicación en subasta judicial. Adquieres la posición del adjudicatario a precio de remate.",
    learnMoreSlug: "ruta-cesiones-remate",
  },
  subasta: {
    label: "Subasta BOE",
    icon: Scale,
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    tooltip: "Postura directa en subasta judicial publicada en el BOE. Requiere depósito previo del 5% del valor de tasación.",
    learnMoreSlug: "ruta-subastas-boe",
  },
};

interface OpportunityTypeBadgeProps {
  type: OpportunityType;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  showLearnMore?: boolean;
}

/**
 * Resolves the opportunity type from property or NPL asset data.
 * Use this helper to derive the badge type without modifying existing data structures.
 */
export function resolveOpportunityType(params: {
  saleType?: string;
  cesionRemate?: boolean;
  propiedadSinPosesion?: boolean;
  estadoOcupacional?: string;
  posturaSubasta?: boolean;
}): OpportunityType {
  const { saleType, cesionRemate, propiedadSinPosesion, estadoOcupacional, posturaSubasta } = params;

  if (cesionRemate || saleType === "cesion-remate") return "cdr";
  if (posturaSubasta) return "subasta";
  if (saleType === "npl") return "npl";
  if (saleType === "ocupado" || propiedadSinPosesion || estadoOcupacional === "ocupado") return "reo-ocupado";
  if (estadoOcupacional === "libre" || saleType === "compraventa") return "reo-libre";

  return "npl";
}

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const iconSizes = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };

const OpportunityTypeBadge = ({
  type,
  size = "md",
  showTooltip = true,
  showLearnMore = false,
}: OpportunityTypeBadgeProps) => {
  const config = typeConfigs[type];
  const Icon = config.icon;

  const badge = (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses[size]} whitespace-nowrap`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-[280px] p-3" side="bottom">
          <p className="text-xs leading-relaxed">{config.tooltip}</p>
          {showLearnMore && (
            <Link
              to={`/academia/ruta/${config.learnMoreSlug}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent mt-2 hover:underline"
            >
              <Info className="w-3 h-3" />
              Aprende más en la Academia →
            </Link>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OpportunityTypeBadge;
