import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, Shield, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import HeroSearchPanel from "./HeroSearchPanel";

const HeroSearch = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background – solid gradient, no photo overlay issues */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(200,60%,18%)]" />
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent/8 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left – Copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" /> Democratizamos la inversión inmobiliaria
            </span>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.1] mb-5">
              Inversión inmobiliaria
              <br />
              <span className="text-accent">al alcance de todos.</span>
            </h1>

            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8 max-w-lg">
              Accede a oportunidades inmobiliarias que antes solo estaban reservadas a grandes fondos e inversores institucionales. Subastas BOE, NPLs, cesiones de remate y más, con total transparencia.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                to="/inmuebles"
                className="group inline-flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-bold px-7 py-3.5 rounded-xl text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/25"
              >
                <BarChart3 className="w-4 h-4" />
                Explorar oportunidades
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="group inline-flex items-center justify-center gap-2.5 border border-primary-foreground/20 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl text-sm hover:border-accent/50 hover:text-accent transition-all"
              >
                <Phone className="w-4 h-4" />
                Hablar con asesor
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 text-primary-foreground/50 text-xs">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> 100% transparente</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Para todos los perfiles</span>
              <span>Sin coste de alta</span>
            </div>
          </motion.div>

          {/* Right – Search panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <HeroSearchPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
