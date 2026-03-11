import { CreditCard, ShieldAlert, Home, Gavel, Scale } from "lucide-react";
import type { OpportunityType } from "./OpportunityTypeBadge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TypeLegendItem {
  type: OpportunityType;
  label: string;
  shortDesc: string;
  icon: typeof CreditCard;
  color: string;
  bgColor: string;
  borderColor: string;
}

const legendItems: TypeLegendItem[] = [
  {
    type: "npl",
    label: "NPL",
    shortDesc: "Compra de deuda",
    icon: CreditCard,
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    type: "reo-ocupado",
    label: "REO Ocupado",
    shortDesc: "Sin posesión",
    icon: ShieldAlert,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  {
    type: "reo-libre",
    label: "REO Libre",
    shortDesc: "Posesión inmediata",
    icon: Home,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    type: "cdr",
    label: "CDR",
    shortDesc: "Cesión de remate",
    icon: Gavel,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    type: "subasta",
    label: "Subasta",
    shortDesc: "Postura en BOE",
    icon: Scale,
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
];

interface OpportunityTypeLegendProps {
  activeType: OpportunityType | "all";
  onTypeChange: (type: OpportunityType | "all") => void;
  counts?: Partial<Record<OpportunityType, number>>;
}

const OpportunityTypeLegend = ({ activeType, onTypeChange, counts }: OpportunityTypeLegendProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-3 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All button */}
        <button
          onClick={() => onTypeChange("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shrink-0",
            activeType === "all"
              ? "bg-foreground text-background border-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
          )}
        >
          Todos
        </button>

        {legendItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeType === item.type;
          const count = counts?.[item.type];

          return (
            <motion.button
              key={item.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              onClick={() => onTypeChange(item.type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shrink-0",
                isActive
                  ? `${item.bgColor} ${item.color} ${item.borderColor} shadow-sm ring-1 ring-offset-1 ring-offset-background ${item.borderColor.replace("border-", "ring-")}`
                  : `bg-muted/30 text-muted-foreground border-border/50 hover:${item.bgColor} hover:${item.color} hover:${item.borderColor}`
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(" ")[0]}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                  isActive ? `${item.bgColor} ${item.color}` : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default OpportunityTypeLegend;
