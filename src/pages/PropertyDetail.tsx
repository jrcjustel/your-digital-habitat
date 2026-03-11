import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Maximize, Bed, Bath, Calendar, TrendingUp, Share2, Heart, ChevronLeft, ChevronRight, Download, Gavel, Home, FileText, Building2, Scale, Lock, FolderOpen, BarChart3, Calculator } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import OpportunityTypeBadge, { resolveOpportunityType } from "@/components/intelligence/OpportunityTypeBadge";
import IkesaInvestScore, { calculateInvestScore } from "@/components/intelligence/IkesaInvestScore";
import RiskTrafficLight, { deriveRiskLevel } from "@/components/intelligence/RiskTrafficLight";
import AcademyContextualLink, { resolveAcademyCategory } from "@/components/intelligence/AcademyContextualLink";
import InvestmentIntelligenceCard from "@/components/intelligence/InvestmentIntelligenceCard";
import { supabase as sb } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties, saleTypes, occupancyLabels, judicialPhaseLabels } from "@/data/properties";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import OfferForm from "@/components/OfferForm";
import DocumentsPanel from "@/components/DocumentsPanel";
import { generatePropertyPdf } from "@/lib/generatePropertyPdf";
import { generateInvestmentDossier, propertyToDossier } from "@/lib/dossier";
import ShareDossierDialog from "@/components/ShareDossierDialog";
import EnrichedDossierButton from "@/components/EnrichedDossierButton";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NdaGate from "@/components/NdaGate";
import SaleTypeBanner from "@/components/SaleTypeBanner";
import ValuationPanel from "@/components/ValuationPanel";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import Disclaimer from "@/components/Disclaimer";
import ImageGallery, { type GalleryItem } from "@/components/ImageGallery";

