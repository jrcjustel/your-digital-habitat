import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSearch = () => {
  const navigate = useNavigate();
  const [operation, setOperation] = useState("comprar");
  const [saleType, setSaleType] = useState("");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // If sale type is an investor product, redirect to the investor marketplace
    if (saleType === "npl") {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      navigate(`/inversores/npl${params.toString() ? `?${params}` : ""}`);
      return;
    }
    if (saleType === "cesion-remate") {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      navigate(`/inversores/cesiones-remate${params.toString() ? `?${params}` : ""}`);
      return;
    }
    if (saleType === "ocupados") {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      navigate(`/inversores/ocupados${params.toString() ? `?${params}` : ""}`);
      return;
    }

    const params = new URLSearchParams();
    if (operation === "alquilar") params.set("operation", "alquiler");
    if (saleType) params.set("saleType", saleType);
    if (type) params.set("type", type);
    if (query.trim()) params.set("q", query.trim());
    navigate(`/inmuebles${params.toString() ? `?${params}` : ""}`);
  };

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

        <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-xl p-2 animate-slide-up">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col md:flex-row items-stretch gap-2"
          >
            {/* Operación */}
            <div className="relative flex-shrink-0">
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="appearance-none w-full md:w-36 bg-secondary text-foreground rounded-xl px-4 py-3.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="comprar">Comprar</option>
                <option value="alquilar">Alquilar</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Tipo de venta / producto */}
            <div className="relative flex-shrink-0">
              <select
                value={saleType}
                onChange={(e) => setSaleType(e.target.value)}
                className="appearance-none w-full md:w-48 bg-secondary text-foreground rounded-xl px-4 py-3.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Tipo de venta</option>
                <option value="compraventa">Compraventa directa</option>
                <option value="obra-nueva">Obra nueva</option>
                <option value="npl">NPL (Compra de crédito)</option>
                <option value="cesion-remate">Cesión de remate</option>
                <option value="ocupados">Inmueble ocupado</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Tipo inmueble */}
            <div className="relative flex-shrink-0">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="appearance-none w-full md:w-40 bg-secondary text-foreground rounded-xl px-4 py-3.5 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Todos los tipos</option>
                <option value="vivienda">Vivienda</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="terreno">Terreno</option>
                <option value="nave">Nave</option>
                <option value="edificio">Edificio</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Búsqueda libre */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Población, zona, provincia..."
                className="w-full bg-transparent text-foreground rounded-xl px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-search flex items-center justify-center gap-2 rounded-xl">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
