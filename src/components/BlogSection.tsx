const posts = [
  {
    category: "Inversión",
    date: "4 de marzo de 2026",
    title: "Activos inmobiliarios de alta rentabilidad: guía 2026",
    href: "#blog-1",
  },
  {
    category: "Mercado",
    date: "26 de febrero de 2026",
    title: "El mercado hipotecario español retoma el pulso",
    href: "#blog-2",
  },
  {
    category: "Legislación",
    date: "24 de febrero de 2026",
    title: "Nuevas oportunidades en cesiones de remate y NPLs",
    href: "#blog-3",
  },
];

const BlogSection = () => {
  return (
    <section className="py-16 md:py-20" id="blog">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-label">Nuestro Blog</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
              Últimas noticias del sector
            </h2>
          </div>
          <a
            href="#blog"
            className="hidden md:inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Ver Blog →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.title}
              href={post.href}
              className="group bg-card rounded-2xl overflow-hidden card-elevated"
            >
              <div className="aspect-[16/9] bg-secondary" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-primary bg-secondary px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <a href="#blog" className="text-sm font-semibold text-primary hover:underline">
            Ver Blog →
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
