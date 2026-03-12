import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import rutaNpl from "@/assets/ruta-deuda-npl.jpg";
import rutaCdr from "@/assets/ruta-cesiones-remate.jpg";
import rutaOcupados from "@/assets/ruta-ocupados.jpg";
import rutaSubastas from "@/assets/ruta-subastas-boe.jpg";

const categories = [
  {
    title: "Subastas BOE",
    desc: "Subastas judiciales activas, analizadas y con scoring de oportunidad. Actualización diaria.",
    image: rutaSubastas,
    href: "/subastas",
    tag: "En vivo",
    metric: "Actualización diaria",
  },
  {
    title: "NPL — Compra de deuda",
    desc: "Carteras de créditos impagados. Adquiere la posición acreedora con descuentos reales sobre deuda.",
    image: rutaNpl,
    href: "/npl",
    tag: "Alta rentabilidad",
    metric: "Descuento medio 42%",
  },
  {
    title: "Cesiones de remate",
    desc: "Compra de adjudicaciones judiciales cedidas. Precio de subasta, sin subastar.",
    image: rutaCdr,
    href: "/inmuebles?saleType=cesion-remate",
    tag: "Acceso directo",
    metric: "ROI medio 28%",
  },
  {
    title: "Inmuebles ocupados",
    desc: "Máximo descuento sobre mercado. Análisis legal y de recuperación incluido en la ficha.",
    image: rutaOcupados,
    href: "/inmuebles?saleType=ocupado",
    tag: "Precio reducido",
    metric: "Hasta -55% mercado",
  },
];

const CategoryShowcase = () => {
  return (
    <section className="py-8 md:py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label"
            >
              Verticales de inversión
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mt-3 tracking-tight"
            >
              Cuatro estrategias. Un mismo rigor.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/inmuebles"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors group"
            >
              Ver todas las oportunidades
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Premium grid: 1 large + 3 stacked */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={categories[0].href}
              className="group relative block h-full rounded-2xl overflow-hidden"
              style={{ minHeight: 420 }}
            >
              <img
                src={categories[0].image}
                alt={categories[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <span className="inline-flex w-fit items-center gap-1.5 bg-accent text-accent-foreground text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                  {categories[0].tag}
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-primary-foreground mb-2 tracking-tight">
                  {categories[0].title}
                </h3>
                <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-md mb-4">
                  {categories[0].desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent">{categories[0].metric}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-foreground group-hover:text-accent transition-colors">
                    Explorar <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right column — 3 horizontal cards */}
          <div className="flex flex-col gap-5">
            {categories.slice(1).map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={cat.href}
                  className="group flex bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-300 h-full"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="relative w-36 shrink-0 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/10" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{cat.tag}</span>
                      </div>
                      <h3 className="font-heading text-base font-bold text-foreground group-hover:text-accent transition-colors tracking-tight">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] font-semibold text-accent">{cat.metric}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;