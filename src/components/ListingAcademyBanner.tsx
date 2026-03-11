import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingAcademyBannerProps {
  assetType: "npl" | "cesion" | "ocupado";
}

const config = {
  npl: {
    title: "¿Nuevo en NPL?",
    description: "Aprende cómo funciona la compra de crédito impagado, los riesgos y las estrategias de salida en nuestra ruta formativa.",
    rutaSlug: "deuda-npl",
    rutaLabel: "Ruta NPL",
  },
  cesion: {
    title: "¿Qué es una Cesión de Remate?",
    description: "Descubre cómo se adquiere un inmueble por debajo de mercado a través de la cesión del derecho de adjudicación.",
    rutaSlug: "cesiones-remate",
    rutaLabel: "Ruta Cesiones",
  },
  ocupado: {
    title: "¿Invertir en ocupados?",
    description: "Entiende los plazos judiciales, la gestión del lanzamiento y las claves para rentabilizar inmuebles sin posesión.",
    rutaSlug: "ocupados",
    rutaLabel: "Ruta Ocupados",
  },
};

const ListingAcademyBanner = ({ assetType }: ListingAcademyBannerProps) => {
  const c = config[assetType];
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary rounded-2xl border border-accent/20 p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
        <BookOpen className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground mb-0.5">{c.title}</p>
        <p className="text-xs text-muted-foreground">{c.description}</p>
      </div>
      <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
        <Link to={`/academia/ruta/${c.rutaSlug}`}>
          {c.rutaLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </Button>
    </div>
  );
};

export default ListingAcademyBanner;
