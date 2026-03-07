import { useNavigate } from "react-router-dom";
import { Building2, Landmark, Package, FileText, Gavel, Users, TreePine, Map, Target, Shield, Eye, Award, Headphones, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

const categories = [
  { icon: FileText, label: "NPL (Deuda)", description: "Carteras de crédito impagado con descuentos significativos", href: "/npl", active: true },
  { icon: Gavel, label: "Cesiones de Remate", description: "Oportunidades en subastas judiciales con alto potencial", href: "/npl", active: true },
  { icon: Building2, label: "Obra Parada (WIP)", description: "Promociones sin finalizar listas para retomar", href: "#", active: false },
  { icon: Landmark, label: "Edificios", description: "Edificios completos para rehabilitación o explotación", href: "#", active: false },
  { icon: Package, label: "Grandes Lotes", description: "Paquetes de activos diversificados por geografía y tipo", href: "#", active: false },
  { icon: Users, label: "Activos Ocupados", description: "Inmuebles con inquilinos y rentabilidad desde el primer día", href: "#", active: false },
  { icon: TreePine, label: "Suelo Rústico", description: "Terrenos rústicos con potencial de revalorización", href: "#", active: false },
  { icon: Map, label: "Suelo Urbanizable", description: "Suelo con desarrollo urbanístico aprobado o en curso", href: "#", active: false },
  { icon: Target, label: "Suelo Finalista", description: "Parcelas listas para edificar con licencia en trámite", href: "#", active: false },
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
            Accede a oportunidades exclusivas en activos NPL, cesiones de remate, obra parada y mucho más. Todo verificado por nuestro equipo de expertos.
          </p>
        </div>
      </section>

      {/* Asset Categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">Marketplace de Inversión</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
              Categorías de activos disponibles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => cat.active && navigate(cat.href)}
                disabled={!cat.active}
                className={`flex items-start gap-4 bg-card rounded-xl p-6 text-left card-elevated group transition-all ${
                  cat.active
                    ? "hover:border-accent cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors">
                  <cat.icon className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-semibold text-foreground group-hover:text-accent transition-colors">
                      {cat.label}
                    </span>
                    {cat.active && <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />}
                    {!cat.active && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">Por qué invertir con IKESA</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 max-w-3xl mx-auto">
              Invierte con total seguridad y claridad
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="text-center bg-card rounded-2xl p-8 card-elevated">
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
