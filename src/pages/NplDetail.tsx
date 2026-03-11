import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, MapPin, Building2, Scale, FileText, Maximize, FolderOpen,
  Gavel, Home, TrendingDown, Euro, Calendar, Download, Mail, Heart,
  ShieldAlert, Share2, Lock, CreditCard
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NdaGate from "@/components/NdaGate";
import DocumentsPanel from "@/components/DocumentsPanel";
import BiddingPanel from "@/components/BiddingPanel";
import RelatedAssets from "@/components/RelatedAssets";
import Disclaimer from "@/components/Disclaimer";
import WaitlistButton from "@/components/WaitlistButton";
import CatastroPanel from "@/components/CatastroPanel";
import AssetImageGallery from "@/components/AssetImageGallery";
import SaleTypeBanner from "@/components/SaleTypeBanner";
import type { SaleType } from "@/data/properties";
import { toast } from "@/components/ui/sonner";

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

const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

const getOperationType = (asset: NplAsset): "npl" | "cesion_remate" | "ocupado" | "subasta" => {
  if (asset.cesion_remate) return "cesion_remate";
  if (asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado") return "ocupado";
  if (asset.postura_subasta) return "subasta";
  return "npl";
};

const saleTypeMap: Record<string, SaleType> = {
  npl: "npl",
  cesion_remate: "cesion-remate",
  ocupado: "ocupado",
  subasta: "compraventa",
};

const operationLabels: Record<string, string> = {
  npl: "Compraventa de crédito (NPL)",
  cesion_remate: "Cesión de remate",
  ocupado: "Inmueble sin posesión",
  subasta: "Postura en subasta",
};

const occupancyLabels: Record<string, string> = {
  libre: "Libre",
  ocupado: "Ocupado",
  "ocupado-con-derecho": "Ocupado con título",
  "ocupado-sin-derecho": "Ocupado sin título",
  desconocido: "Desconocido",
};

const judicialPhaseLabels: Record<string, string> = {
  monitorio: "Procedimiento monitorio",
  ejecutivo: "Ejecución hipotecaria",
  declarativo: "Procedimiento declarativo",
  subasta: "Subasta señalada",
  posesion: "Demanda de posesión",
  "pre-judicial": "Pre-judicial / negociación",
};

const NplDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<NplAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [ndaLoading, setNdaLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

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
        setNdaLoading(false);
        setUserName((data as any)?.display_name || "");
      });
      setUserEmail(user.email || "");
      if (asset) {
        supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", asset.id).maybeSingle().then(({ data }) => {
          setIsFav(!!data);
        });
      }
    } else {
      setNdaSigned(false);
      setNdaLoading(false);
    }
  }, [user, asset?.id]);

  const toggleFavorite = async () => {
    if (!user || !asset) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", asset.id);
      setIsFav(false);
      toast.success("Eliminado de favoritos");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: asset.id });
      setIsFav(true);
      toast.success("Añadido a favoritos");
      await supabase.from("activity_log").insert({ user_id: user.id, action: "favorite_added", entity_type: "npl_asset", entity_id: asset.id });
    }
  };

  // Intelligence layer
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
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Oportunidad no encontrada</h1>
          <Link to="/inmuebles" className="text-accent hover:underline">← Volver al listado</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const opType = getOperationType(asset);
  const opLabel = operationLabels[opType];
  const reference = asset.referencia_fencia || asset.asset_id || asset.id.slice(0, 8);
  const discount = asset.valor_mercado > 0 && asset.precio_orientativo > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
    : null;

  const saleType = saleTypeMap[opType] || "npl";

  const title = (() => {
    const tipo = asset.tipo_activo ? asset.tipo_activo.charAt(0).toUpperCase() + asset.tipo_activo.slice(1) : "Inmueble";
    const loc = asset.municipio || asset.provincia || "";
    const sqm = asset.sqm > 0 ? `· ${asset.sqm} m²` : "";
    if (opType === "cesion_remate") return `${tipo} en cesión de remate${loc ? ` en ${loc}` : ""} ${sqm}`.trim();
    if (opType === "ocupado") return `${tipo} sin posesión${loc ? ` en ${loc}` : ""} ${sqm}`.trim();
    if (opType === "npl") return `Crédito con colateral ${tipo.toLowerCase()}${loc ? ` en ${loc}` : ""}`.trim();
    return `${tipo} en subasta${loc ? ` en ${loc}` : ""} ${sqm}`.trim();
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/inmuebles" className="hover:text-accent transition-colors">Oportunidades</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{reference}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header card - reference + prices */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">Referencia {reference}</h2>
                <OpportunityTypeBadge type={opportunityType} size="sm" showLearnMore />
                <RiskTrafficLight level={riskLevel} size="sm" />
                <Badge variant="outline" className="text-[11px]">{opLabel}</Badge>
                {asset.tipo_activo && (
                  <span className="bg-secondary text-xs font-medium px-2.5 py-1 rounded-full text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {asset.tipo_activo}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleFavorite} className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <Heart className={`w-5 h-5 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
              <button className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-accent/10 border-2 border-accent rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio orientativo</p>
              <p className="text-2xl font-bold text-accent">
                {asset.precio_orientativo > 0 ? `${asset.precio_orientativo.toLocaleString("es-ES")} €` : "A consultar"}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Deuda aproximada</p>
              <p className="text-2xl font-bold text-foreground">
                {asset.deuda_ob > 0 ? `${asset.deuda_ob.toLocaleString("es-ES")} €` : "A consultar"}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor de subasta</p>
              <p className="text-2xl font-bold text-foreground">
                {asset.valor_mercado > 0 ? `${asset.valor_mercado.toLocaleString("es-ES")} €` : "A consultar"}
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
                    <Heart className={`w-5 h-5 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
              </div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-sm text-muted-foreground mb-1">
                {[asset.municipio, asset.provincia].filter(Boolean).join(", ")}
              </p>

              {/* Status banners */}
              {asset.estado === "oferta_gestion" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mt-4 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Oportunidad no disponible</p>
                    <p className="text-xs text-muted-foreground">Ya cuenta con una oferta en gestión.</p>
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

            {/* Image gallery */}
            <AssetImageGallery
              assetId={asset.id}
              refCatastral={asset.ref_catastral}
              direccion={asset.direccion}
              municipio={asset.municipio}
              provincia={asset.provincia}
            />

            {/* Analysis + Tabs - gated by NDA */}
            <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold text-foreground">Análisis de la Oportunidad</h2>
                  <div className="flex gap-2">
                    <button onClick={() => generateInvestmentDossier(nplAssetToDossier(asset as any))} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2 px-4 rounded-lg font-medium transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      Dossier
                    </button>
                    <EnrichedDossierButton dossierData={nplAssetToDossier(asset as any)} />
                    <ShareDossierDialog dossierData={nplAssetToDossier(asset as any)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">La operación detallada para entender su potencialidad.</p>
                {asset.descripcion && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{asset.descripcion}</p>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {asset.sqm > 0 && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Maximize className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{asset.sqm.toLocaleString("es-ES")} m²</p>
                      <p className="text-[10px] text-muted-foreground">Superficie</p>
                    </div>
                  )}
                  {asset.anio_construccion && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{asset.anio_construccion}</p>
                      <p className="text-[10px] text-muted-foreground">Año const.</p>
                    </div>
                  )}
                  {discount && discount > 0 && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <TrendingDown className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">-{discount}%</p>
                      <p className="text-[10px] text-muted-foreground">Descuento</p>
                    </div>
                  )}
                  {asset.num_titulares > 0 && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Building2 className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-bold text-foreground">{asset.num_titulares}</p>
                      <p className="text-[10px] text-muted-foreground">Titular(es)</p>
                    </div>
                  )}
                </div>

                {/* Type badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {asset.cesion_remate && (
                    <span className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Gavel className="w-3 h-3" /> Cesión de remate
                    </span>
                  )}
                  {asset.cesion_credito && (
                    <span className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Cesión de crédito
                    </span>
                  )}
                  {asset.vpo && (
                    <span className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full">VPO</span>
                  )}
                  {asset.propiedad_sin_posesion && (
                    <span className="bg-destructive/10 text-destructive text-xs px-3 py-1.5 rounded-full">Sin posesión</span>
                  )}
                </div>
              </div>

              {/* Tabs: Inmueble / Judicial / Deuda / Documentos */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden mt-6">
                <Tabs defaultValue="inmueble">
                  <TabsList className="w-full justify-start rounded-none border-b border-border bg-secondary/50 p-0 h-auto">
                    <TabsTrigger value="inmueble" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                      <Home className="w-4 h-4" /> Inmueble
                    </TabsTrigger>
                    <TabsTrigger value="judicial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                      <Scale className="w-4 h-4" /> Judicial
                    </TabsTrigger>
                    <TabsTrigger value="deuda" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                      <FileText className="w-4 h-4" /> Deuda
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                      <FolderOpen className="w-4 h-4" /> Documentos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="inmueble" className="p-6 mt-0">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-accent" /> Colateral / Inmueble Principal
                    </h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Comunidad autónoma" value={asset.comunidad_autonoma} />
                      <InfoRow label="Provincia" value={asset.provincia} />
                      <InfoRow label="Municipio" value={asset.municipio} />
                      <InfoRow label="Código postal" value={asset.codigo_postal} />
                      <InfoRow label="Dirección" value={asset.direccion} />
                      <InfoRow label="Tipo de activo" value={asset.tipo_activo} />
                      {asset.sqm > 0 && <InfoRow label="Superficie" value={`${asset.sqm.toLocaleString("es-ES")} m²`} />}
                      <InfoRow label="VPO" value={asset.vpo ? "SÍ" : "NO"} />
                      <InfoRow label="Año construcción" value={asset.anio_construccion} />
                      <InfoRow label="Referencia catastral" value={asset.ref_catastral} />
                      <InfoRow label="Finca registral" value={asset.finca_registral} />
                      <InfoRow label="Registro de la propiedad" value={asset.registro_propiedad} />
                      <InfoRow label="Estado ocupacional" value={asset.estado_ocupacional ? (occupancyLabels[asset.estado_ocupacional] || asset.estado_ocupacional) : null} />
                      <InfoRow label="Propiedad sin posesión" value={asset.propiedad_sin_posesion ? "SÍ" : "NO"} />
                    </div>

                    {/* Catastro panel */}
                    {asset.ref_catastral && (
                      <div className="mt-6">
                        <CatastroPanel refCatastral={asset.ref_catastral} assetId={asset.id} />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="judicial" className="p-6 mt-0">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-accent" /> Información judicial
                    </h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Judicializado" value={asset.judicializado ? "SÍ" : "NO"} />
                      <InfoRow label="Fase judicial" value={asset.fase_judicial ? (judicialPhaseLabels[asset.fase_judicial] || asset.fase_judicial) : null} />
                      <InfoRow label="Estado judicial" value={asset.estado_judicial} />
                      <InfoRow label="Tipo de procedimiento" value={asset.tipo_procedimiento} />
                      <InfoRow label="Postura en subasta" value={asset.postura_subasta ? "SÍ" : "NO"} />
                    </div>
                  </TabsContent>

                  <TabsContent value="deuda" className="p-6 mt-0">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" /> Información de la deuda
                    </h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Deuda pendiente" value={asset.deuda_ob > 0 ? `${asset.deuda_ob.toLocaleString("es-ES")} €` : null} />
                      <InfoRow label="Rango de deuda" value={asset.rango_deuda} />
                      <InfoRow label="Valor del activo" value={asset.valor_activo > 0 ? `${asset.valor_activo.toLocaleString("es-ES")} €` : null} />
                      <InfoRow label="Valor de subasta" value={asset.valor_mercado > 0 ? `${asset.valor_mercado.toLocaleString("es-ES")} €` : null} />
                      <InfoRow label="Importe preaprobado" value={asset.importe_preaprobado > 0 ? `${asset.importe_preaprobado.toLocaleString("es-ES")} €` : null} />
                      <InfoRow label="Nº titulares" value={asset.num_titulares} />
                      <InfoRow label="Tipo de persona" value={asset.persona_tipo === "fisica" ? "Persona física" : asset.persona_tipo === "juridica" ? "Persona jurídica" : asset.persona_tipo} />
                      <InfoRow label="Servicer" value={asset.servicer} />
                      <InfoRow label="Cartera" value={asset.cartera} />
                      <InfoRow label="NDG" value={asset.ndg} />
                    </div>

                    {/* Commercial conditions */}
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Euro className="w-4 h-4 text-accent" /> Condiciones comerciales
                      </h4>
                      <div className="divide-y divide-border">
                        <InfoRow label="Comisión IKESA" value={asset.comision_porcentaje > 0 ? `${asset.comision_porcentaje}% (a cargo del comprador)` : "Exenta (asumida por el fondo)"} />
                        <InfoRow label="Depósito" value={asset.deposito_porcentaje > 0 ? `${asset.deposito_porcentaje}%` : "n.a."} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documentos" className="p-6 mt-0">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-accent" /> Documentación del activo
                    </h3>
                    <DocumentsPanel nplAssetId={asset.id} compact showFilters />
                  </TabsContent>
                </Tabs>
              </div>

              <SaleTypeBanner saleType={saleType} />
            </NdaGate>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer CTA / Bidding */}
            {asset.estado === "oferta_gestion" ? (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  <p className="text-sm font-semibold text-destructive">Actualmente no disponible</p>
                  <p className="text-xs text-muted-foreground mt-1">Este activo tiene una oferta en gestión.</p>
                </div>
                <WaitlistButton assetId={asset.id} userId={user?.id} userEmail={userEmail} userName={userName} />
              </div>
            ) : asset.estado === "cerrado" ? (
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm font-semibold text-muted-foreground">Operación cerrada</p>
                  <p className="text-xs text-muted-foreground mt-1">Este activo ya no acepta ofertas.</p>
                </div>
              </div>
            ) : !user || !ndaSigned ? (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                <Lock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Regístrate y firma el NDA para enviar ofertas.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                  <p className="text-sm font-bold text-foreground mb-3">¡Haz tu oferta!</p>
                  {asset.descripcion && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-2">{asset.descripcion}</p>
                  )}
                </div>
                <div className="p-5">
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

            {/* Reference card */}
            <div className="bg-card border border-border rounded-2xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Referencia</p>
              <p className="font-heading text-lg font-bold text-foreground">{reference}</p>
            </div>

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

            {/* Investment Intelligence Panel */}
            <InvestmentIntelligenceCard
              input={{
                price: asset.precio_orientativo || asset.deuda_ob || 0,
                marketValue: asset.valor_mercado || 0,
                sqm: asset.sqm || undefined,
                occupied: asset.propiedad_sin_posesion || asset.estado_ocupacional === "ocupado",
                occupancyStatus: asset.estado_ocupacional,
                judicialPhase: asset.fase_judicial,
                province: asset.provincia,
                commissionPct: asset.comision_porcentaje || 0,
              }}
              riskLevel={riskLevel}
            />

            {/* Academy contextual link */}
            <AcademyContextualLink category={academyCategory} variant="card" />
          </div>
        </div>

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
