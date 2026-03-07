import { Search, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSearch = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-section opacity-90" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
        <p className="text-primary-foreground/70 text-sm font-medium mb-3 animate-fade-in tracking-wider uppercase">
          Aquí, tienes un inmueble para ti.
        </p>
        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 animate-slide-up">
          Inversiones inteligentes para
          <br />
          inversores exigentes
        </h1>
        <p className="text-primary-foreground/60 text-lg mb-10 max-w-2xl mx-auto animate-slide-up">
          Encuentra tu inmueble ideal entre miles de activos disponibles
        </p>

        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl p-2 animate-slide-up">
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            <div className="relative flex-shrink-0">
              <select className="appearance-none w-full md:w-40 bg-secondary text-foreground rounded-xl px-4 py-3.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Comprar</option>
                <option>Alquilar</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative flex-shrink-0">
              <select className="appearance-none w-full md:w-44 bg-secondary text-foreground rounded-xl px-4 py-3.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Vivienda</option>
                <option>Local</option>
                <option>Oficina</option>
                <option>Garaje</option>
                <option>Terreno</option>
                <option>Nave</option>
                <option>Edificio</option>
                <option>Obra parada</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Población, zona, provincia..."
                className="w-full bg-transparent text-foreground rounded-xl px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <button className="btn-search flex items-center justify-center gap-2 rounded-xl">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
