import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyArticles, academyCategories } from "@/data/academy-articles";
import { ArrowLeft, Clock, BookOpen, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import SEOHead, { createArticleSchema, createBreadcrumbSchema } from "@/components/SEOHead";

const AcademiaArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = academyArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Artículo no encontrado</h1>
          <p className="text-muted-foreground mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate("/academia")}>Volver a la Academia</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryColor = academyCategories.find((c) => c.id === article.category)?.color || "bg-primary/10 text-primary";

  const related = academyArticles.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 2);

  const formattedDate = new Date(article.date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
        </div>
      </div>

      {/* Article header */}
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <button
          onClick={() => navigate("/academia")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la Academia
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${categoryColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readTime}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          {article.excerpt}
        </p>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent prose-blockquote:border-accent/50 prose-blockquote:bg-secondary/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-table:text-sm">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-lg font-bold text-foreground mb-6">Artículos relacionados</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => navigate(`/academia/${r.slug}`)}
                  className="group text-left bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-accent/30 transition-all"
                >
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${categoryColor}`}>
                    {r.category}
                  </span>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors text-sm leading-snug mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.excerpt}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default AcademiaArticle;
