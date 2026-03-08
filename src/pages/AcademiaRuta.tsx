import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyRoutes, academyArticles, academyCategories } from "@/data/academy-articles";
import { ArrowLeft, ChevronRight, BookOpen, Clock, CheckCircle2, ArrowRight, GraduationCap } from "lucide-react";

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

const AcademiaRuta = () => {
  const { rutaSlug } = useParams();
  const navigate = useNavigate();
  const ruta = academyRoutes.find((r) => r.slug === rutaSlug);

  if (!ruta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Ruta no encontrada</h1>
          <p className="text-muted-foreground mb-6">La ruta formativa que buscas no existe.</p>
          <button onClick={() => navigate("/academia")} className="btn-search px-6 py-2 text-sm">Volver a la Academia</button>
        </div>
        <Footer />
      </div>
    );
  }

  // Map ruta id to article category
  const categoryMap: Record<string, string> = {
    "ocupados": "Ocupados",
    "cesiones-remate": "CDR",
    "subastas-boe": "Subastas",
    "deuda-npl": "NPL",
  };
  const catId = categoryMap[ruta.id] || "";
  const relatedArticles = academyArticles.filter((a) => a.category === catId).slice(0, 6);
  const categoryColor = academyCategories.find((c) => c.id === catId)?.color || "bg-primary/10 text-primary";

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
          <span className="text-foreground">{ruta.shortTitle}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        {/* Background image */}
        {routeImages[ruta.id] && (
          <div className="absolute inset-0">
            <img src={routeImages[ruta.id]} alt={ruta.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/60" />
          </div>
        )}
        <div className={`relative py-16 md:py-20 ${!routeImages[ruta.id] ? `bg-gradient-to-br ${ruta.color}` : ''}`}>
          <div className="container mx-auto px-4 max-w-4xl">
            <button
              onClick={() => navigate("/academia")}
              className={`flex items-center gap-1.5 text-sm ${routeImages[ruta.id] ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-accent'} transition-colors mb-6`}
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la Academia
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{ruta.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${routeImages[ruta.id] ? 'bg-white/20 text-white' : categoryColor}`}>
                Prioridad {ruta.priority}
              </span>
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 ${routeImages[ruta.id] ? 'text-primary-foreground' : 'text-foreground'}`}>
              {ruta.title}
            </h1>
            <p className={`text-lg leading-relaxed max-w-3xl ${routeImages[ruta.id] ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {ruta.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">Plan formativo: {ruta.modules.length} módulos</h2>
        <div className="space-y-6">
          {ruta.modules.map((mod, idx) => (
            <div key={idx} className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-4">
                    Módulo {idx + 1}: {mod.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {mod.lessons.map((lesson, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-secondary/30 border-t border-border py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Artículos de esta ruta
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-snug mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 hero-section">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para tu próxima operación?
          </h2>
          <p className="text-primary-foreground/60 mb-8">
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
