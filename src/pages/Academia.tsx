import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyArticles, academyCategories } from "@/data/academy-articles";
import { BookOpen, Clock, ArrowRight, GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(199_82%_58%/0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-accent/20 text-accent">
            <GraduationCap className="w-3.5 h-3.5" />
            Área de conocimiento
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Academia IKESA
          </h1>
          <p className="text-lg text-primary-foreground/70 leading-relaxed max-w-2xl mx-auto">
            Guías prácticas y análisis sobre inversión inmobiliaria distressed: NPL, cesiones de remate, activos sin posesión, fiscalidad y mercado.
          </p>
        </div>
      </section>

      {/* Featured guides */}
      {featured.length > 0 && (
        <section className="border-b border-border bg-secondary/30">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Empieza por aquí</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((article) => (
                <button
                  key={article.slug}
                  onClick={() => navigate(`/academia/${article.slug}`)}
                  className="group text-left bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/30 transition-all"
                >
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 ${categoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-accent font-semibold">
                    Ver guía <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      <section className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {academyCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
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
              className="pl-9 h-9 text-sm"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <button
                key={article.slug}
                onClick={() => navigate(`/academia/${article.slug}`)}
                className="group text-left bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            ¿Necesitas asesoramiento personalizado?
          </h2>
          <p className="text-muted-foreground mb-8">
            Nuestro asesor IA puede analizar activos, resolver dudas fiscales y guiarte en tu inversión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/inmuebles")} className="btn-search px-8 py-3 text-sm font-semibold">
              Explorar oportunidades
            </button>
            <button onClick={() => navigate("/como-funciona")} className="px-8 py-3 text-sm font-semibold border border-border rounded-full hover:bg-card transition-colors text-foreground">
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
