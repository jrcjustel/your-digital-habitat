import { AlertTriangle, Home, Gavel, CreditCard, Ban, Building2, Scale, Clock, ExternalLink, Eye, EyeOff } from "lucide-react";
import type { SaleType } from "@/data/properties";
import { useState } from "react";

interface SaleTypeBannerProps {
  saleType: SaleType;
  compact?: boolean;
}

const saleTypeConfig: Record<SaleType, {
  label: string;
  shortLabel: string;
  productTitle: string;
  icon: typeof CreditCard;
  warnings: { icon: typeof Ban; text: string }[];
  legalText: string;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  badgeClass: string;
  // keep for compact mode
  description: string;
  highlights: string[];
}> = {
  npl: {
    label: "Compra de crédito (NPL)",
    shortLabel: "NPL",
    productTitle: "PRODUCTO DE INVERSIÓN: COMPRA DE CRÉDITO (NPL)",
    icon: CreditCard,
    warnings: [
      { icon: EyeOff, text: "No se puede visitar el inmueble" },
      { icon: Building2, text: "No es hipotecable" },
      { icon: Home, text: "No se adquiere la propiedad directamente" },
      { icon: Scale, text: "Requiere proceso judicial para la posesión" },
    ],
    legalText: "Este activo es un crédito hipotecario impagado. La adquisición implica subrogarse en la posición del acreedor, NO la compra directa del inmueble. El comprador asume los riesgos inherentes a la gestión del crédito, incluyendo la posibilidad de no recuperar la totalidad de la inversión. Los plazos de ejecución hipotecaria pueden variar significativamente. Los importes mostrados son orientativos y no constituyen oferta vinculante. Se recomienda asesoramiento jurídico y financiero independiente. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
    bgClass: "bg-destructive/5",
    borderClass: "border-destructive/20",
    iconClass: "text-destructive",
    badgeClass: "bg-destructive text-destructive-foreground",
    description: "Adquisición del crédito hipotecario impagado.",
    highlights: ["Descuentos sobre deuda pendiente", "Requiere gestión judicial o negociación", "Alto potencial de rentabilidad"],
  },
  "cesion-remate": {
    label: "Cesión de remate",
    shortLabel: "Cesión de remate",
    productTitle: "PRODUCTO DE INVERSIÓN: CESIÓN DE REMATE",
    icon: Gavel,
    warnings: [
      { icon: Clock, text: "Plazos de adjudicación variables" },
      { icon: Building2, text: "No es hipotecable hasta inscripción" },
      { icon: Scale, text: "Sujeto a aprobación judicial" },
      { icon: Home, text: "Puede requerir proceso de posesión" },
    ],
    legalText: "Este activo se comercializa mediante cesión de derechos de remate de subasta judicial. El adquirente sustituye al adjudicatario original. La operación está sujeta a la aprobación del juzgado competente. El inmueble puede estar ocupado, lo que requeriría un proceso judicial adicional para obtener la posesión efectiva. Los importes mostrados son orientativos y no constituyen oferta vinculante. Se recomienda asesoramiento jurídico y financiero independiente. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
    bgClass: "bg-accent/5",
    borderClass: "border-accent/20",
    iconClass: "text-accent",
    badgeClass: "bg-accent text-accent-foreground",
    description: "El adjudicatario cede su derecho de adquisición.",
    highlights: ["Precio por debajo de mercado", "Proceso judicial avanzado", "Adquisición directa del inmueble"],
  },
  ocupado: {
    label: "Inmueble ocupado",
    shortLabel: "Ocupado",
    productTitle: "PRODUCTO DE INVERSIÓN: INMUEBLE OCUPADO",
    icon: AlertTriangle,
    warnings: [
      { icon: EyeOff, text: "No se puede visitar el inmueble" },
      { icon: Building2, text: "No es hipotecable hasta desocupación" },
      { icon: Home, text: "Se adquiere la propiedad sin posesión" },
      { icon: Scale, text: "Requiere proceso judicial de desahucio" },
    ],
    legalText: "Este inmueble se encuentra actualmente ocupado. La compra transfiere la propiedad pero NO la posesión, que deberá recuperarse mediante el procedimiento legal correspondiente (desahucio por precario, efectividad de derechos reales inscritos u otro procedimiento aplicable). Los plazos judiciales son variables y pueden extenderse significativamente. Los importes mostrados son orientativos y no constituyen oferta vinculante. Se recomienda asesoramiento jurídico y financiero independiente. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
    bgClass: "bg-muted",
    borderClass: "border-muted-foreground/20",
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted-foreground text-background",
    description: "Inmueble con ocupantes sin título jurídico válido.",
    highlights: ["Máximo descuento sobre mercado", "Requiere gestión de desahucio", "Para inversores experimentados"],
  },
  compraventa: {
    label: "Compraventa de inmueble",
    shortLabel: "Compraventa",
    productTitle: "COMPRAVENTA DE INMUEBLE",
    icon: Home,
    warnings: [],
    legalText: "Los importes mostrados son orientativos y no constituyen oferta vinculante. Las características del inmueble deberán ser verificadas por el comprador. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/20",
    iconClass: "text-primary",
    badgeClass: "bg-primary text-primary-foreground",
    description: "Adquisición directa del inmueble.",
    highlights: ["Proceso de compra estándar", "Escritura pública", "Posesión inmediata (si está libre)"],
  },
};

const SaleTypeBanner = ({ saleType, compact = false }: SaleTypeBannerProps) => {
  const config = saleTypeConfig[saleType];
  const [expanded, setExpanded] = useState(false);
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

  const hasWarnings = config.warnings.length > 0;

  return (
    <div className={`rounded-2xl border ${config.borderClass} ${config.bgClass} overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2">
        <AlertTriangle className={`w-4 h-4 ${config.iconClass} shrink-0`} />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
          {config.productTitle}
        </h3>
      </div>

      {/* Warning pills */}
      {hasWarnings && (
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.warnings.map((w) => {
            const WIcon = w.icon;
            return (
              <div key={w.text} className="flex items-center gap-2 bg-destructive/8 border border-destructive/15 rounded-lg px-3 py-2">
                <WIcon className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-xs font-medium text-foreground">{w.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legal text */}
      <div className="px-5 pb-4">
        <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded && hasWarnings ? "line-clamp-3" : ""}`}>
          {config.legalText}
        </p>
        {hasWarnings && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-accent hover:underline mt-1 flex items-center gap-1"
          >
            {expanded ? "Leer menos" : "Leer aviso legal completo"}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export { saleTypeConfig };
export default SaleTypeBanner;
