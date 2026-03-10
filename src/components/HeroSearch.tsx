import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, TrendingUp, Shield, Zap, Search, MapPin, Building2, Euro, X } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const PROVINCIAS_POR_CCAA: Record<string, string[]> = {
  "Andalucía": ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
  "Aragón": ["Huesca", "Teruel", "Zaragoza"],
  "Asturias": ["Asturias"],
  "Illes Balears": ["Illes Balears"],
  "Canarias": ["Las Palmas", "Santa Cruz de Tenerife"],
  "Cantabria": ["Cantabria"],
  "Castilla-La Mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
  "Castilla y León": ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
  "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
  "Extremadura": ["Badajoz", "Cáceres"],
  "Galicia": ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
  "Madrid": ["Madrid"],
  "Murcia": ["Murcia"],
  "Navarra": ["Navarra"],
  "País Vasco": ["Araba/Álava", "Bizkaia", "Gipuzkoa"],
  "La Rioja": ["La Rioja"],
  "C. Valenciana": ["Alicante", "Castellón", "Valencia"],
};

const HeroSearch = () => {
  const navigate = useNavigate();
  const [selectedCCAA, setSelectedCCAA] = useState<string>("");
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [tipoActivo, setTipoActivo] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [mapHover, setMapHover] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedProvincia) params.set("provincia", selectedProvincia);
    else if (selectedCCAA) params.set("ccaa", selectedCCAA);
    if (tipoActivo) params.set("tipo", tipoActivo);
    if (precioMax) params.set("precio_max", precioMax);
    navigate(`/npl?${params.toString()}`);
  };

  const handleCCAAClick = (ccaa: string) => {
    if (selectedCCAA === ccaa) {
      setSelectedCCAA("");
      setSelectedProvincia("");
    } else {
      setSelectedCCAA(ccaa);
      setSelectedProvincia("");
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/92" />
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left – Copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-accent/15 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" /> Plataforma nº1 en España
            </span>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.1] mb-5">
              Inversión inmobiliaria
              <br />
              <span className="text-accent">con inteligencia.</span>
            </h1>

            <p className="text-primary-foreground/65 text-lg leading-relaxed mb-8 max-w-lg">
              Accede a subastas BOE, NPLs, cesiones de remate y oportunidades exclusivas con descuentos de hasta el 60%.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                to="/analisis-inversion"
                className="group inline-flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-bold px-7 py-3.5 rounded-xl text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/25"
              >
                <BarChart3 className="w-4 h-4" />
                Analizar inversión
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="group inline-flex items-center justify-center gap-2.5 border border-primary-foreground/20 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl text-sm hover:border-accent/50 hover:text-accent transition-all"
              >
                <Phone className="w-4 h-4" />
                Hablar con asesor
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 text-primary-foreground/50 text-xs">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> NDA digital</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> ROI medio 28%</span>
              <span>Sin coste de alta</span>
            </div>
          </motion.div>

          {/* Right – Search panel with map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <form
              onSubmit={handleSearch}
              className="bg-primary-foreground/8 backdrop-blur-lg border border-primary-foreground/12 rounded-2xl p-5 shadow-2xl"
            >
              <h2 className="text-primary-foreground font-bold text-lg mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-accent" />
                Buscar oportunidades
              </h2>

              {/* Interactive Spain Map — CCAA grid */}
              <div className="mb-4">
                <label className="text-primary-foreground/50 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Selecciona una comunidad autónoma
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.keys(PROVINCIAS_POR_CCAA).map((ccaa) => (
                    <button
                      key={ccaa}
                      type="button"
                      onClick={() => handleCCAAClick(ccaa)}
                      onMouseEnter={() => setMapHover(ccaa)}
                      onMouseLeave={() => setMapHover("")}
                      className={`text-[11px] font-medium px-2 py-2 rounded-lg border transition-all text-center leading-tight ${
                        selectedCCAA === ccaa
                          ? "bg-accent/20 border-accent/50 text-accent"
                          : mapHover === ccaa
                          ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                          : "bg-primary-foreground/5 border-primary-foreground/8 text-primary-foreground/60 hover:bg-primary-foreground/10"
                      }`}
                    >
                      {ccaa}
                    </button>
                  ))}
                </div>

                {/* Provincia selector when CCAA is selected */}
                {selectedCCAA && PROVINCIAS_POR_CCAA[selectedCCAA].length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-primary-foreground/50 text-xs font-semibold">
                        Provincia en {selectedCCAA}:
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectedCCAA(""); setSelectedProvincia(""); }}
                        className="text-primary-foreground/40 hover:text-accent transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PROVINCIAS_POR_CCAA[selectedCCAA].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setSelectedProvincia(selectedProvincia === prov ? "" : prov)}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            selectedProvincia === prov
                              ? "bg-accent/20 border-accent/50 text-accent"
                              : "bg-primary-foreground/5 border-primary-foreground/8 text-primary-foreground/60 hover:bg-primary-foreground/10"
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                  <select
                    value={tipoActivo}
                    onChange={(e) => setTipoActivo(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                  >
                    <option value="" className="text-foreground">Tipología</option>
                    <option value="vivienda" className="text-foreground">Vivienda</option>
                    <option value="local" className="text-foreground">Local comercial</option>
                    <option value="oficina" className="text-foreground">Oficina</option>
                    <option value="terreno" className="text-foreground">Terreno</option>
                    <option value="garaje" className="text-foreground">Garaje</option>
                    <option value="nave" className="text-foreground">Nave industrial</option>
                    <option value="trastero" className="text-foreground">Trastero</option>
                  </select>
                </div>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                  <select
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                  >
                    <option value="" className="text-foreground">Precio máximo</option>
                    <option value="50000" className="text-foreground">Hasta 50.000 €</option>
                    <option value="100000" className="text-foreground">Hasta 100.000 €</option>
                    <option value="200000" className="text-foreground">Hasta 200.000 €</option>
                    <option value="500000" className="text-foreground">Hasta 500.000 €</option>
                    <option value="1000000" className="text-foreground">Hasta 1M €</option>
                  </select>
                </div>
              </div>

              {/* Active filters summary */}
              {(selectedCCAA || tipoActivo || precioMax) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedCCAA && (
                    <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {selectedProvincia || selectedCCAA}
                      <button type="button" onClick={() => { setSelectedCCAA(""); setSelectedProvincia(""); }}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {tipoActivo && (
                    <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <Building2 className="w-3 h-3" />
                      {tipoActivo}
                      <button type="button" onClick={() => setTipoActivo("")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {precioMax && (
                    <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <Euro className="w-3 h-3" />
                      ≤ {Number(precioMax).toLocaleString("es-ES")} €
                      <button type="button" onClick={() => setPrecioMax("")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Search button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/25 text-sm"
              >
                <Search className="w-4 h-4" />
                Buscar oportunidades
              </button>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-primary-foreground/8">
                <div className="text-center">
                  <p className="text-accent font-extrabold text-lg">+27K</p>
                  <p className="text-primary-foreground/40 text-[10px] font-medium">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-primary-foreground font-extrabold text-lg">42%</p>
                  <p className="text-primary-foreground/40 text-[10px] font-medium">Dto. medio</p>
                </div>
                <div className="text-center">
                  <p className="text-accent font-extrabold text-lg">52</p>
                  <p className="text-primary-foreground/40 text-[10px] font-medium">Provincias</p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
