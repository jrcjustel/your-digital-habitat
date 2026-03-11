import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, MapPin, Building2, Scale, FileText, Maximize, FolderOpen,
  CreditCard, Gavel, Home, Users, TrendingDown, Euro, Calendar, Hash, Download, Mail, Heart,
  ShieldAlert, Key, AlertTriangle, ExternalLink, Info, ChevronDown, ChevronUp, Phone, Map
} from "lucide-react";
import OpportunityTypeBadge, { resolveOpportunityType } from "@/components/intelligence/OpportunityTypeBadge";
import IkesaInvestScore, { calculateInvestScore } from "@/components/intelligence/IkesaInvestScore";
import RiskTrafficLight, { deriveRiskLevel } from "@/components/intelligence/RiskTrafficLight";
import AcademyContextualLink, { resolveAcademyCategory } from "@/components/intelligence/AcademyContextualLink";
import InvestmentIntelligenceCard from "@/components/intelligence/InvestmentIntelligenceCard";
import { generateInvestmentDossier, nplAssetToDossier } from "@/lib/dossier";
import ShareDossierDialog from "@/components/ShareDossierDialog";
import EnrichedDossierButton from "@/components/EnrichedDossierButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NdaGate from "@/components/NdaGate";
import DocumentsPanel from "@/components/DocumentsPanel";
import BiddingPanel from "@/components/BiddingPanel";
import RelatedAssets from "@/components/RelatedAssets";
import Disclaimer from "@/components/Disclaimer";
import WaitlistButton from "@/components/WaitlistButton";
import CatastroPanel from "@/components/CatastroPanel";
import AssetImageGallery from "@/components/AssetImageGallery";
import CdrAnalysisPanel from "@/components/CdrAnalysisPanel";
import OcupadoAnalysisPanel from "@/components/OcupadoAnalysisPanel";
import NplAnalysisPanel from "@/components/NplAnalysisPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NplAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  ref_catastral: string | null;
  finca_registral: string | null;
  registro_propiedad: string | null;
  valor_activo: number;
  deuda_ob: number;
  servicer: string | null;
  cartera: string | null;
  ndg: string | null;
  asset_id: string | null;
  name_debtor: string | null;
  persona_tipo: string | null;
  rango_deuda: string | null;
  sqm: number;
  estado_ocupacional: string | null;
  tipo_procedimiento: string | null;
  estado_judicial: string | null;
  cesion_remate: boolean;
  cesion_credito: boolean;
  postura_subasta: boolean;
  propiedad_sin_posesion: boolean;
  importe_preaprobado: number;
  oferta_aprobada: boolean;
  codigo_postal: string | null;
  anio_construccion: number | null;
  vpo: boolean;
  judicializado: boolean;
  fase_judicial: string | null;
  referencia_fencia: string | null;
  valor_mercado: number;
  precio_orientativo: number;
  num_titulares: number;
  descripcion: string | null;
  deposito_porcentaje: number;
  comision_porcentaje: number;
  estado: string | null;
  publicado: boolean | null;
}

const InfoRow = ({ label, value, highlight }: { label: string; value: string | number | null | undefined; highlight?: boolean }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-accent font-bold" : "text-foreground"}`}>{value}</span>
    </div>
  );
};

