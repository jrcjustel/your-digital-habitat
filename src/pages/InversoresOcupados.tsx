import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvestmentListing from "@/components/InvestmentListing";
import RealCaseStudies from "@/components/RealCaseStudies";
import Disclaimer from "@/components/Disclaimer";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import { Home, AlertTriangle, TrendingDown, Scale } from "lucide-react";

const highlights = [
  { icon: Home, text: "Inmueble con ocupantes sin título" },
  { icon: TrendingDown, text: "Máximo descuento sobre valor de mercado" },
  { icon: Scale, text: "Requiere gestión de desahucio" },
  { icon: AlertTriangle, text: "Para inversores experimentados" },
];

const InversoresOcupados = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Inversión en Inmuebles Ocupados</span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Inmuebles Ocupados</h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mb-8">
          Inmuebles que se transmiten sin posesión. El comprador adquiere la propiedad pero debe
          llevar a cabo un <GlossaryTooltip termKey="lanzamiento" showIcon={false}><span className="text-primary-foreground/90">lanzamiento judicial</span></GlossaryTooltip> para obtener la posesión efectiva. Los mayores
          descuentos del mercado para inversores experimentados.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {highlights.map((h) => (
            <div key={h.text} className="bg-primary-foreground/10 rounded-xl p-3 flex items-start gap-2">
              <h.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span className="text-xs text-primary-foreground/90 leading-tight">{h.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <div className="container mx-auto px-4 py-8">
      <InvestmentListing filterFn={(q: any) => q.eq("propiedad_sin_posesion", true)} />
      <Disclaimer type="ocupados" />
    </div>
    <RealCaseStudies filterType="ocupado" />
    <Footer />
  </div>
);

export default InversoresOcupados;
