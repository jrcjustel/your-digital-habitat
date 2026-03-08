import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyArticles, academyCategories, academyRoutes } from "@/data/academy-articles";
import { BookOpen, Clock, ArrowRight, GraduationCap, Search, Play, Star, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import rutaOcupados from "@/assets/ruta-ocupados.jpg";
import rutaCesiones from "@/assets/ruta-cesiones-remate.jpg";
import rutaSubastas from "@/assets/ruta-subastas-boe.jpg";
import rutaNpl from "@/assets/ruta-deuda-npl.jpg";

const routeImages: Record<string, string> = {
  ocupados: rutaOcupados,
  "cesiones-remate": rutaCesiones,
  "subastas-boe": rutaSubastas,
  "deuda-npl": rutaNpl,
};

const Academia = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = academyArticles.filter((a) => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = academyArticles.filter((a) => a.featured);

  const categoryColor = (cat: string) =>
    academyCategories.find((c) => c.id === cat)?.color || "bg-primary/10 text-primary";

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero – Netflix style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={rutaOcupados} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-[0.2em] uppercase rounded bg-accent/20 text-accent">
              <GraduationCap className="w-3.5 h-3.5" />
              IKESA Investor Academy
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-[1.05] tracking-tight mb-5">
              Aprende a invertir
              <span className="block text-accent">como un profesional</span>
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed mb-8 max-w-lg">
              Formación práctica en activos distressed: ocupados, cesiones de remate, subastas BOE y deuda NPL. Casos reales, herramientas y acceso directo a oportunidades.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/academia/ruta/${academyRoutes[0].slug}`)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-accent text-accent-foreground rounded-lg hover:brightness-110 transition-all"
              >
                <Play className="w-4 h-4" />
                Empezar primera ruta
              </button>
              <button
                onClick={() => document.getElementById("rutas")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-primary-foreground/80 bg-primary-foreground/10 hover:bg-primary-foreground/15 rounded-lg transition-all"
              >
                Ver todas las rutas
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths – Horizontal scroll cards */}
      <section id="rutas" className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground tracking-tight">Rutas Formativas</h2>
              <p className="text-sm text-primary-foreground/40 mt-1">Elige tu especialización. Cada ruta incluye módulos progresivos.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {academyRoutes.map((ruta, i) => (
              <motion.button
                key={ruta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => navigate(`/academia/ruta/${ruta.slug}`)}
                className="group relative text-left rounded-xl overflow-hidden aspect-[4/5] border border-primary-foreground/10 hover:border-accent/30 transition-all"
              >
                <img
                  src={routeImages[ruta.id] || rutaOcupados}
                  alt={ruta.shortTitle}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{ruta.icon}</span>
                    {ruta.priority <= 2 && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/20 text-accent">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-primary-foreground text-lg leading-tight mb-1">
                    {ruta.shortTitle}
                  </h3>
                  <p className="text-xs text-primary-foreground/50 line-clamp-2 mb-3">{ruta.intro}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-foreground/40">{ruta.modules.length} módulos</span>
                    <span className="flex items-center gap-1 text-xs text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Empezar <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured – Masterclass style */}
      {featured.length > 0 && (
        <section className="bg-primary border-t border-primary-foreground/5 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-bold text-primary-foreground tracking-tight">Empieza por aquí</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((article, i) => (
                <motion.button
                  key={article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-primary-foreground/5 rounded-xl border border-primary-foreground/10 p-5 hover:border-accent/30 hover:bg-primary-foreground/8 transition-all"
                >
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3 ${categoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <h3 className="font-bold text-primary-foreground group-hover:text-accent transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-primary-foreground/50 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-accent font-semibold">
                    Leer guía <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles – dark background */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2 flex-1">
              {academyCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    activeCategory === cat.id
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-card"
              />
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No se encontraron artículos con esos criterios.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    <BookOpen className="w-8 h-8 text-muted-foreground/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${categoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug text-sm">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 border-t border-primary-foreground/5">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight mb-4">
            ¿Listo para tu primera inversión?
          </h2>
          <p className="text-primary-foreground/50 mb-8">
            Conecta lo aprendido con oportunidades reales. Nuestro marketplace te espera.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/inmuebles")} className="btn-search px-8 py-3 text-sm font-bold">
              Explorar oportunidades
            </button>
            <button onClick={() => navigate("/como-funciona")} className="px-8 py-3 text-sm font-semibold border border-primary-foreground/20 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/5 transition-colors">
              Cómo funciona
            </button>
          </div>
          <p className="text-[11px] text-primary-foreground/30 mt-6">
            ⚠️ Todo el contenido de la Academia es formativo y no constituye asesoramiento profesional.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Academia;