/** Determine the "type" of operation for differentiated layout */
const getOperationType = (asset: NplAsset): "npl" | "cesion_remate" | "ocupado" | "subasta" => {
  if (asset.cesion_remate) return "cesion_remate";
  if (asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado") return "ocupado";
  if (asset.postura_subasta) return "subasta";
  return "npl";
};

const operationLabels: Record<string, string> = {
  npl: "Compraventa de crédito",
  cesion_remate: "Cesión de remate",
  ocupado: "Compraventa de inmuebles",
  subasta: "Postura en subasta",
};

const PriceTooltip = ({ label, value, tooltip }: { label: string; value: string; tooltip: string }) => (
  <div className="text-center flex-1">
    <div className="flex items-center justify-center gap-1 mb-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

/** Collapsible section for Análisis de la Oportunidad */
const AnalysisSection = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-1 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const NplDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<NplAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAsset = async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { data } = await supabase.from("npl_assets").select("*").eq("id", id).single();
        setAsset(data as unknown as NplAsset);
      } else {
        const { data } = await supabase.from("npl_assets").select("*").eq("asset_id", id).maybeSingle();
        if (data) {
          setAsset(data as unknown as NplAsset);
        } else {
          const { data: fuzzy } = await supabase.from("npl_assets").select("*").ilike("asset_id", `%${id}%`).limit(1).maybeSingle();
          setAsset(fuzzy as unknown as NplAsset);
        }
      }
      setLoading(false);
    };
    fetchAsset();
  }, [id]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("nda_signed, display_name").eq("user_id", user.id).single().then(({ data }) => {
        setNdaSigned(!!(data as any)?.nda_signed);
        setUserName((data as any)?.display_name || "");
      });
      setUserEmail(user.email || "");
      if (asset) {
        supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", asset.id).maybeSingle().then(({ data }) => {
          setIsFav(!!data);
        });
      }
    }
  }, [user, asset?.id]);

  const toggleFavorite = async () => {
    if (!user || !asset) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", asset.id);
      setIsFav(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: asset.id });
      setIsFav(true);
      await supabase.from("activity_log").insert({ user_id: user.id, action: "favorite_added", entity_type: "npl_asset", entity_id: asset.id });
    }
  };

  // Intelligence layer (calculated dynamically, no DB changes) — must be before early returns
  const opportunityType = useMemo(() => asset ? resolveOpportunityType({
    cesionRemate: asset.cesion_remate,
    propiedadSinPosesion: asset.propiedad_sin_posesion,
    estadoOcupacional: asset.estado_ocupacional || undefined,
    posturaSubasta: asset.postura_subasta,
  }) : "npl" as const, [asset]);

  const riskLevel = useMemo(() => asset ? deriveRiskLevel({
    ocupado: asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado",
    judicializado: asset.judicializado,
    faseJudicial: asset.fase_judicial,
    estadoOcupacional: asset.estado_ocupacional,
  }) : "medio" as const, [asset]);

  const investScoreData = useMemo(() => asset ? calculateInvestScore({
    price: asset.precio_orientativo || asset.deuda_ob || 0,
    marketValue: asset.valor_mercado || 0,
    ocupado: asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado",
    judicializado: asset.judicializado,
    faseJudicial: asset.fase_judicial,
    provincia: asset.provincia,
    estadoOcupacional: asset.estado_ocupacional,
  }) : { score: 0, factors: { discount: 0, legalComplexity: 0, occupancy: 0, liquidity: 0, timeline: 0 } }, [asset]);

  const academyCategory = useMemo(() => asset ? resolveAcademyCategory({
    cesionRemate: asset.cesion_remate,
    propiedadSinPosesion: asset.propiedad_sin_posesion,
    estadoOcupacional: asset.estado_ocupacional || undefined,
    posturaSubasta: asset.postura_subasta,
  }) : "npl" as const, [asset]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        <Footer />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Activo no encontrado</h1>
          <Link to="/npl" className="text-accent hover:underline">← Volver al listado</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const opType = getOperationType(asset);
  const opLabel = operationLabels[opType];
  const reference = asset.referencia_fencia || asset.asset_id || asset.id.slice(0, 8);
  const addressFull = [asset.direccion, asset.municipio].filter(Boolean).join(", ");
  const googleMapsUrl = addressFull
    ? `https://www.google.es/maps/place/${encodeURIComponent(addressFull)}`
    : null;

  const discount = asset.valor_mercado > 0 && asset.precio_orientativo > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
    : null;

  const isNpl = opType === "npl";
  const hasTwoPrices = !isNpl; // CDR and Ocupado only show 2 prices
  const depositoAmount = asset.deposito_porcentaje > 0 && asset.precio_orientativo > 0
    ? Math.round(asset.precio_orientativo * asset.deposito_porcentaje / 100)
    : null;
  const comisionAmount = asset.comision_porcentaje > 0 && asset.precio_orientativo > 0
    ? Math.round(asset.precio_orientativo * asset.comision_porcentaje / 100)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/npl" className="hover:text-accent transition-colors">Oportunidades</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {asset.direccion || asset.municipio || reference}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ===== SECTION 1: Type + Reference + Prices ===== */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-0">
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-accent">{opLabel}</span>
                <OpportunityTypeBadge type={opportunityType} size="sm" showLearnMore />
                <RiskTrafficLight level={riskLevel} size="sm" />
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Referencia</span> {reference}
              </span>
            </div>

            {/* Pricing boxes - 3 cols for NPL (mercado + deuda + orientativo), 2 cols for CDR/Ocupado */}
            <div className={`grid ${isNpl ? "grid-cols-3" : "grid-cols-2"} gap-0 border border-border rounded-xl overflow-hidden`}>
              {asset.valor_mercado > 0 && (
                <div className="p-4 text-center border-r border-border">
                  <p className="text-lg md:text-xl font-bold text-foreground">{asset.valor_mercado.toLocaleString("es-ES")}&nbsp;€</p>
                  <p className="text-xs text-muted-foreground mt-1">Valor de mercado</p>
                </div>
              )}
              {isNpl && asset.deuda_ob > 0 && (
                <div className="p-4 text-center border-r border-border">
                  <p className="text-lg md:text-xl font-bold text-foreground">{asset.deuda_ob.toLocaleString("es-ES")}&nbsp;€</p>
                  <p className="text-xs text-muted-foreground mt-1">Deuda aproximada</p>
                </div>
              )}
              {asset.precio_orientativo > 0 && (
                <div className="p-4 text-center">
                  <p className="text-lg md:text-xl font-bold text-accent">{asset.precio_orientativo.toLocaleString("es-ES")}&nbsp;€</p>
                  <p className="text-xs text-muted-foreground mt-1">Precio orientativo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: Title + Gallery + Description (left) + Sidebar (right) ===== */}
        <div className="grid lg:grid-cols-12 gap-0 lg:gap-6 mt-0">
          {/* Left column: immovable info */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-b-2xl lg:rounded-2xl border border-t-0 lg:border-t border-border overflow-hidden">
              {/* Subtitle bar */}
              <div className="px-5 md:px-6 pt-5 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isNpl ? "Inmueble principal" : "Inmueble"}
                </span>
                <div className="flex items-center gap-2">
                  {user && (
                    <button onClick={toggleFavorite} className="p-1.5 rounded-full hover:bg-accent/10 transition-colors" title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}>
                      <Heart className={`w-5 h-5 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-accent"}`} />
                    </button>
                  )}
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-accent/10 transition-colors" title="Ver en mapa">
                      <Map className="w-5 h-5 text-muted-foreground hover:text-accent" />
                    </a>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="px-5 md:px-6 pb-4">
                <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mt-2">
                  {(() => {
                    const tipo = asset.tipo_activo ? asset.tipo_activo.charAt(0).toUpperCase() + asset.tipo_activo.slice(1) : "Inmueble";
                    const loc = asset.municipio || asset.provincia || "";
                    const sqm = asset.sqm > 0 ? `${asset.sqm} m²` : "";
                    if (opType === "cesion_remate") {
                      return `${tipo} en cesión de remate${loc ? ` en ${loc}` : ""}${sqm ? ` · ${sqm}` : ""}`;
                    }
                    if (opType === "ocupado") {
                      return `${tipo} sin posesión${loc ? ` en ${loc}` : ""}${sqm ? ` · ${sqm}` : ""}`;
                    }
                    if (opType === "npl") {
                      return `Crédito con colateral ${tipo.toLowerCase()}${loc ? ` en ${loc}` : ""}`;
                    }
                    // subasta
                    return `${tipo} en subasta${loc ? ` en ${loc}` : ""}${sqm ? ` · ${sqm}` : ""}`;
                  })()}
                </h1>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground">
                    {[asset.direccion, asset.provincia || asset.comunidad_autonoma].filter(Boolean).join(" · ")}
                  </p>
                  {asset.estado !== "cerrado" && asset.estado !== "oferta_gestion" && (
                    <span className="text-xs text-accent font-semibold cursor-pointer hover:underline">¿Te interesa?</span>
                  )}
                </div>

                {/* Status banners */}
                {asset.estado === "oferta_gestion" && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mt-4 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Oportunidad no disponible</p>
                      <p className="text-xs text-muted-foreground">Ya cuenta con una oferta en gestión. Puedes <strong>incorporarte a la lista de espera</strong>.</p>
                    </div>
                  </div>
                )}

                {opType === "ocupado" && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mt-4 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-destructive">Inmueble transmitido sin posesión</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Estado: {asset.estado_ocupacional || "Ocupado"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              <div className="px-5 md:px-6 pb-5">
                <AssetImageGallery assetId={asset.id} refCatastral={asset.ref_catastral} direccion={asset.direccion} municipio={asset.municipio} provincia={asset.provincia} />
              </div>
            </div>
          </div>

          {/* Right column: Offer sidebar */}
          <div className="lg:col-span-5 mt-4 lg:mt-0">
            <div className="sticky top-20 space-y-4">
              {/* Offer / Bidding panel (Fencia-style) */}
              {asset.estado === "oferta_gestion" ? (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                    <p className="text-sm font-semibold text-destructive">Actualmente no disponible</p>
                    <p className="text-xs text-muted-foreground mt-1">Este activo tiene una oferta en gestión.</p>
                  </div>
                  <WaitlistButton assetId={asset.id} userId={user?.id} userEmail={userEmail} userName={userName} />
                  <p className="text-[10px] text-muted-foreground"><sup>*</sup>En caso de que la actual oferta en gestión no sea efectiva, priorizaremos la lista de espera por el orden de entrada.</p>
                </div>
              ) : asset.estado === "cerrado" ? (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-sm font-semibold text-muted-foreground">Operación cerrada</p>
                    <p className="text-xs text-muted-foreground mt-1">Este activo ya no acepta ofertas.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Pricing summary with tooltips (Fencia style) */}
                  <div className="p-5 border-b border-border">
                    <div className="flex items-stretch divide-x divide-border">
                      {asset.precio_orientativo > 0 && (
                        <PriceTooltip
                          label="Precio orientativo"
                          value={`${asset.precio_orientativo.toLocaleString("es-ES")} €`}
                          tooltip="Importe recomendado que, considerando la rentabilidad de ambas partes, se estima viable para la operación (sujeto a aprobación)."
                        />
                      )}
                      {asset.deposito_porcentaje > 0 && (
                        <PriceTooltip
                          label="Depósito"
                          value={depositoAmount ? `${depositoAmount.toLocaleString("es-ES")} €` : `${asset.deposito_porcentaje}%`}
                          tooltip="Es el importe que deberá pagar el comprador como garantía del buen fin de la operación."
                        />
                      )}
                      <PriceTooltip
                        label="Comisión IKESA"
                        value={asset.comision_porcentaje > 0
                          ? (comisionAmount ? `${comisionAmount.toLocaleString("es-ES")} € (${asset.comision_porcentaje}%)` : `${asset.comision_porcentaje}%`)
                          : "Exenta"}
                        tooltip={asset.comision_porcentaje > 0
                          ? "Comisión de intermediación a cargo del comprador sobre el precio de la operación."
                          : "La comisión de intermediación es asumida por el fondo/servicer. El comprador no abona comisión."}
                      />
                    </div>
                  </div>

                  {/* Bid panel */}
                  <div className="p-5">
                    <p className="text-sm font-bold text-foreground mb-3">¡Haz tu oferta!</p>
                    {asset.descripcion && (
                      <div className="mb-4">
                        <p className={`text-xs text-muted-foreground leading-relaxed ${!showDescription ? "line-clamp-2" : ""}`}>
                          {asset.descripcion}
                        </p>
                        {asset.descripcion.length > 120 && (
                          <button onClick={() => setShowDescription(!showDescription)} className="text-xs text-accent font-semibold mt-1 hover:underline">
                            {showDescription ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    )}
                    <BiddingPanel
                      assetId={asset.id}
                      precioOrientativo={asset.precio_orientativo}
                      depositoPorcentaje={asset.deposito_porcentaje}
                      comisionPorcentaje={asset.comision_porcentaje}
                      userId={user?.id}
                      userName={userName}
                      userEmail={userEmail}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <Button variant="outline" className="w-full gap-2" onClick={() => generateInvestmentDossier(nplAssetToDossier(asset as any))}>
                  <Download className="w-4 h-4" /> Descargar Dossier
                </Button>
                <EnrichedDossierButton dossierData={nplAssetToDossier(asset as any)} variant="outline" className="w-full" />
                <ShareDossierDialog dossierData={nplAssetToDossier(asset as any)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="w-4 h-4" /> Enviar Dossier por Email
                  </Button>
                </ShareDossierDialog>
              </div>

              {/* IKESA Invest Score */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <IkesaInvestScore score={investScoreData.score} factors={investScoreData.factors} size="md" />
              </div>

              {/* Academy contextual link */}
              <AcademyContextualLink category={academyCategory} variant="card" />
            </div>
          </div>
        </div>

        {/* ===== ANÁLISIS DE LA OPORTUNIDAD (Fencia-style below main) ===== */}
        <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
          <div className="mt-8">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">Análisis de la Oportunidad</h3>
                  <p className="text-xs text-muted-foreground mt-1">La operación detallada para entender su potencialidad.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => generateInvestmentDossier(nplAssetToDossier(asset as any))}>
                  <Download className="w-4 h-4" /> Descargar PDF
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {opType === "cesion_remate" ? (
                  <>
                    <CdrAnalysisPanel asset={asset} />
                    <AnalysisSection title="Información catastral" icon={MapPin} defaultOpen={false}>
                      <CatastroPanel refCatastral={asset.ref_catastral} assetId={asset.id} />
                    </AnalysisSection>
                    <AnalysisSection title="Documentación" icon={FolderOpen} defaultOpen={false}>
                      <DocumentsPanel nplAssetId={asset.id} compact showFilters />
                    </AnalysisSection>
                  </>
                ) : opType === "ocupado" ? (
                  <>
                    <OcupadoAnalysisPanel asset={asset} />
                    <AnalysisSection title="Información catastral" icon={MapPin} defaultOpen={false}>
                      <CatastroPanel refCatastral={asset.ref_catastral} assetId={asset.id} />
                    </AnalysisSection>
                    <AnalysisSection title="Documentación" icon={FolderOpen} defaultOpen={false}>
                      <DocumentsPanel nplAssetId={asset.id} compact showFilters />
                    </AnalysisSection>
                  </>
                ) : (
                  <>
                    {/* NPL and subasta use the full NplAnalysisPanel */}
                    <NplAnalysisPanel asset={asset} />

                    <AnalysisSection title="Condiciones comerciales" icon={Euro} defaultOpen={false}>
                      <div className="divide-y divide-border">
                        <InfoRow label="Comisión IKESA" value={asset.comision_porcentaje > 0 ? `${asset.comision_porcentaje}% (a cargo del comprador)` : "Exenta (asumida por el fondo)"} />
                        <InfoRow label="Depósito" value={asset.deposito_porcentaje > 0 ? `${asset.deposito_porcentaje}%` : "n.a."} />
                        <InfoRow label="Servicer" value={asset.servicer} />
                        <InfoRow label="Cartera" value={asset.cartera} />
                      </div>
                    </AnalysisSection>

                    <AnalysisSection title="Información catastral" icon={MapPin} defaultOpen={false}>
                      <CatastroPanel refCatastral={asset.ref_catastral} assetId={asset.id} />
                    </AnalysisSection>

                    <AnalysisSection title="Documentación" icon={FolderOpen} defaultOpen={false}>
                      <DocumentsPanel nplAssetId={asset.id} compact showFilters />
                    </AnalysisSection>
                  </>
                )}
              </div>
            </div>
          </div>
        </NdaGate>

        {/* Related assets */}
        <RelatedAssets
          currentAssetId={asset.id}
          tipoActivo={asset.tipo_activo}
          provincia={asset.provincia}
          comunidadAutonoma={asset.comunidad_autonoma}
        />
        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto px-4">
          <Disclaimer type={
            asset.cesion_remate ? "cesion-remate" :
            asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado" ? "ocupados" :
            "npl"
          } />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NplDetail;
