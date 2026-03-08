import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyArticles, academyCategories, academyRoutes } from "@/data/academy-articles";
import { BookOpen, Clock, ArrowRight, GraduationCap, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import SEOHead, { createBreadcrumbSchema, createCourseSchema } from "@/components/SEOHead";

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

const stats = [
  { value: "4", label: "Rutas formativas" },
  { value: "40+", label: "Artículos prácticos" },
  { value: "16", label: "Módulos especializados" },
  { value: "100%", label: "Contenido gratuito" },
];

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
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Academia IKESA — Formación Gratuita en Inversión Inmobiliaria Alternativa"
        description="Aprende a invertir en inmuebles ocupados, cesiones de remate, subastas BOE y activos NPL con nuestras rutas formativas gratuitas. +40 artículos prácticos de expertos."
        canonical="/academia"
        keywords="formación inversión inmobiliaria, curso NPL gratis, aprender cesiones remate, academia subastas BOE, curso inmuebles ocupados"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Inicio", url: "/" },
            { name: "Academia", url: "/academia" },
          ]),
          ...academyRoutes.map(r => createCourseSchema({
            name: r.title,
            description: r.intro,
            url: `/academia/ruta/${r.slug}`,
            modules: r.modules.length,
          })),
        ]}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(199_82%_58%/0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_82%_58%/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase rounded-full bg-accent/20 text-accent border border-accent/20">
              <GraduationCap className="w-4 h-4" />
              Formación práctica para inversores
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              Academia <span className="text-accent">Ikesa</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 leading-relaxed max-w-2xl mx-auto mb-12">
              Domina la inversión en activos inmobiliarios distressed. Guías prácticas con datos reales, casos de estudio y herramientas para tomar mejores decisiones.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-4"
                >
                  <p className="text-2xl md:text-3xl font-extrabold text-accent">{s.value}</p>
                  <p className="text-xs text-primary-foreground/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Rutas formativas ── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-accent">Especialízate</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Elige tu ruta <span className="text-accent">formativa</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Cuatro caminos de especialización para dominar cada nicho de inversión inmobiliaria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {academyRoutes.map((ruta) => (
              <button
                key={ruta.id}
                onClick={() => navigate(`/academia/ruta/${ruta.slug}`)}
                className="group text-left rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 bg-card"
              >
                {/* Image header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={routeImages[ruta.id]}
                    alt={ruta.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{ruta.icon}</span>
                      {ruta.priority <= 2 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/30 text-accent backdrop-blur-sm">
                          ⭐ Prioridad {ruta.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-lg text-white leading-snug">
                      {ruta.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ruta.intro}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        {ruta.modules.length} módulos
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-accent" />
                        {ruta.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lecciones
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-accent group-hover:gap-2 transition-all">
                      Empezar <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured / Empieza por aquí ── */}
      {featured.length > 0 && (
        <section className="border-y border-border bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Guías destacadas</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
                Empieza por <span className="text-accent">aquí</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {featured.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug text-base">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                  <span className="flex items-center gap-1.5 text-xs text-accent font-bold group-hover:gap-2.5 transition-all">
                    Leer guía <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Articles ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Biblioteca completa</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Todos los <span className="text-accent">artículos</span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 flex-1">
            {academyCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-accent text-accent-foreground border-accent shadow-md"
                    : "border-border text-muted-foreground hover:bg-secondary hover:border-accent/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No se encontraron artículos con esos criterios.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {filtered.map((article) => (
              <button
                key={article.slug}
                onClick={() => navigate(`/academia/${article.slug}`)}
                className="group text-left bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300"
              >
                {/* Colored top bar */}
                <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <span className="flex items-center gap-1.5 mt-4 text-xs text-accent font-bold group-hover:gap-2.5 transition-all">
                    Leer artículo <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA final ── */}
      <section className="hero-section py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
            ¿Listo para tu primera operación?
          </h2>
          <p className="text-primary-foreground/60 mb-4 leading-relaxed">
            Aplica lo aprendido. Analiza activos reales en nuestro marketplace y cuenta con el asesoramiento de Ikesa en cada paso.
          </p>
          <p className="text-xs text-primary-foreground/40 mb-8">
            ⚠️ Todo el contenido de la Academia Ikesa es formativo y no constituye asesoramiento profesional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/inmuebles")} className="bg-accent text-accent-foreground font-semibold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Explorar oportunidades
            </button>
            <button onClick={() => navigate("/como-funciona")} className="px-8 py-3 text-sm font-semibold border border-primary-foreground/20 rounded-xl hover:bg-primary-foreground/5 transition-colors text-primary-foreground">
              Cómo funciona
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Academia;
