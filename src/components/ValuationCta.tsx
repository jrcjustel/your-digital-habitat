import { Link } from "react-router-dom";
import { Home, ArrowRight, Sparkles } from "lucide-react";

const ValuationCta = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent/90 to-accent/70 p-8 md:p-14">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent-foreground/10 text-accent-foreground rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Valoración gratuita con IA
              </div>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-accent-foreground mb-4 leading-tight">
                ¿Cuánto vale tu inmueble?
                <br />
                <span className="opacity-80">Descúbrelo gratis</span>
              </h2>
              <p className="text-accent-foreground/70 text-base md:text-lg max-w-lg mb-8">
                Obtén una estimación profesional del valor de mercado de tu propiedad en segundos. Sin compromiso, sin registro.
              </p>
              <Link
                to="/valorar"
                className="inline-flex items-center gap-3 bg-accent-foreground text-accent font-bold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-opacity group"
              >
                <Home className="w-5 h-5" />
                Valorar mi inmueble
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden md:flex flex-col items-center gap-3 shrink-0">
              <div className="bg-accent-foreground/10 backdrop-blur rounded-2xl p-6 text-center w-48">
                <p className="text-4xl font-extrabold text-accent-foreground mb-1">+2.000</p>
                <p className="text-xs text-accent-foreground/60 font-medium">Valoraciones realizadas</p>
              </div>
              <div className="bg-accent-foreground/10 backdrop-blur rounded-2xl p-6 text-center w-48">
                <p className="text-4xl font-extrabold text-accent-foreground mb-1">30s</p>
                <p className="text-xs text-accent-foreground/60 font-medium">Resultado al instante</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuationCta;
