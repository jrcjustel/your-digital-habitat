import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyRoutes, academyArticles, academyCategories } from "@/data/academy-articles";
import { ArrowLeft, ChevronRight, ChevronDown, BookOpen, Clock, CheckCircle2, ArrowRight, GraduationCap, Layers } from "lucide-react";

import rutaOcupadosImg from "@/assets/ruta-ocupados.jpg";
import rutaCesionesImg from "@/assets/ruta-cesiones-remate.jpg";
import rutaSubastasImg from "@/assets/ruta-subastas-boe.jpg";
import rutaNplImg from "@/assets/ruta-deuda-npl.jpg";

const routeImages: Record<string, string> = {
  "ocupados": rutaOcupadosImg,
  "cesiones-remate": rutaCesionesImg,
  "subastas-boe": rutaSubastasImg,
  "deuda-npl": rutaNplImg,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" } }),
};

const AcademiaRuta = () => {
  const { rutaSlug } = useParams();
  const navigate = useNavigate();
  const ruta = academyRoutes.find((r) => r.slug === rutaSlug);
  const [openModule, setOpenModule] = useState<number>(0);

  if (!ruta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Ruta no encontrada</h1>
          <p className="text-muted-foreground mb-6">La ruta formativa que buscas no existe.</p>
          <button onClick={() => navigate("/academia")} className="bg-accent text-accent-foreground font-semibold px-6 py-2 rounded-xl text-sm">Volver a la Academia</button>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryMap: Record<string, string> = {
    "ocupados": "Ocupados",
    "cesiones-remate": "CDR",
    "subastas-boe": "Subastas",
    "deuda-npl": "NPL",
  };
  const catId = categoryMap[ruta.id] || "";
  const relatedArticles = academyArticles.filter((a) => a.category === catId).slice(0, 6);
  const categoryColor = academyCategories.find((c) => c.id === catId)?.color || "bg-primary/10 text-primary";
  const totalLessons = ruta.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-accent transition-colors">Inicio</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate("/academia")} className="hover:text-accent transition-colors">Academia</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{ruta.shortTitle}</span>
        </div>
      </div>

      {/* ── Hero with image ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={routeImages[ruta.id]} alt={ruta.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
        </div>
        <div className="relative py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.button
              onClick={() => navigate("/academia")}
              className="flex items-center gap-1.5 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors mb-8"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Academia
            </motion.button>

            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="text-4xl">{ruta.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/20 backdrop-blur-sm">
                Prioridad {ruta.priority} · {ruta.modules.length} módulos · {totalLessons} lecciones
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-5 text-primary-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {ruta.title}
            </motion.h1>

            <motion.p
              className="text-lg text-primary-foreground/60 leading-relaxed max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {ruta.intro}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Modules (accordion style) ── */}
      <section className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold tracking-widest uppercase text-accent">Plan formativo</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            {ruta.modules.length} módulos, <span className="text-accent">{totalLessons} lecciones</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Contenido práctico diseñado para aplicar directamente a tus operaciones de inversión.
          </p>
        </div>

        <div className="space-y-4">
          {ruta.modules.map((mod, idx) => {
            const isOpen = openModule === idx;
            return (
              <motion.div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 ${isOpen ? "border-accent/40 shadow-lg bg-card" : "border-border bg-card hover:border-accent/20"}`}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <button
                  onClick={() => setOpenModule(isOpen ? -1 : idx)}
                  className="w-full flex items-center gap-4 p-6 md:p-8 text-left"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg transition-colors duration-300 ${isOpen ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground leading-snug">
                      Módulo {idx + 1}: {mod.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{mod.lessons.length} lecciones</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-accent" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                        <div className="border-t border-border pt-5">
                          <ul className="space-y-3">
                            {mod.lessons.map((lesson, lIdx) => (
                              <motion.li
                                key={lIdx}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: lIdx * 0.05, duration: 0.3 }}
                              >
                                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{lesson}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Related articles ── */}
      {relatedArticles.length > 0 && (
        <section className="bg-secondary/30 border-y border-border py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Profundiza</span>
              <h2 className="text-3xl font-extrabold text-foreground mt-2">
                Artículos de <span className="text-accent">{ruta.shortTitle}</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((article, i) => (
                <motion.button
                  key={article.slug}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColor}`}>
                        {article.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-snug mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    <span className="flex items-center gap-1.5 mt-3 text-xs text-accent font-bold group-hover:gap-2.5 transition-all">
                      Leer <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 hero-section">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
            ¿Listo para tu próxima operación?
          </h2>
          <p className="text-primary-foreground/60 mb-8 leading-relaxed">
            Ikesa analiza activos, gestiona desocupaciones y te acompaña en cada paso de la inversión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(ruta.cta.href)}
              className="bg-accent text-accent-foreground font-semibold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              {ruta.cta.label}
            </button>
            <button
              onClick={() => navigate("/como-funciona")}
              className="px-8 py-3 text-sm font-semibold border border-primary-foreground/20 rounded-xl hover:bg-primary-foreground/5 transition-colors text-primary-foreground"
            >
              Cómo funciona Ikesa
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Contenido formativo. No constituye asesoramiento profesional, legal ni de inversión. Consulta siempre con especialistas antes de tomar decisiones.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default AcademiaRuta;
