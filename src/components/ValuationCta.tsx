import { Link } from "react-router-dom";
import { Home, ArrowRight, Sparkles } from "lucide-react";

const ValuationCta = () => {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/80 px-6 py-6 md:px-10 md:py-8">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent-foreground/10 text-accent-foreground rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />
                Valoración gratuita con IA
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-extrabold text-accent-foreground mb-2 leading-tight">
                ¿Cuánto vale tu inmueble? <span className="opacity-80">Descúbrelo gratis</span>
              </h2>
              <p className="text-accent-foreground/70 text-sm max-w-md mb-4">
                Estimación profesional del valor de mercado en segundos. Sin compromiso.
              </p>
              <Link
                to="/valorar"
                className="inline-flex items-center gap-2 bg-accent-foreground text-accent font-bold px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity group"
              >
                <Home className="w-4 h-4" />
                Valorar mi inmueble
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="bg-accent-foreground/10 backdrop-blur rounded-xl px-5 py-4 text-center">
                <p className="text-2xl font-extrabold text-accent-foreground mb-0.5">+2.000</p>
                <p className="text-[10px] text-accent-foreground/60 font-medium">Valoraciones</p>
              </div>
              <div className="bg-accent-foreground/10 backdrop-blur rounded-xl px-5 py-4 text-center">
                <p className="text-2xl font-extrabold text-accent-foreground mb-0.5">30s</p>
                <p className="text-[10px] text-accent-foreground/60 font-medium">Al instante</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuationCta;
