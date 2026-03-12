import { Link } from "react-router-dom";
import categoryViviendas from "@/assets/category-viviendas.jpg";
import categoryTerrenos from "@/assets/category-terrenos.jpg";
import categoryLocales from "@/assets/category-locales.jpg";
import categoryOficinas from "@/assets/category-oficinas.jpg";

const categories = [
  {
    title: "Pisos y Casas",
    description: "Accede a viviendas con descuentos reales sobre mercado. Oportunidades antes reservadas a fondos.",
    image: categoryViviendas,
    href: "/inmuebles?type=vivienda",
  },
  {
    title: "Terrenos",
    description: "Suelo residencial, rústico e industrial a precios competitivos. Invierte en el activo más estable.",
    image: categoryTerrenos,
    href: "/inmuebles?type=terreno",
  },
  {
    title: "Locales Comerciales",
    description: "Rentabilidades atractivas en retail. Diversifica tu cartera con activos comerciales accesibles.",
    image: categoryLocales,
    href: "/inmuebles?type=local",
  },
  {
    title: "Oficinas y Naves",
    description: "Activos profesionales de alta rentabilidad. Inversión institucional al alcance de todos.",
    image: categoryOficinas,
    href: "/inmuebles?type=nave",
  },
];

const CategoryCards = () => {
  return (
    <section className="py-10 md:py-14" id="particulares">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Cesiones de préstamos hipotecarios, cesiones de remate a terceros y activos ocupados</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
            Oportunidades inmobiliarias sin barreras de entrada
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.href}
              className="group relative rounded-2xl overflow-hidden aspect-[16/10] card-elevated"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 category-card-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="font-heading text-xl md:text-2xl font-bold text-primary-foreground mb-1">
                  {cat.title}
                </h3>
                <p className="text-primary-foreground/75 text-sm">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
