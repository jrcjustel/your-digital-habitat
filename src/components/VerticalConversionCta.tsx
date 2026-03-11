import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, Target, BookOpen, MessageCircle } from "lucide-react";

interface VerticalConversionCtaProps {
  assetType: "npl" | "cesion" | "ocupado";
}

const config = {
  npl: {
    ctas: [
      { icon: Calculator, label: "Simula tu ROI en NPL", href: "/herramientas/simulador-roi", variant: "default" as const },
      { icon: Target, label: "Descubre tu perfil inversor", href: "/guia-inversion/test-inversor", variant: "outline" as const },
      { icon: BookOpen, label: "Metodología de scoring", href: "/guia-inversion/scoring", variant: "outline" as const },
    ],
  },
  cesion: {
    ctas: [
      { icon: Calculator, label: "Calcula tu inversión en CDR", href: "/herramientas/simulador-roi", variant: "default" as const },
      { icon: Target, label: "Test de perfil inversor", href: "/guia-inversion/test-inversor", variant: "outline" as const },
      { icon: BookOpen, label: "Guía marco legal", href: "/guia-inversion/marco-legal", variant: "outline" as const },
    ],
  },
  ocupado: {
    ctas: [
      { icon: Calculator, label: "Simula rentabilidad", href: "/herramientas/simulador-roi", variant: "default" as const },
      { icon: BookOpen, label: "Marco legal ocupados", href: "/guia-inversion/marco-legal", variant: "outline" as const },
      { icon: MessageCircle, label: "Habla con un especialista", href: "/contacto", variant: "outline" as const },
    ],
  },
};

const VerticalConversionCta = ({ assetType }: VerticalConversionCtaProps) => {
  const c = config[assetType];
  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border p-6 my-8">
      <h3 className="font-heading text-base font-bold text-foreground mb-1">¿Listo para dar el siguiente paso?</h3>
      <p className="text-xs text-muted-foreground mb-4">Herramientas y guías para tomar decisiones informadas.</p>
      <div className="flex flex-wrap gap-3">
        {c.ctas.map((cta) => (
          <Button key={cta.href} asChild variant={cta.variant} size="sm" className="gap-2">
            <Link to={cta.href}>
              <cta.icon className="w-4 h-4" /> {cta.label} <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VerticalConversionCta;
