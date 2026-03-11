import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

type AssetCategory = "npl" | "cdr" | "ocupado" | "subasta" | "libre";

interface AcademyMapping {
  route: string;
  routeTitle: string;
  icon: string;
  articles: { title: string; slug: string }[];
  cta: string;
}

const categoryMappings: Record<AssetCategory, AcademyMapping> = {
  npl: {
    route: "ruta-deuda-npl",
    routeTitle: "Ruta Deuda / NPL",
    icon: "💰",
    articles: [
      { title: "¿Qué es un NPL y cómo funciona?", slug: "que-es-npl-non-performing-loan" },
      { title: "Rentabilidad real de un NPL", slug: "rentabilidad-real-inversion-npl" },
    ],
    cta: "¿Primera vez con NPLs?",
  },
  cdr: {
    route: "ruta-cesiones-remate",
    routeTitle: "Ruta Cesiones de Remate",
    icon: "⚖️",
    articles: [
      { title: "Qué es una cesión de remate", slug: "que-es-cesion-de-remate" },
      { title: "Ventajas de la cesión de remate", slug: "ventajas-cesion-remate-inversor" },
    ],
    cta: "¿Qué es una cesión de remate?",
  },
  ocupado: {
    route: "ruta-inmuebles-ocupados",
    routeTitle: "Ruta Inmuebles Ocupados",
    icon: "🏚️",
    articles: [
      { title: "Tipos de ocupación y descuentos reales", slug: "tipos-ocupacion-descuentos-reales" },
      { title: "Cash for Keys: negociar la salida", slug: "cash-for-keys-guia-completa" },
    ],
    cta: "¿Cómo funciona invertir en ocupados?",
  },
  subasta: {
    route: "ruta-subastas-boe",
    routeTitle: "Ruta Subastas BOE",
    icon: "🔨",
    articles: [
      { title: "Cómo participar en subastas BOE", slug: "guia-subastas-boe-paso-a-paso" },
      { title: "Errores al pujar en subastas", slug: "errores-comunes-subastas-judiciales" },
    ],
    cta: "¿Cómo funciona una subasta BOE?",
  },
  libre: {
    route: "ruta-inmuebles-ocupados",
    routeTitle: "Inversión inmobiliaria",
    icon: "🏠",
    articles: [
      { title: "Guía para invertir en REOs", slug: "guia-inversion-reo-espana" },
    ],
    cta: "Aprende sobre inversión inmobiliaria",
  },
};

interface AcademyContextualLinkProps {
  category: AssetCategory;
  variant?: "card" | "inline" | "banner";
}

/**
 * Resolve academy category from asset properties without modifying existing data.
 */
export function resolveAcademyCategory(params: {
  saleType?: string;
  cesionRemate?: boolean;
  propiedadSinPosesion?: boolean;
  estadoOcupacional?: string | null;
  posturaSubasta?: boolean;
}): AssetCategory {
  const { saleType, cesionRemate, propiedadSinPosesion, estadoOcupacional, posturaSubasta } = params;

  if (cesionRemate || saleType === "cesion-remate") return "cdr";
  if (posturaSubasta) return "subasta";
  if (saleType === "npl") return "npl";
  if (saleType === "ocupado" || propiedadSinPosesion || estadoOcupacional === "ocupado") return "ocupado";
  return "libre";
}

const AcademyContextualLink = ({ category, variant = "card" }: AcademyContextualLinkProps) => {
  const mapping = categoryMappings[category];

  if (variant === "inline") {
    return (
      <Link
        to={`/academia/ruta/${mapping.route}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline group"
      >
        <BookOpen className="w-3.5 h-3.5" />
        {mapping.cta}
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{mapping.cta}</p>
          <Link
            to={`/academia/ruta/${mapping.route}`}
            className="text-[11px] text-accent hover:underline"
          >
            Ver {mapping.routeTitle} →
          </Link>
        </div>
      </motion.div>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-3 bg-accent/5 border-b border-border flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Academia IKESA</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">{mapping.icon}</span>
          {mapping.cta}
        </p>
        <div className="space-y-2">
          {mapping.articles.map((article) => (
            <Link
              key={article.slug}
              to={`/academia/${article.slug}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors group"
            >
              <BookOpen className="w-3 h-3 shrink-0 text-accent/60 group-hover:text-accent" />
              <span className="group-hover:underline">{article.title}</span>
            </Link>
          ))}
        </div>
        <Link
          to={`/academia/ruta/${mapping.route}`}
          className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/5 hover:bg-accent hover:text-white rounded-lg py-2 px-3 transition-all duration-300 hover:shadow-md mt-2"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Ver ruta formativa completa
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default AcademyContextualLink;
