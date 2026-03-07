import { Shield, Eye, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Acceso democratizado",
    description: "Oportunidades inmobiliarias que antes solo estaban al alcance de grandes fondos, ahora accesibles para todos los inversores.",
  },
  {
    icon: Eye,
    title: "Transparencia total",
    description: "Información completa y verificada de cada activo. Sin letra pequeña ni intermediarios opacos.",
  },
  {
    icon: Award,
    title: "Tecnología al servicio",
    description: "Valoraciones con IA, análisis de mercado y herramientas profesionales para tomar decisiones informadas.",
  },
  {
    icon: Headphones,
    title: "Acompañamiento experto",
    description: "Asesoramiento personalizado en cada paso. Invertir en inmobiliario nunca fue tan sencillo ni tan seguro.",
  },
];

const WhyInvest = () => {
  return (
    <section className="py-16 md:py-20" id="inversores">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Inversión inmobiliaria para todos</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 max-w-3xl mx-auto">
            Democratizamos el acceso a la inversión inmobiliaria profesional
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Rompemos las barreras de entrada al mercado inmobiliario. Accede a activos de alta rentabilidad con total transparencia y respaldo profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="text-center bg-card rounded-2xl p-8 card-elevated"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
                <feat.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvest;
