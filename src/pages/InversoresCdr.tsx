import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvestmentListing from "@/components/InvestmentListing";
import RealCaseStudies from "@/components/RealCaseStudies";
import Disclaimer from "@/components/Disclaimer";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import { Gavel, Scale, Home, FileText } from "lucide-react";

const highlights = [
  { icon: Gavel, text: "Derecho de adjudicación tras subasta" },
  { icon: Scale, text: "Proceso judicial ya avanzado" },
  { icon: Home, text: "Adquisición directa del inmueble" },
  { icon: FileText, text: "Cesión ante el Juez" },
];

const InversoresCdr = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Inversión en <GlossaryTooltip termKey="cdr" showIcon={false}><span className="text-accent">Cesiones de Remate</span></GlossaryTooltip></span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Cesiones de Remate</h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mb-8">
          Cuando la <GlossaryTooltip termKey="subasta" showIcon={false}><span className="text-primary-foreground/90">subasta</span></GlossaryTooltip> queda desierta o el ejecutante resulta mejor postor, éste puede ceder
          su derecho de adjudicación a un tercero. El inmueble se adquiere al precio de adjudicación
          más la cesión, ante el Juez, por debajo de su <GlossaryTooltip termKey="valor-mercado" showIcon={false}><span className="text-primary-foreground/90">valor de mercado</span></GlossaryTooltip>.
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
      <InvestmentListing filterFn={(q: any) => q.eq("cesion_remate", true)} />
      <Disclaimer type="cesion-remate" />
    </div>
    <RealCaseStudies filterType="cesion" />
    <Footer />
  </div>
);

export default InversoresCdr;
