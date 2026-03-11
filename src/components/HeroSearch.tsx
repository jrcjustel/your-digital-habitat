import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, Shield, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import HeroSearchPanel from "./HeroSearchPanel";

const HeroSearch = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(200,60%,18%)]" />

      {/* Organic blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent/8 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -15, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-accent/4 blur-3xl"
      />

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left – Copy + CTAs */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Zap className="w-3.5 h-3.5" /> Inversión inmobiliaria sin barreras
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.25 }}
              className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.1] mb-5"
            >
              Las mejores oportunidades,
              <br />
              <motion.span
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.55 }}
                className="text-accent"
              >
                ahora también para ti.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="text-primary-foreground/70 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Subastas, NPLs, cesiones de remate… hasta ahora solo los grandes fondos
              accedían a estas oportunidades. Nosotros abrimos la puerta —&nbsp;con datos reales
              y sin letra pequeña.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <Link
                to="/inmuebles"
                className="group inline-flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-bold px-7 py-3.5 rounded-xl text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/25 active:scale-[0.97]"
              >
                <BarChart3 className="w-4 h-4" />
                Ver oportunidades
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="group inline-flex items-center justify-center gap-2.5 border border-primary-foreground/20 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl text-sm hover:border-accent/50 hover:text-accent transition-all active:scale-[0.97]"
              >
                <Phone className="w-4 h-4" />
                Hablar con alguien del equipo
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-6 text-primary-foreground/50 text-xs"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Sin comisiones ocultas</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Para cualquier perfil inversor</span>
              <span>Alta gratuita</span>
            </motion.div>
          </div>

          {/* Right – Search panel */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.4 }}
          >
            <HeroSearchPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
