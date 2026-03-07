import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Maximize, Bed, Bath, Calendar, TrendingUp, Share2, Heart, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties } from "@/data/properties";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user && id) {
      supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", id).maybeSingle().then(({ data }) => {
        setIsFavorite(!!data);
      });
    }
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", id!);
      setIsFavorite(false);
      toast.success("Eliminado de favoritos");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: id! });
      setIsFavorite(true);
      toast.success("Añadido a favoritos");
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Inmueble no encontrado</h1>
          <Link to="/inmuebles" className="text-accent hover:underline">
            ← Volver al listado
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return property.operation === "alquiler"
      ? `${price.toLocaleString("es-ES")} €/mes`
      : `${price.toLocaleString("es-ES")} €`;
  };

  const typeLabels: Record<string, string> = {
    vivienda: "Vivienda",
    local: "Local comercial",
    oficina: "Oficina",
    terreno: "Terreno",
    nave: "Nave industrial",
    edificio: "Edificio",
    "obra-parada": "Obra parada",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/inmuebles" className="hover:text-accent transition-colors">Inmuebles</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-[16/7] bg-muted">
          <img
            src={property.images[currentImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1.5 rounded-full">
              {property.operation === "venta" ? "Venta" : "Alquiler"}
            </span>
            <span className="bg-primary/90 text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full">
              {typeLabels[property.type]}
            </span>
            {property.isNew && (
              <span className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                Nuevo
              </span>
            )}
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button onClick={toggleFavorite} className="bg-card/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-card transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
            <button className="bg-card/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-card transition-colors">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & price */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {property.location}, {property.province}
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <p className="font-heading text-3xl font-extrabold text-accent">
                  {formatPrice(property.price)}
                </p>
                {property.profitability && (
                  <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-foreground">
                      {property.profitability}% rentabilidad
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-secondary rounded-xl p-4 text-center">
                <Maximize className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{property.area.toLocaleString("es-ES")} m²</p>
                <p className="text-xs text-muted-foreground">Superficie</p>
              </div>
              {property.bedrooms && (
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <Bed className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Dormitorios</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <Bath className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Baños</p>
                </div>
              )}
              {property.year && (
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <Calendar className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">{property.year}</p>
                  <p className="text-xs text-muted-foreground">Año</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground"
                  >
                    <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">Detalles</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-muted-foreground">Referencia</div>
                <div className="font-medium text-foreground">{property.reference}</div>
                <div className="text-muted-foreground">Tipo</div>
                <div className="font-medium text-foreground">{typeLabels[property.type]}</div>
                <div className="text-muted-foreground">Operación</div>
                <div className="font-medium text-foreground capitalize">{property.operation}</div>
                <div className="text-muted-foreground">Ubicación</div>
                <div className="font-medium text-foreground">{property.location}, {property.province}</div>
                {property.hasGarage && (
                  <>
                    <div className="text-muted-foreground">Garaje</div>
                    <div className="font-medium text-foreground">Sí</div>
                  </>
                )}
                {property.hasPool && (
                  <>
                    <div className="text-muted-foreground">Piscina</div>
                    <div className="font-medium text-foreground">Sí</div>
                  </>
                )}
                {property.hasTerrace && (
                  <>
                    <div className="text-muted-foreground">Terraza</div>
                    <div className="font-medium text-foreground">Sí</div>
                  </>
                )}
                {property.hasElevator && (
                  <>
                    <div className="text-muted-foreground">Ascensor</div>
                    <div className="font-medium text-foreground">Sí</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="bg-card rounded-2xl border border-border p-6 card-elevated sticky top-24">
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                ¿Te interesa este inmueble?
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Contacta con nuestro equipo para más información
              </p>

              <form className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <textarea
                  placeholder="Me interesa este inmueble y me gustaría recibir más información..."
                  rows={3}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <button
                  type="submit"
                  className="w-full btn-search rounded-xl text-sm"
                >
                  Solicitar información
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-border space-y-3">
                <a
                  href="tel:+34956000000"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  +34 956 000 000
                </a>
                <a
                  href="mailto:info@ikesa.net"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4 text-accent" />
                  info@ikesa.net
                </a>
              </div>
            </div>

            {/* Reference */}
            <div className="bg-secondary rounded-2xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Referencia del inmueble</p>
              <p className="font-heading text-lg font-bold text-foreground">{property.reference}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
