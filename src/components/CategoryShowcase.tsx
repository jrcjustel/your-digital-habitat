import { Link } from "react-router-dom";
import { ArrowRight, Gavel, FileText, Home, Key, Map } from "lucide-react";
import { motion } from "framer-motion";
import rutaNpl from "@/assets/ruta-deuda-npl.jpg";
import rutaCdr from "@/assets/ruta-cesiones-remate.jpg";
import rutaOcupados from "@/assets/ruta-ocupados.jpg";
import rutaSubastas from "@/assets/ruta-subastas-boe.jpg";

const categories = [
  {
    icon: Gavel,
    title: "Subastas BOE",
    desc: "Subastas judiciales en directo. Las analizamos y te decimos cuáles merecen la pena.",
    image: rutaSubastas,
    href: "/subastas",
    tag: "En vivo",
    stats: "Actualización diaria",
  },
  {
    icon: FileText,
    title: "NPL — Compra de deuda",
    desc: "Carteras de créditos impagados con descuentos reales. El segmento más rentable del mercado.",
    image: rutaNpl,
    href: "/npl",
    tag: "Alta rentabilidad",
    stats: "Descuento medio 42%",
  },
  {
    icon: Key,
    title: "Cesiones de remate",
    desc: "Te cedes la adjudicación. Tú adquieres el inmueble a precio de subasta, sin subastar.",
    image: rutaCdr,
    href: "/inmuebles?saleType=cesion-remate",
    tag: "Acceso directo",
    stats: "ROI medio 28%",
  },
  {
    icon: Home,
    title: "Inmuebles ocupados",
    desc: "Precios muy por debajo de mercado. Te acompañamos en todo el proceso de recuperación.",
    image: rutaOcupados,
    href: "/inmuebles?saleType=ocupado",
    tag: "Precio reducido",
    stats: "Hasta -55% mercado",
  },
];

const CategoryShowcase = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Header – left-aligned for organic feel */}
        <div className="max-w-2xl mb-14">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="section-label"
          >
            Tipos de inversión
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3"
          >
            Cuatro caminos,{" "}
            <span className="text-accent">un mismo objetivo</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 text-lg leading-relaxed"
          >
            Cada tipo de activo tiene su lógica, su perfil de riesgo y su momento.
            Elige el que encaje con tu estrategia —&nbsp;o explóralos todos.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              <Link
                to={cat.href}
                className="group flex flex-col sm:flex-row bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 card-elevated h-full"
              >
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {cat.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="group-hover:rotate-6 transition-transform duration-300">
                        <cat.icon className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                        {cat.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                      {cat.stats}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                      Explorar <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Map CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.3 }}
          className="mt-8"
        >
          <Link
            to="/mapa"
            className="group flex items-center justify-between bg-secondary rounded-2xl px-8 py-5 border border-border hover:border-accent/30 transition-all active:scale-[0.995]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <Map className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors">
                  Explorar por mapa
                </h4>
                <p className="text-sm text-muted-foreground">
                  Busca oportunidades cerca de donde te interesa invertir
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
