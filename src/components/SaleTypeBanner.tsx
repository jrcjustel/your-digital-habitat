import { FileText, Gavel, Home, AlertTriangle, TrendingUp, Scale, CreditCard, Building2 } from "lucide-react";
import type { SaleType } from "@/data/properties";

interface SaleTypeBannerProps {
  saleType: SaleType;
  compact?: boolean;
}

const saleTypeConfig: Record<SaleType, {
  label: string;
  shortLabel: string;
  icon: typeof FileText;
  description: string;
  highlights: string[];
  bgClass: string;
  borderClass: string;
  iconClass: string;
  badgeClass: string;
}> = {
  npl: {
    label: "Compra de crédito (NPL)",
    shortLabel: "NPL",
    icon: CreditCard,
    description: "Adquisición del crédito hipotecario impagado. El comprador se subroga en la posición del acreedor, con todos los derechos sobre la garantía inmobiliaria.",
    highlights: [
      "Descuentos sobre deuda pendiente",
      "Requiere gestión judicial o negociación",
      "Alto potencial de rentabilidad",
    ],
    bgClass: "bg-destructive/5",
    borderClass: "border-destructive/20",
    iconClass: "text-destructive",
    badgeClass: "bg-destructive text-destructive-foreground",
  },
  "cesion-remate": {
    label: "Cesión de remate",
    shortLabel: "Cesión de remate",
    icon: Gavel,
    description: "El adjudicatario de una subasta judicial cede su derecho de adquisición a un tercero. El inmueble se adquiere al precio de adjudicación más la cesión.",
    highlights: [
      "Precio por debajo de mercado",
      "Proceso judicial avanzado",
      "Adquisición directa del inmueble",
    ],
    bgClass: "bg-accent/5",
    borderClass: "border-accent/20",
    iconClass: "text-accent",
    badgeClass: "bg-accent text-accent-foreground",
  },
  compraventa: {
    label: "Compraventa de inmueble",
    shortLabel: "Compraventa",
    icon: Home,
    description: "Adquisición directa del inmueble mediante contrato de compraventa. Proceso estándar con escritura pública e inscripción registral.",
    highlights: [
      "Proceso de compra estándar",
      "Escritura pública",
      "Posesión inmediata (si está libre)",
    ],
    bgClass: "bg-primary/5",
    borderClass: "border-primary/20",
    iconClass: "text-primary",
    badgeClass: "bg-primary text-primary-foreground",
  },
  ocupado: {
    label: "Inmueble ocupado",
    shortLabel: "Ocupado",
    icon: AlertTriangle,
    description: "Inmueble con ocupantes sin título jurídico válido. Requiere proceso de desahucio para obtener la posesión efectiva. Máximos descuentos sobre valor de mercado.",
    highlights: [
      "Máximo descuento sobre mercado",
      "Requiere gestión de desahucio",
      "Para inversores experimentados",
    ],
    bgClass: "bg-muted",
    borderClass: "border-muted-foreground/20",
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted-foreground text-background",
  },
};

const SaleTypeBanner = ({ saleType, compact = false }: SaleTypeBannerProps) => {
  const config = saleTypeConfig[saleType];
  if (!config) return null;

  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${config.badgeClass}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.shortLabel}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${config.borderClass} ${config.bgClass} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${config.bgClass} border ${config.borderClass}`}>
          <Icon className={`w-6 h-6 ${config.iconClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
              {config.shortLabel}
            </span>
            <h3 className="text-sm font-bold text-foreground">{config.label}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{config.description}</p>
          <div className="flex flex-wrap gap-2">
            {config.highlights.map((h) => (
              <span key={h} className="text-[11px] font-medium bg-background/80 border border-border rounded-full px-2.5 py-1 text-foreground">
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { saleTypeConfig };
export default SaleTypeBanner;
