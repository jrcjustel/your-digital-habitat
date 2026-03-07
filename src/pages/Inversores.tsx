import { useNavigate } from "react-router-dom";
import { CreditCard, Gavel, Home, Building2, Package, Users, TreePine, Map, Target, Shield, Eye, Award, Headphones, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

const mainCategories = [
  {
    icon: CreditCard,
    label: "NPL (Compra de crédito)",
    description: "Adquiere derechos de crédito hipotecario impagado con descuentos significativos sobre la deuda pendiente.",
    href: "/inversores/npl",
    active: true,
    color: "bg-destructive/10 border-destructive/20 text-destructive",
  },
  {
    icon: Gavel,
    label: "Cesiones de Remate",
    description: "Oportunidades de adjudicación de inmuebles tras subastas judiciales, por debajo del valor de mercado.",
    href: "/inversores/cesiones-remate",
    active: true,
    color: "bg-accent/10 border-accent/20 text-accent",
  },
  {
    icon: Home,
    label: "Inmuebles Ocupados",
    description: "Inmuebles sin posesión con los mayores descuentos del mercado. Para inversores experimentados.",
    href: "/inversores/ocupados",
    active: true,
    color: "bg-primary/10 border-primary/20 text-primary",
  },
];

const futureCategories = [
  { icon: Building2, label: "Obra Parada (WIP)", description: "Promociones sin finalizar listas para retomar" },
  { icon: Package, label: "Grandes Lotes", description: "Paquetes de activos diversificados por geografía y tipo" },
  { icon: Users, label: "Postura en Subasta", description: "Acuerdos de postura para participar en subastas activas" },
  { icon: TreePine, label: "Suelo Rústico", description: "Terrenos rústicos con potencial de revalorización" },
  { icon: Map, label: "Suelo Urbanizable", description: "Suelo con desarrollo urbanístico aprobado o en curso" },
  { icon: Target, label: "Suelo Finalista", description: "Parcelas listas para edificar con licencia en trámite" },
];

const features = [
  { icon: Shield, title: "Confianza", description: "Plataforma respaldada por años de experiencia en el sector inmobiliario español." },
  { icon: Eye, title: "Transparencia", description: "Información completa y verificada de cada activo para decisiones informadas." },
  { icon: Award, title: "Experiencia", description: "Equipo especializado en inversiones inmobiliarias de alta rentabilidad." },
  { icon: Headphones, title: "Asesoramiento", description: "Acompañamiento personalizado en cada paso del proceso de inversión." },
];

const Inversores = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4 text-center">
          <span className="section-label">Plataforma de Inversión</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 max-w-3xl mx-auto">
            Inversión inmobiliaria con alta rentabilidad y seguridad
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accede a oportunidades exclusivas en activos NPL, cesiones de remate, inmuebles ocupados y mucho más.
            Todo verificado por nuestro equipo de expertos.
          </p>
        </div>
      </section>

      {/* Main 3 Categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">Oportunidades de Inversión</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
              Elige tu tipo de inversión
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Tres vehículos de inversión especializados, cada uno con su propio marketplace y documentación detallada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mainCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(cat.href)}
                className="flex flex-col items-center text-center bg-card rounded-2xl p-8 card-elevated group transition-all hover:border-accent cursor-pointer border border-border"
              >
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 ${cat.color}`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                  {cat.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Ver oportunidades <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Future Categories */}
      <section className="py-12 md:py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-label">Próximamente</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-3">
              Más categorías en camino
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {futureCategories.map((cat) => (
              <div
                key={cat.label}
                className="flex items-start gap-3 bg-card rounded-xl p-5 border border-border opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <cat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-semibold text-foreground text-sm">{cat.label}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">Por qué invertir con IKESA</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 max-w-3xl mx-auto">
              Invierte con total seguridad y claridad
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="text-center bg-card rounded-2xl p-8 card-elevated border border-border">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
                  <feat.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Inversores;
