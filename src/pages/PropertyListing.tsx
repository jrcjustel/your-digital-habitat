import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin, Bed, Bath, Maximize, TrendingUp, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties, propertyTypes, provinces, type PropertyType, type OperationType } from "@/data/properties";

const PropertyListing = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    operation: (searchParams.get("operation") || "") as OperationType | "",
    type: (searchParams.get("type") || "") as PropertyType | "",
    province: searchParams.get("province") || "",
    search: searchParams.get("q") || "",
    priceMin: "",
    priceMax: "",
    bedroomsMin: "",
    areaMin: "",
    profitabilityMin: "",
  });

  const [sortBy, setSortBy] = useState("recent");

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (filters.operation && p.operation !== filters.operation) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.province && p.province !== filters.province) return false;
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) && !p.location.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
      if (filters.bedroomsMin && (p.bedrooms ?? 0) < Number(filters.bedroomsMin)) return false;
      if (filters.areaMin && p.area < Number(filters.areaMin)) return false;
      if (filters.profitabilityMin && (p.profitability ?? 0) < Number(filters.profitabilityMin)) return false;
      return true;
    });

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "area") result.sort((a, b) => b.area - a.area);
    if (sortBy === "profitability") result.sort((a, b) => (b.profitability ?? 0) - (a.profitability ?? 0));

    return result;
  }, [filters, sortBy]);

  const clearFilters = () => {
    setFilters({ operation: "", type: "", province: "", search: "", priceMin: "", priceMax: "", bedroomsMin: "", areaMin: "", profitabilityMin: "" });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const formatPrice = (price: number, operation: OperationType) => {
    return operation === "alquiler"
      ? `${price.toLocaleString("es-ES")} €/mes`
      : `${price.toLocaleString("es-ES")} €`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="hero-section py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
            Buscador de inmuebles
          </h1>
          <p className="text-primary-foreground/60 text-sm">
            {filtered.length} inmuebles encontrados
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por ubicación, título..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-card border border-border rounded-xl px-5 py-3 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="recent">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="area">Mayor superficie</option>
              <option value="profitability">Mayor rentabilidad</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-foreground">Filtros avanzados</h3>
              <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                Limpiar filtros
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Operación</label>
                <select value={filters.operation} onChange={(e) => setFilters({ ...filters, operation: e.target.value as any })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Todas</option>
                  <option value="venta">Comprar</option>
                  <option value="alquiler">Alquilar</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value as any })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Todos</option>
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Provincia</label>
                <select value={filters.province} onChange={(e) => setFilters({ ...filters, province: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Todas</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Precio mínimo</label>
                <input type="number" placeholder="Min €" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Precio máximo</label>
                <input type="number" placeholder="Max €" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Dormitorios mín.</label>
                <select value={filters.bedroomsMin} onChange={(e) => setFilters({ ...filters, bedroomsMin: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Todos</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Superficie mín.</label>
                <input type="number" placeholder="m²" value={filters.areaMin} onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Rentabilidad mín.</label>
                <select value={filters.profitabilityMin} onChange={(e) => setFilters({ ...filters, profitabilityMin: e.target.value })} className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Todas</option>
                  <option value="3">3%+</option>
                  <option value="5">5%+</option>
                  <option value="8">8%+</option>
                  <option value="10">10%+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">No se encontraron inmuebles</p>
            <button onClick={clearFilters} className="text-sm text-accent hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <Link
                key={property.id}
                to={`/inmueble/${property.id}`}
                className="group bg-card rounded-2xl overflow-hidden card-elevated"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                      {property.operation === "venta" ? "Venta" : "Alquiler"}
                    </span>
                    {property.isNew && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                  {property.profitability && (
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {property.profitability}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {property.location}, {property.province}
                  </div>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors mb-3 leading-snug">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3.5 h-3.5" />
                      {property.area.toLocaleString("es-ES")} m²
                    </span>
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {property.bedrooms} hab.
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {property.bathrooms} baños
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="font-heading text-xl font-bold text-foreground">
                      {formatPrice(property.price, property.operation)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Ref: {property.reference}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PropertyListing;
