import { useNavigate } from "react-router-dom";
import { academyArticles } from "@/data/academy-articles";
import { Clock, ArrowRight } from "lucide-react";

const BlogSection = () => {
  const navigate = useNavigate();
  const posts = academyArticles.slice(0, 3);

  return (
    <section className="py-16 md:py-20" id="blog">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-label">Conocimiento abierto</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
              Academia: formación para inversores
            </h2>
          </div>
          <button
            onClick={() => navigate("/academia")}
            className="hidden md:inline-flex text-sm font-semibold text-accent hover:underline items-center gap-1"
          >
            Ver toda la Academia <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <button
              key={post.slug}
              onClick={() => navigate(`/academia/${post.slug}`)}
              className="group text-left bg-card rounded-2xl overflow-hidden card-elevated"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-secondary/50" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-accent bg-secondary px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button onClick={() => navigate("/academia")} className="text-sm font-semibold text-accent hover:underline">
            Ver toda la Academia →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
