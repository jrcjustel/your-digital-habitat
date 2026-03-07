import { Link } from "react-router-dom";
import categoryViviendas from "@/assets/category-viviendas.jpg";
import categoryTerrenos from "@/assets/category-terrenos.jpg";
import categoryLocales from "@/assets/category-locales.jpg";
import categoryOficinas from "@/assets/category-oficinas.jpg";

const categories = [
  {
    title: "Pisos y Casas",
    description: "El hogar que imaginas con las mejores oportunidades de inversión.",
    image: categoryViviendas,
    href: "/inmuebles?type=vivienda",
  },
  {
    title: "Terrenos",
    description: "Residenciales, rústicos e industriales. Tenemos el que se adapta a ti.",
    image: categoryTerrenos,
    href: "/inmuebles?type=terreno",
  },
  {
    title: "Locales Comerciales",
    description: "Miles de espacios en venta para convertir tus ideas en un buen negocio.",
    image: categoryLocales,
    href: "/inmuebles?type=local",
  },
  {
    title: "Oficinas y Naves",
    description: "Espacios profesionales con alta rentabilidad para tu cartera.",
    image: categoryOficinas,
    href: "/inmuebles?type=nave",
  },
];

const CategoryCards = () => {
  return (
    <section className="py-16 md:py-20" id="particulares">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Portal Particulares</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
            Encuentra el inmueble de tus sueños
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.title}
              href={cat.href}
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
