import { Link } from "react-router-dom";
import { Home, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ValuationCta = () => {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/80 px-6 py-6 md:px-10 md:py-8"
        >
          {/* Organic blobs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-40 h-40 bg-accent-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/4 w-24 h-24 bg-accent-foreground/3 rounded-full translate-y-1/2"
          />

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent-foreground/10 text-accent-foreground rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />
                Gratis y sin compromiso
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-extrabold text-accent-foreground mb-2 leading-tight">
                ¿Sabes cuánto vale tu inmueble?
              </h2>
              <p className="text-accent-foreground/70 text-sm max-w-md mb-4 leading-relaxed">
                En 30 segundos tienes una estimación profesional con datos de mercado reales. Ningún dato se comparte con terceros.
              </p>
              <Link
                to="/valorar"
                className="inline-flex items-center gap-2 bg-accent-foreground text-accent font-bold px-6 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity group active:scale-[0.97]"
              >
                <Home className="w-4 h-4" />
                Valorar ahora
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
        </motion.div>
      </div>
    </section>
  );
};

export default ValuationCta;
