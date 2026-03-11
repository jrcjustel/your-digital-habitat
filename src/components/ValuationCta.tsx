import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ValuationCta = () => {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-accent px-8 py-8 md:px-12 md:py-10"
        >
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground/60 mb-2 block">
                Herramienta gratuita
              </span>
              <h2 className="font-heading text-xl md:text-2xl font-extrabold text-accent-foreground mb-2 leading-tight tracking-tight">
                ¿Cuánto vale tu inmueble en el mercado actual?
              </h2>
              <p className="text-accent-foreground/65 text-sm max-w-md mb-5 leading-relaxed">
                Estimación profesional en 30 segundos con datos de mercado reales.
                Sin coste, sin compromiso y sin compartir datos con terceros.
              </p>
              <Link
                to="/valorar"
                className="group inline-flex items-center gap-2 bg-accent-foreground text-accent font-bold px-7 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                Valorar ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0">
              <div className="bg-accent-foreground/10 backdrop-blur rounded-xl px-6 py-5 text-center border border-accent-foreground/5">
                <p className="text-3xl font-extrabold text-accent-foreground tracking-tight">+2.000</p>
                <p className="text-[10px] text-accent-foreground/50 font-semibold mt-1">Valoraciones realizadas</p>
              </div>
              <div className="bg-accent-foreground/10 backdrop-blur rounded-xl px-6 py-5 text-center border border-accent-foreground/5">
                <p className="text-3xl font-extrabold text-accent-foreground tracking-tight">30s</p>
                <p className="text-[10px] text-accent-foreground/50 font-semibold mt-1">Resultado inmediato</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuationCta;