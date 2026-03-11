import { useNavigate } from "react-router-dom";
import { academyArticles } from "@/data/academy-articles";
import { Clock, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const BlogSection = () => {
  const navigate = useNavigate();
  const posts = academyArticles.slice(0, 3);

  return (
    <section className="py-16 md:py-24" id="blog">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="section-label">Formación</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mt-3 tracking-tight">
              Academia para inversores
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Guías prácticas, casos reales y análisis técnico para tomar mejores decisiones.
            </p>
          </div>
          <button
            onClick={() => navigate("/academia")}
            className="hidden md:inline-flex text-sm font-bold text-accent hover:text-accent/80 items-center gap-1.5 transition-colors group"
          >
            Ver toda la Academia <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <motion.button
              key={post.slug}
              onClick={() => navigate(`/academia/${post.slug}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-300"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-extrabold text-primary/5">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors leading-snug tracking-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-accent mt-4 group-hover:gap-2 transition-all">
                  Leer artículo <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button onClick={() => navigate("/academia")} className="text-sm font-bold text-accent">
            Ver toda la Academia →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;