const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = properties.find((p) => p.id === id);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [ndaLoading, setNdaLoading] = useState(true);
  const [fachadaBase64, setFachadaBase64] = useState<string | null>(null);
  const [fachadaLoading, setFachadaLoading] = useState(false);

  const isRestricted = property ? (property.saleType === "npl" || property.saleType === "cesion-remate") : false;

  // Intelligence layer
  const opportunityType = useMemo(() => property ? resolveOpportunityType({
    saleType: property.saleType,
    estadoOcupacional: property.occupancyStatus,
  }) : "reo-libre" as const, [property]);

  const riskLevel = useMemo(() => property ? deriveRiskLevel({
    ocupado: property.occupancyStatus === "ocupado-con-derecho" || property.occupancyStatus === "ocupado-sin-derecho",
    judicializado: property.judicialInfo?.judicializado || false,
    faseJudicial: property.judicialInfo?.phase,
    estadoOcupacional: property.occupancyStatus,
  }) : "bajo" as const, [property]);

  const investScoreData = useMemo(() => property ? calculateInvestScore({
    price: property.price,
    marketValue: property.marketValue || property.price,
    ocupado: property.occupancyStatus === "ocupado-con-derecho" || property.occupancyStatus === "ocupado-sin-derecho",
    judicializado: property.judicialInfo?.judicializado || false,
    faseJudicial: property.judicialInfo?.phase,
    provincia: property.province,
    estadoOcupacional: property.occupancyStatus,
  }) : { score: 0, factors: { discount: 0, legalComplexity: 0, occupancy: 0, liquidity: 0, timeline: 0 } }, [property]);

  const academyCategory = useMemo(() => property ? resolveAcademyCategory({
    saleType: property.saleType,
    estadoOcupacional: property.occupancyStatus,
  }) : "libre" as const, [property]);

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

  // Proactive AI trigger after 30 seconds on the page
  useEffect(() => {
    if (!property) return;
    const timer = setTimeout(() => {
      const assetInfo = [
        `Referencia: ${property.reference}`,
        `Tipo: ${property.type}`,
        `Ubicación: ${property.location}, ${property.municipality}, ${property.province} (${property.community})`,
        `Superficie: ${property.area} m²`,
        `Precio: ${property.price?.toLocaleString("es-ES")} €`,
        property.marketValue ? `Valor mercado: ${property.marketValue.toLocaleString("es-ES")} €` : null,
        property.marketValue && property.price ? `Descuento: ${Math.round((1 - property.price / property.marketValue) * 100)}%` : null,
        `Tipo venta: ${property.saleType}`,
        `Ocupación: ${property.occupancyStatus}`,
        property.profitability ? `Rentabilidad estimada: ${property.profitability}%` : null,
        property.year ? `Año construcción: ${property.year}` : null,
      ].filter(Boolean).join(" | ");

      const event = new CustomEvent("ikesa-proactive-chat", {
        detail: {
          message: `Analiza esta oportunidad de inversión que estoy viendo:\n${assetInfo}\n\nDame tu valoración rápida: ¿es buena oportunidad?`,
          openChat: false,
        },
      });
      window.dispatchEvent(event);
    }, 30000);
    return () => clearTimeout(timer);
  }, [property?.id]);

  // Fetch Catastro fachada
  useEffect(() => {
    if (!property?.catastralRef || property.catastralRef.length < 14) return;
    setFachadaLoading(true);
    sb.functions.invoke("catastro-lookup", {
      body: { ref_catastral: property.catastralRef },
    }).then(({ data }) => {
      if (data?.success && data.data?.fachada_base64) {
        setFachadaBase64(data.data.fachada_base64);
      }
    }).catch(() => {}).finally(() => setFachadaLoading(false));
  }, [property?.catastralRef]);

  // Build gallery items: fachada → street view → static images → satellite
  const GOOGLE_MAPS_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
  const galleryItems: GalleryItem[] = [];
  if (property) {
    const addressParts = [property.location, property.municipality, property.province].filter(Boolean);

    // 1. Fachada (first priority) or loading placeholder
    if (fachadaLoading) {
      galleryItems.push({ id: "catastro-fachada-loading", src: "", caption: "Obteniendo fachada del Catastro...", type: "loading" as any });
    } else if (fachadaBase64) {
      galleryItems.push({ id: "catastro-fachada", src: fachadaBase64, caption: "Fachada (Catastro)", type: "fachada" });
    }

    // 2. Street View (second priority)
    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(", ");
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      galleryItems.push({ id: "google-streetview", src: `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_KEY}`, linkUrl: mapsUrl, caption: "Street View (Google Maps)", type: "streetview" });
    }

    // 3. Static/uploaded images
    property.images.forEach((img, i) => {
      galleryItems.push({ id: `img-${i}`, src: img, caption: `Imagen ${i + 1}`, type: "static" });
    });

    // 4. Satellite (last)
    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(", ");
      galleryItems.push({ id: "google-satellite", src: "", embedSrc: `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(fullAddress)}&maptype=satellite&zoom=18`, caption: "Vista satélite (Google Maps)", type: "satellite" });
    }
  }

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

  const operationLabels: Record<string, string> = {
    venta: "Venta",
    alquiler: "Alquiler",
  };

  const operationColors: Record<string, string> = {
    venta: "bg-primary/20 text-primary border border-primary/30",
    alquiler: "bg-accent/20 text-accent border border-accent/30",
  };

  const saleTypeLabel = saleTypes.find((s) => s.value === property.saleType)?.label || property.saleType;
  const discount = property.marketValue ? Math.round(((property.marketValue - property.price) / property.marketValue) * 100) : 0;

  // Similar properties
  const similar = properties.filter((p) => p.id !== property.id && (p.province === property.province || p.saleType === property.saleType)).slice(0, 6);

  const currentIdx = properties.findIndex((p) => p.id === id);
  const prevProperty = currentIdx > 0 ? properties[currentIdx - 1] : null;
  const nextProperty = currentIdx < properties.length - 1 ? properties[currentIdx + 1] : null;

  // InfoRow moved outside component to avoid ref warnings

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

        {/* Header card - reference + prices */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">Referencia {property.reference}</h2>
                <OpportunityTypeBadge type={opportunityType} size="sm" showLearnMore />
                <RiskTrafficLight level={riskLevel} size="sm" />
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${operationColors[property.operation] || ""}`}>
                  {operationLabels[property.operation]}
                </span>
                <span className="bg-secondary text-xs font-medium px-2.5 py-1 rounded-full text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {typeLabels[property.type]}
                </span>
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
            <div className="bg-accent/10 border-2 border-accent rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio orientativo</p>
              <p className="text-2xl font-bold text-accent">{property.price ? `${property.price.toLocaleString("es-ES")} €${property.operation === "alquiler" ? "/mes" : ""}` : "A consultar"}</p>
            </div>
            <div className="bg-secondary rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Deuda aproximada</p>
              <p className="text-2xl font-bold text-foreground">
                {property.debtInfo?.outstandingDebt
                  ? `${property.debtInfo.outstandingDebt.toLocaleString("es-ES")} €`
                  : "A consultar"}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor de tasación a efectos de subasta</p>
              <p className="text-2xl font-bold text-foreground">
                {property.marketValue
                  ? `${property.marketValue.toLocaleString("es-ES")} €`
                  : "A consultar"}
              </p>
            </div>
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
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">{(() => {
                const loc = property.municipality || property.province || property.location;
                const tipo = property.type === "vivienda" ? "Piso" : property.type === "local" ? "Local" : property.type === "nave" ? "Nave" : property.type === "oficina" ? "Oficina" : property.type === "terreno" ? "Terreno" : property.type === "edificio" ? "Edificio" : property.type === "obra-parada" ? "Obra parada" : "Activo";
                const area = property.area ? `· ${property.area} m²` : "";
                if (property.saleType === "ocupado") return `${tipo} sin posesión en ${loc} ${area}`.trim();
                if (property.saleType === "npl") return `Crédito con colateral ${tipo.toLowerCase()} en ${loc}`.trim();
                if (property.saleType === "cesion-remate") return `${tipo} en cesión de remate en ${loc} ${area}`.trim();
                return property.title;
              })()}</h1>
              <p className="text-sm text-muted-foreground mb-1">{property.municipality}, {property.province}</p>
              {property.isNew && <span className="inline-block text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full mb-4">Nuevo</span>}
            </div>

            {/* Image gallery */}
            <ImageGallery items={galleryItems} />
            {/* Analysis section + Tabs - gated for NPL/CDR */}
            {isRestricted ? (
              <>
              <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-foreground">Análisis de la Oportunidad</h2>
                    <div className="flex gap-2">
                      <button onClick={() => generatePropertyPdf(property)} className="flex items-center gap-2 btn-search text-xs py-2 px-4">
                        <Download className="w-3.5 h-3.5" />
                        Ficha
                      </button>
                      <button onClick={() => generateInvestmentDossier(propertyToDossier(property))} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2 px-4 rounded-lg font-medium transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                        Dossier
                      </button>
                      <EnrichedDossierButton dossierData={propertyToDossier(property)} />
                      <ShareDossierDialog dossierData={propertyToDossier(property)} />
                    </div>
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
                      <TabsTrigger value="documentos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <FolderOpen className="w-4 h-4" /> Documentos
                      </TabsTrigger>
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
                      {/* CEE - Certificado Eficiencia Energética (obligatorio RD 235/2013) */}
                      <div className="mt-6 p-4 bg-secondary rounded-xl">
                        <h4 className="text-sm font-bold text-foreground mb-3">Certificado de Eficiencia Energética (CEE)</h4>
                        {property.cee ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg text-primary-foreground ${
                                property.cee.rating === "A" ? "bg-[hsl(142,71%,45%)]" :
                                property.cee.rating === "B" ? "bg-[hsl(142,50%,55%)]" :
                                property.cee.rating === "C" ? "bg-[hsl(80,60%,50%)]" :
                                property.cee.rating === "D" ? "bg-[hsl(48,90%,50%)]" :
                                property.cee.rating === "E" ? "bg-[hsl(30,90%,50%)]" :
                                property.cee.rating === "F" ? "bg-[hsl(15,80%,50%)]" :
                                property.cee.rating === "G" ? "bg-destructive" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {property.cee.rating === "exento" ? "EX" :
                                 property.cee.rating === "en_tramite" ? "⏳" :
                                 property.cee.rating === "no_disponible" ? "–" :
                                 property.cee.rating}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {property.cee.rating === "exento" ? "Exento de calificación energética" :
                                   property.cee.rating === "en_tramite" ? "Certificado en trámite" :
                                   property.cee.rating === "no_disponible" ? "Pendiente de obtención" :
                                   `Calificación energética: ${property.cee.rating}`}
                                </p>
                                {property.cee.consumption && (
                                  <p className="text-xs text-muted-foreground">Consumo: {property.cee.consumption} kWh/m²·año</p>
                                )}
                                {property.cee.emissions && (
                                  <p className="text-xs text-muted-foreground">Emisiones: {property.cee.emissions} kgCO₂/m²·año</p>
                                )}
                              </div>
                            </div>
                            {property.cee.rating === "exento" && (
                              <p className="text-[10px] text-muted-foreground">
                                Inmueble exento según RD 235/2013, art. 2.2 (edificio a demoler, reforma integral pendiente, o uso &lt;4 meses/año).
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold">–</span>
                            <p className="text-sm">Certificado en proceso de obtención. Obligatorio según RD 235/2013.</p>
                          </div>
                        )}
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
                    <TabsContent value="documentos" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-accent" /> Documentación del activo
                      </h3>
                      <DocumentsPanel propertyId={property.id} compact showFilters />
                    </TabsContent>
                  </Tabs>
                </div>
              </NdaGate>
              <SaleTypeBanner saleType={property.saleType} />
              <ValuationPanel property={property} />
              <InvestmentCalculator property={property} />
              </>
            ) : (
              <>
                {/* Non-restricted: show analysis + tabs normally */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-foreground">Análisis de la Oportunidad</h2>
                    <div className="flex gap-2">
                      <button onClick={() => generatePropertyPdf(property)} className="flex items-center gap-2 btn-search text-xs py-2 px-4">
                        <Download className="w-3.5 h-3.5" />
                        Ficha
                      </button>
                      <button onClick={() => generateInvestmentDossier(propertyToDossier(property))} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2 px-4 rounded-lg font-medium transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                        Dossier
                      </button>
                      <EnrichedDossierButton dossierData={propertyToDossier(property)} />
                      <ShareDossierDialog dossierData={propertyToDossier(property)} />
                    </div>
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
                      <TabsTrigger value="documentos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                        <FolderOpen className="w-4 h-4" /> Documentos
                      </TabsTrigger>
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
                      {/* CEE - Certificado Eficiencia Energética (obligatorio RD 235/2013) */}
                      <div className="mt-6 p-4 bg-secondary rounded-xl">
                        <h4 className="text-sm font-bold text-foreground mb-3">Certificado de Eficiencia Energética (CEE)</h4>
                        {property.cee ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg text-primary-foreground ${
                                property.cee.rating === "A" ? "bg-[hsl(142,71%,45%)]" :
                                property.cee.rating === "B" ? "bg-[hsl(142,50%,55%)]" :
                                property.cee.rating === "C" ? "bg-[hsl(80,60%,50%)]" :
                                property.cee.rating === "D" ? "bg-[hsl(48,90%,50%)]" :
                                property.cee.rating === "E" ? "bg-[hsl(30,90%,50%)]" :
                                property.cee.rating === "F" ? "bg-[hsl(15,80%,50%)]" :
                                property.cee.rating === "G" ? "bg-destructive" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {property.cee.rating === "exento" ? "EX" :
                                 property.cee.rating === "en_tramite" ? "⏳" :
                                 property.cee.rating === "no_disponible" ? "–" :
                                 property.cee.rating}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {property.cee.rating === "exento" ? "Exento de calificación energética" :
                                   property.cee.rating === "en_tramite" ? "Certificado en trámite" :
                                   property.cee.rating === "no_disponible" ? "Pendiente de obtención" :
                                   `Calificación energética: ${property.cee.rating}`}
                                </p>
                                {property.cee.consumption && (
                                  <p className="text-xs text-muted-foreground">Consumo: {property.cee.consumption} kWh/m²·año</p>
                                )}
                                {property.cee.emissions && (
                                  <p className="text-xs text-muted-foreground">Emisiones: {property.cee.emissions} kgCO₂/m²·año</p>
                                )}
                              </div>
                            </div>
                            {property.cee.rating === "exento" && (
                              <p className="text-[10px] text-muted-foreground">
                                Inmueble exento según RD 235/2013, art. 2.2 (edificio a demoler, reforma integral pendiente, o uso &lt;4 meses/año).
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold">–</span>
                            <p className="text-sm">Certificado en proceso de obtención. Obligatorio según RD 235/2013.</p>
                          </div>
                        )}
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
                    <TabsContent value="documentos" className="p-6 mt-0">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-accent" /> Documentación del activo
                      </h3>
                      <DocumentsPanel propertyId={property.id} compact showFilters />
                    </TabsContent>
                  </Tabs>
                </div>
                <SaleTypeBanner saleType={property.saleType} />
              </>
            )}

            {/* Valuation & Calculator - always visible for non-restricted */}
            {!isRestricted && (
              <>
                <ValuationPanel property={property} />
                <InvestmentCalculator property={property} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer CTA */}
            {isRestricted && (!user || !ndaSigned) ? (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                <Lock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Regístrate y firma el NDA para enviar ofertas en productos NPL/CDR.</p>
              </div>
            ) : (
              <OfferForm
                propertyId={property.id}
                propertyReference={property.reference}
                precioOrientativo={property.price}
                depositoPorcentaje={property.depositoPorcentaje}
                comisionPorcentaje={property.comisionPorcentaje}
                provincia={property.province}
                comunidadAutonoma={property.province}
              />
            )}

            {/* Reference card */}
            <div className="bg-card border border-border rounded-2xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Referencia</p>
              <p className="font-heading text-lg font-bold text-foreground">{property.reference}</p>
            </div>

            {/* IKESA Invest Score */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <IkesaInvestScore score={investScoreData.score} factors={investScoreData.factors} size="md" />
            </div>

            {/* Academy contextual link */}
            <AcademyContextualLink category={academyCategory} variant="card" />
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
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <SaleTypeBanner saleType={p.saleType} compact />
                        <span className="bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{typeLabels[p.type]}</span>
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
