import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Maximize, Bed, Bath, Calendar, TrendingUp, Share2, Heart, ChevronLeft, ChevronRight, Download, Gavel, Home, FileText, Building2, Scale } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties, saleTypes, occupancyLabels, judicialPhaseLabels } from "@/data/properties";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import OfferForm from "@/components/OfferForm";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NdaGate from "@/components/NdaGate";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = properties.find((p) => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [ndaLoading, setNdaLoading] = useState(true);

  const isRestricted = property ? (property.saleType === "npl" || property.saleType === "cesion-remate") : false;

  useEffect(() => {
    if (user && id) {
      supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", id).maybeSingle().then(({ data }) => {
        setIsFavorite(!!data);
      });
    }
  }, [user, id]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("nda_signed").eq("user_id", user.id).single().then(({ data }) => {
        setNdaSigned(!!(data as any)?.nda_signed);
        setNdaLoading(false);
      });
    } else {
      setNdaSigned(false);
      setNdaLoading(false);
    }
  }, [user]);

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
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Oportunidad no encontrada</h1>
          <Link to="/inmuebles" className="text-accent hover:underline">← Volver al listado</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    vivienda: "Vivienda", local: "Local comercial", oficina: "Oficina", terreno: "Terreno",
    nave: "Nave industrial", edificio: "Edificio", "obra-parada": "Obra parada",
  };

  const saleTypeLabel = saleTypes.find((s) => s.value === property.saleType)?.label || property.saleType;
  const discount = property.marketValue ? Math.round(((property.marketValue - property.price) / property.marketValue) * 100) : 0;

  // Similar properties
  const similar = properties.filter((p) => p.id !== property.id && (p.province === property.province || p.saleType === property.saleType)).slice(0, 6);

  const currentIdx = properties.findIndex((p) => p.id === id);
  const prevProperty = currentIdx > 0 ? properties[currentIdx - 1] : null;
  const nextProperty = currentIdx < properties.length - 1 ? properties[currentIdx + 1] : null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="flex justify-between py-2.5 border-b border-border last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb + navigation */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/inmuebles" className="hover:text-accent transition-colors">Oportunidades</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{property.reference}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {prevProperty && (
              <Link to={`/inmueble/${prevProperty.id}`} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Link>
            )}
            {nextProperty && (
              <Link to={`/inmueble/${nextProperty.id}`} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                Siguiente <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header card - sale type + reference + prices */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-sm font-semibold text-accent">{saleTypeLabel}</span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="font-heading text-xl font-bold text-foreground">Referencia {property.reference}</h2>
                <span className="bg-secondary text-xs font-medium px-2.5 py-1 rounded-full text-muted-foreground">{typeLabels[property.type]}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleFavorite} className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
              <button className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.marketValue && (
              <div className="bg-secondary rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-foreground">{property.marketValue.toLocaleString("es-ES")} €</p>
                <p className="text-sm text-muted-foreground mt-1">Valor de mercado</p>
              </div>
            )}
            <div className="bg-accent/10 border-2 border-accent rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-accent">{property.price.toLocaleString("es-ES")} €{property.operation === "alquiler" ? "/mes" : ""}</p>
              <p className="text-sm text-muted-foreground mt-1">Precio orientativo</p>
            </div>
            {discount > 0 && (
              <div className="bg-secondary rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-foreground">-{discount}%</p>
                <p className="text-sm text-muted-foreground mt-1">Descuento</p>
                {property.profitability && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-accent">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">{property.profitability}% rentabilidad est.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property card with location */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-foreground">Inmueble</h3>
                <div className="flex items-center gap-2">
                  <button onClick={toggleFavorite}>
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
              </div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">{property.title}</h1>
              <p className="text-sm text-muted-foreground mb-1">{property.municipality}, {property.province}</p>
              {property.isNew && <span className="inline-block text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full mb-4">Nuevo</span>}
            </div>

            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-muted">
              <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button onClick={() => setCurrentImage((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors">
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Analysis section + Tabs - gated for NPL/CDR */}
            {isRestricted ? (
              <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-foreground">Análisis de la Oportunidad</h2>
                    <button className="flex items-center gap-2 btn-search text-xs py-2 px-4">
                      <Download className="w-3.5 h-3.5" />
                      Descargar ficha
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">La operación detallada para entender su potencialidad.</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{property.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Maximize className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{property.area.toLocaleString("es-ES")} m²</p>
                      <p className="text-[10px] text-muted-foreground">Construidos</p>
                    </div>
                    {property.landArea && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Maximize className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.landArea.toLocaleString("es-ES")} m²</p>
                        <p className="text-[10px] text-muted-foreground">Suelo</p>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Bed className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.bedrooms}</p>
                        <p className="text-[10px] text-muted-foreground">Dormitorios</p>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Bath className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.bathrooms}</p>
                        <p className="text-[10px] text-muted-foreground">Baños</p>
                      </div>
                    )}
                    {property.year && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.year}</p>
                        <p className="text-[10px] text-muted-foreground">Año const.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {property.features.map((f) => (
                      <span key={f} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>

                {/* Tabs: Inmueble / Judicial / Deuda */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden mt-6">
                  <Tabs defaultValue="inmueble">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-secondary/50 p-0 h-auto">
                      <TabsTrigger value="inmueble" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <Home className="w-4 h-4" /> Información del inmueble
                      </TabsTrigger>
                      <TabsTrigger value="judicial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <Scale className="w-4 h-4" /> Información judicial
                      </TabsTrigger>
                      {property.debtInfo && (
                        <TabsTrigger value="deuda" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                          <FileText className="w-4 h-4" /> Información deuda
                        </TabsTrigger>
                      )}
                    </TabsList>
                    <TabsContent value="inmueble" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent" /> Colateral / Inmueble Principal
                      </h3>
                      <div className="divide-y divide-border">
                        <InfoRow label="Comunidad autónoma" value={property.community} />
                        <InfoRow label="Provincia" value={property.province} />
                        <InfoRow label="Municipio" value={property.municipality} />
                        <InfoRow label="Código postal" value={property.postalCode} />
                        <InfoRow label="Metros construidos" value={`${property.area} m²`} />
                        {property.landArea && <InfoRow label="Metros suelo" value={`${property.landArea} m²`} />}
                        <InfoRow label="VPO" value={property.isVPO ? "SÍ" : "NO"} />
                        <InfoRow label="Año construcción" value={property.year} />
                        {property.catastralRef && <InfoRow label="Referencia catastral" value={property.catastralRef} />}
                        <InfoRow label="Estado ocupacional" value={occupancyLabels[property.occupancyStatus]} />
                        <InfoRow label="Vivienda habitual" value={property.isHabitualResidence ? "SÍ" : "NO"} />
                        <InfoRow label="Titularidad sobre inmueble" value={property.ownershipPercent ? `${property.ownershipPercent}%` : undefined} />
                      </div>
                    </TabsContent>
                    <TabsContent value="judicial" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-accent" /> Información judicial
                      </h3>
                      {property.judicialInfo ? (
                        <div className="divide-y divide-border">
                          <InfoRow label="Judicializado" value={property.judicialInfo.judicializado ? "SÍ" : "NO"} />
                          {property.judicialInfo.phase && <InfoRow label="Fase judicial actual" value={judicialPhaseLabels[property.judicialInfo.phase]} />}
                          {property.judicialInfo.court && <InfoRow label="Juzgado" value={property.judicialInfo.court} />}
                          {property.judicialInfo.proceedingNumber && <InfoRow label="Nº procedimiento" value={property.judicialInfo.proceedingNumber} />}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay información judicial disponible para este activo.</p>
                      )}
                    </TabsContent>
                    {property.debtInfo && (
                      <TabsContent value="deuda" className="p-6 mt-0">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" /> Información de la deuda
                        </h3>
                        <div className="divide-y divide-border">
                          {property.debtInfo.debtType && <InfoRow label="Tipo de deuda" value={property.debtInfo.debtType} />}
                          {property.debtInfo.guaranteeType && <InfoRow label="Tipo de garantía" value={property.debtInfo.guaranteeType} />}
                          {property.debtInfo.outstandingDebt && <InfoRow label="Deuda pendiente" value={`${property.debtInfo.outstandingDebt.toLocaleString("es-ES")} €`} />}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </NdaGate>
            ) : (
              <>
                {/* Non-restricted: show analysis + tabs normally */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-foreground">Análisis de la Oportunidad</h2>
                    <button className="flex items-center gap-2 btn-search text-xs py-2 px-4">
                      <Download className="w-3.5 h-3.5" />
                      Descargar ficha
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">La operación detallada para entender su potencialidad.</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{property.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Maximize className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{property.area.toLocaleString("es-ES")} m²</p>
                      <p className="text-[10px] text-muted-foreground">Construidos</p>
                    </div>
                    {property.landArea && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Maximize className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.landArea.toLocaleString("es-ES")} m²</p>
                        <p className="text-[10px] text-muted-foreground">Suelo</p>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Bed className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.bedrooms}</p>
                        <p className="text-[10px] text-muted-foreground">Dormitorios</p>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Bath className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.bathrooms}</p>
                        <p className="text-[10px] text-muted-foreground">Baños</p>
                      </div>
                    )}
                    {property.year && (
                      <div className="bg-secondary rounded-xl p-3 text-center">
                        <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
                        <p className="text-sm font-bold text-foreground">{property.year}</p>
                        <p className="text-[10px] text-muted-foreground">Año const.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {property.features.map((f) => (
                      <span key={f} className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <Tabs defaultValue="inmueble">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-secondary/50 p-0 h-auto">
                      <TabsTrigger value="inmueble" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <Home className="w-4 h-4" /> Información del inmueble
                      </TabsTrigger>
                      <TabsTrigger value="judicial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <Scale className="w-4 h-4" /> Información judicial
                      </TabsTrigger>
                      {property.debtInfo && (
                        <TabsTrigger value="deuda" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                          <FileText className="w-4 h-4" /> Información deuda
                        </TabsTrigger>
                      )}
                    </TabsList>
                    <TabsContent value="inmueble" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent" /> Colateral / Inmueble Principal
                      </h3>
                      <div className="divide-y divide-border">
                        <InfoRow label="Comunidad autónoma" value={property.community} />
                        <InfoRow label="Provincia" value={property.province} />
                        <InfoRow label="Municipio" value={property.municipality} />
                        <InfoRow label="Código postal" value={property.postalCode} />
                        <InfoRow label="Metros construidos" value={`${property.area} m²`} />
                        {property.landArea && <InfoRow label="Metros suelo" value={`${property.landArea} m²`} />}
                        <InfoRow label="VPO" value={property.isVPO ? "SÍ" : "NO"} />
                        <InfoRow label="Año construcción" value={property.year} />
                        {property.catastralRef && <InfoRow label="Referencia catastral" value={property.catastralRef} />}
                        <InfoRow label="Estado ocupacional" value={occupancyLabels[property.occupancyStatus]} />
                        <InfoRow label="Vivienda habitual" value={property.isHabitualResidence ? "SÍ" : "NO"} />
                        <InfoRow label="Titularidad sobre inmueble" value={property.ownershipPercent ? `${property.ownershipPercent}%` : undefined} />
                      </div>
                    </TabsContent>
                    <TabsContent value="judicial" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-accent" /> Información judicial
                      </h3>
                      {property.judicialInfo ? (
                        <div className="divide-y divide-border">
                          <InfoRow label="Judicializado" value={property.judicialInfo.judicializado ? "SÍ" : "NO"} />
                          {property.judicialInfo.phase && <InfoRow label="Fase judicial actual" value={judicialPhaseLabels[property.judicialInfo.phase]} />}
                          {property.judicialInfo.court && <InfoRow label="Juzgado" value={property.judicialInfo.court} />}
                          {property.judicialInfo.proceedingNumber && <InfoRow label="Nº procedimiento" value={property.judicialInfo.proceedingNumber} />}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay información judicial disponible para este activo.</p>
                      )}
                    </TabsContent>
                    {property.debtInfo && (
                      <TabsContent value="deuda" className="p-6 mt-0">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" /> Información de la deuda
                        </h3>
                        <div className="divide-y divide-border">
                          {property.debtInfo.debtType && <InfoRow label="Tipo de deuda" value={property.debtInfo.debtType} />}
                          {property.debtInfo.guaranteeType && <InfoRow label="Tipo de garantía" value={property.debtInfo.guaranteeType} />}
                          {property.debtInfo.outstandingDebt && <InfoRow label="Deuda pendiente" value={`${property.debtInfo.outstandingDebt.toLocaleString("es-ES")} €`} />}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer CTA */}
            <OfferForm propertyId={property.id} propertyReference={property.reference} />

            {/* Reference card */}
            <div className="bg-card border border-border rounded-2xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Referencia</p>
              <p className="font-heading text-lg font-bold text-foreground">{property.reference}</p>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Otros productos similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((p) => {
                const d = p.marketValue ? Math.round(((p.marketValue - p.price) / p.marketValue) * 100) : 0;
                const stLabel = saleTypes.find((s) => s.value === p.saleType)?.label || p.saleType;
                return (
                  <Link key={p.id} to={`/inmueble/${p.id}`} className="group bg-card rounded-2xl overflow-hidden card-elevated">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{p.reference}</span>
                        <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{typeLabels[p.type]}</span>
                      </div>
                      {d > 0 && <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">-{d}%</span>}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.municipality}</p>
                      <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-1">{p.title}</h3>
                      <div className="flex items-end justify-between">
                        <div>
                          {p.marketValue && <p className="text-xs text-muted-foreground line-through">{p.marketValue.toLocaleString("es-ES")} €</p>}
                          <p className="font-heading font-bold text-foreground">{p.price.toLocaleString("es-ES")} €</p>
                        </div>
                        {p.profitability && (
                          <span className="text-xs font-bold text-accent flex items-center gap-1"><TrendingUp className="w-3 h-3" />{p.profitability}%</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
