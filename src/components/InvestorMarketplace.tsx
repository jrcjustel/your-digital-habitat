import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import rutaNpl from "@/assets/ruta-deuda-npl.jpg";
import rutaCdr from "@/assets/ruta-cesiones-remate.jpg";
import rutaOcupados from "@/assets/ruta-ocupados.jpg";
import categoryViviendas from "@/assets/category-viviendas.jpg";
import categoryTerrenos from "@/assets/category-terrenos.jpg";
import categoryLocales from "@/assets/category-locales.jpg";

const featured = [
  {
    title: "Cesiones de préstamos (NPL)",
    desc: "Carteras de deuda hipotecaria con descuentos de hasta el 60% sobre el valor de mercado.",
    image: rutaNpl,
    href: "/inmuebles?saleType=npl",
    tag: "Alta rentabilidad",
  },
  {
    title: "Cesiones de remate",
    desc: "Adjudicaciones judiciales cedidas a precio reducido. Márgenes atractivos con seguridad jurídica.",
    image: rutaCdr,
    href: "/inmuebles?saleType=cesion-remate",
    tag: "Oportunidad",
  },
  {
    title: "Activos ocupados",
    desc: "Inmuebles con ocupantes a precios muy competitivos. Acompañamiento en todo el proceso de recuperación.",
    image: rutaOcupados,
    href: "/inmuebles?saleType=ocupado",
    tag: "Precio reducido",
  },
];

const more = [
  { title: "Edificios completos", image: categoryViviendas, href: "/inmuebles?type=edificio" },
  { title: "Suelo y terrenos", image: categoryTerrenos, href: "/inmuebles?type=terreno" },
  { title: "Locales y naves", image: categoryLocales, href: "/inmuebles?type=local" },
];

const InvestorMarketplace = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary" id="marketplace">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
          <div>
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
              Marketplace de inversión
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Encuentra tu próxima oportunidad
            </h2>
          </div>
          <Link
            to="/inmuebles"
            className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1 shrink-0"
          >
            Ver todo el catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {featured.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent mt-3 group-hover:gap-2 transition-all">
                  Explorar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {more.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group flex items-center gap-4 bg-card rounded-xl p-3 border border-border hover:border-accent/30 transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                  {item.title}
                </h4>
                <span className="text-xs text-muted-foreground">Ver activos →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestorMarketplace;
