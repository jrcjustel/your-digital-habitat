import { Shield, Eye, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Confianza",
    description: "Plataforma respaldada por años de experiencia en el sector inmobiliario español.",
  },
  {
    icon: Eye,
    title: "Transparencia",
    description: "Información completa y verificada de cada activo para decisiones informadas.",
  },
  {
    icon: Award,
    title: "Experiencia",
    description: "Equipo especializado en inversiones inmobiliarias de alta rentabilidad.",
  },
  {
    icon: Headphones,
    title: "Asesoramiento",
    description: "Acompañamiento personalizado en cada paso del proceso de inversión.",
  },
];

const WhyInvest = () => {
  return (
    <section className="py-16 md:py-20" id="inversores">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Por qué invertir con IKESA</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 max-w-3xl mx-auto">
            Invierte con total seguridad y claridad en cada decisión
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="text-center bg-card rounded-2xl p-8 card-elevated"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
                <feat.icon className="w-6 h-6 text-primary" />
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
