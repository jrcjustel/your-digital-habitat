import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import HeroSearchPanel from "./HeroSearchPanel";
import heroPremium from "@/assets/hero-premium.jpg";

const HeroSearch = () => {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Premium photo background */}
      <div className="absolute inset-0">
        <img
          src={heroPremium}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-primary/20" />
      </div>

      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Premium copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 border border-accent/30 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent tracking-wide uppercase">Plataforma de inversión inmobiliaria</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-heading text-4xl md:text-5xl lg:text-[3.6rem] font-extrabold text-primary-foreground leading-[1.08] mb-6 tracking-tight"
            >
              Accede a oportunidades
              <br />
              que antes solo veían
              <br />
              <span className="text-accent">los grandes fondos.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-primary-foreground/65 text-lg leading-relaxed mb-10 max-w-lg"
            >
              Subastas judiciales, carteras NPL, cesiones de remate e inmuebles
              ocupados —&nbsp;analizados con datos reales y listos para invertir.
            </motion.p>

            {/* Bloomberg-style metrics strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex items-center gap-6 mb-10 border-l-2 border-accent/40 pl-5"
            >
              <div>
                <p className="text-2xl font-extrabold text-primary-foreground tracking-tight">+27.000</p>
                <p className="text-[11px] text-primary-foreground/45 font-medium">activos analizados</p>
              </div>
              <div className="w-px h-10 bg-primary-foreground/15" />
              <div>
                <p className="text-2xl font-extrabold text-accent tracking-tight">42%</p>
                <p className="text-[11px] text-primary-foreground/45 font-medium">descuento medio</p>
              </div>
              <div className="w-px h-10 bg-primary-foreground/15" />
              <div>
                <p className="text-2xl font-extrabold text-primary-foreground tracking-tight">52</p>
                <p className="text-[11px] text-primary-foreground/45 font-medium">provincias</p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <Link
                to="/inmuebles"
                className="group inline-flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-bold px-8 py-4 rounded-xl text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/25 active:scale-[0.97]"
              >
                <TrendingUp className="w-4 h-4" />
                Explorar oportunidades
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="group inline-flex items-center justify-center gap-2.5 bg-primary-foreground/8 backdrop-blur-sm border border-primary-foreground/15 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-sm hover:bg-primary-foreground/12 hover:border-primary-foreground/25 transition-all active:scale-[0.97]"
              >
                <Phone className="w-4 h-4" />
                Hablar con el equipo
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="flex items-center gap-5 text-primary-foreground/40 text-xs"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Sin comisiones ocultas</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Datos verificados</span>
              <span>Registro gratuito</span>
            </motion.div>
          </div>

          {/* Right – Search panel with premium frame */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow effect behind panel */}
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl" />
            <div className="relative">
              <HeroSearchPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;