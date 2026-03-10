import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, TrendingUp, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSearch = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/92" />
        {/* Accent glow */}
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" /> Plataforma nº1 en España
            </span>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.1] mb-6">
              Inversión inmobiliaria
              <br />
              <span className="text-accent">con inteligencia.</span>
            </h1>

            <p className="text-primary-foreground/65 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              Accede a subastas BOE, NPLs, cesiones de remate y oportunidades exclusivas con descuentos de hasta el 60%. Análisis, scoring y acompañamiento experto.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/analisis-inversion"
                className="group inline-flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-bold px-8 py-4 rounded-xl text-base hover:brightness-110 transition-all shadow-lg shadow-accent/25"
              >
                <BarChart3 className="w-5 h-5" />
                Analizar inversión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="group inline-flex items-center justify-center gap-2.5 border-2 border-primary-foreground/20 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-base hover:border-accent/50 hover:text-accent transition-all"
              >
                <Phone className="w-5 h-5" />
                Hablar con asesor
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 text-primary-foreground/50 text-xs">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> NDA digital</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> ROI medio 28%</span>
              <span>Sin coste de alta</span>
            </div>
          </motion.div>

          {/* Right – Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            <StatCard
              value="+27.000"
              label="Activos analizados"
              accent
              delay={0.4}
            />
            <StatCard
              value="42%"
              label="Descuento medio"
              delay={0.5}
            />
            <StatCard
              value="52"
              label="Provincias cubiertas"
              delay={0.6}
            />
            <StatCard
              value="<72h"
              label="Due diligence express"
              accent
              delay={0.7}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ value, label, accent, delay }: { value: string; label: string; accent?: boolean; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`rounded-2xl p-6 backdrop-blur-sm border ${
      accent
        ? "bg-accent/10 border-accent/25"
        : "bg-primary-foreground/5 border-primary-foreground/10"
    }`}
  >
    <p className={`text-3xl font-extrabold mb-1 ${accent ? "text-accent" : "text-primary-foreground"}`}>
      {value}
    </p>
    <p className="text-primary-foreground/50 text-sm font-medium">{label}</p>
  </motion.div>
);

export default HeroSearch;
