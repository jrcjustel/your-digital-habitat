import { useNavigate } from "react-router-dom";
import { Play, ArrowRight, GraduationCap, TrendingUp, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { value: "4", label: "Rutas formativas" },
  { value: "+40", label: "Lecciones prácticas" },
  { value: "100%", label: "Gratuito" },
];

const pillars = [
  { icon: GraduationCap, title: "Aprende", desc: "Formación estructurada en activos distressed" },
  { icon: TrendingUp, title: "Analiza", desc: "Herramientas profesionales de valoración" },
  { icon: Shield, title: "Invierte", desc: "Acceso directo a oportunidades reales" },
];

const HeroSearch = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/50" />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-[0.15em] uppercase rounded bg-accent/20 text-accent">
              <GraduationCap className="w-3.5 h-3.5" />
              IKESA Investor Academy
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-primary-foreground leading-[1.08] tracking-tight mb-4">
              Aprende a invertir en inmobiliario
              <span className="block text-accent">desde cero</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/50 font-medium mb-2 leading-relaxed">
              La academia que democratiza la inversión inmobiliaria en España
            </p>

            <p className="text-sm text-primary-foreground/40 leading-relaxed mb-8 max-w-lg">
              IKESA Investor Academy es una plataforma educativa diseñada para enseñar a cualquier persona cómo invertir en el mercado inmobiliario de forma segura y profesional.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => navigate("/academia")}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold bg-accent text-accent-foreground rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/20"
              >
                <Play className="w-4 h-4" />
                Empieza gratis
              </button>
              <button
                onClick={() => navigate("/como-funciona")}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-primary-foreground/80 bg-primary-foreground/10 hover:bg-primary-foreground/15 rounded-lg transition-all border border-primary-foreground/10"
              >
                Cómo funciona
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-accent">{s.value}</p>
                  <p className="text-xs text-primary-foreground/40">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – Pillar cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col gap-4"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:border-accent/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-foreground text-sm mb-0.5">{p.title}</h3>
                    <p className="text-xs text-primary-foreground/45">{p.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
