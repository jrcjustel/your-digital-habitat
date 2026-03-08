import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, MapPin, Building2, Scale, FileText, Maximize, FolderOpen,
  CreditCard, Gavel, Home, Users, TrendingDown, Euro, Calendar, Hash, Download, Mail, Heart
} from "lucide-react";
import { generateInvestmentDossier, nplAssetToDossier } from "@/lib/dossier";
import ShareDossierDialog from "@/components/ShareDossierDialog";
import EnrichedDossierButton from "@/components/EnrichedDossierButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NdaGate from "@/components/NdaGate";
import DocumentsPanel from "@/components/DocumentsPanel";
import OfferForm from "@/components/OfferForm";
import RelatedAssets from "@/components/RelatedAssets";
import WaitlistButton from "@/components/WaitlistButton";

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

const TransactionIndicator = ({
  icon: Icon, label, active
}: { icon: typeof CreditCard; label: string; active: boolean }) => (
  <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center ${
    active
      ? "bg-accent/10 border-accent/30 text-accent"
      : "bg-muted/50 border-border text-muted-foreground"
  }`}>
    <Icon className={`w-5 h-5 ${active ? "text-accent" : "text-muted-foreground/50"}`} />
    <span className="text-xs font-semibold leading-tight">{label}</span>
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
      active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
    }`}>
      {active ? "Sí" : "No"}
    </span>
  </div>
);

const NplDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<NplAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Try by UUID first, then by asset_id
    const fetchAsset = async () => {
      // Check if id looks like a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUuid) {
        const { data } = await supabase.from("npl_assets").select("*").eq("id", id).single();
        setAsset(data as unknown as NplAsset);
      } else {
        // Search by asset_id (reference)
        const { data } = await supabase.from("npl_assets").select("*").eq("asset_id", id).maybeSingle();
        if (data) {
          setAsset(data as unknown as NplAsset);
        } else {
          // Try ilike as fallback
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
      supabase.from("profiles").select("nda_signed").eq("user_id", user.id).single().then(({ data }) => {
        setNdaSigned(!!(data as any)?.nda_signed);
      });
    }
  }, [user]);

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

  const discount = asset.valor_mercado > 0 && asset.precio_orientativo > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/npl" className="hover:text-accent transition-colors">Oportunidades</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {asset.referencia_fencia || asset.asset_id || asset.id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ===== HEADER CARD ===== */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />

          <div className="p-6 md:p-8">
            {/* Type badge + reference */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                {asset.tipo_activo || "Activo"}
              </span>
              {asset.referencia_fencia && (
                <span className="text-xs font-mono text-muted-foreground">
                  Ref: {asset.referencia_fencia}
                </span>
              )}
              {asset.cartera && (
                <span className="bg-secondary text-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Cartera: {asset.cartera}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              {asset.tipo_activo || "Activo"}
            </h1>
            <p className="text-base text-muted-foreground flex items-center gap-1.5 mb-6">
              <MapPin className="w-4 h-4 text-accent" />
              {asset.direccion || asset.municipio || "Ubicación no disponible"}
              {asset.municipio && asset.direccion && `, ${asset.municipio}`}
            </p>

            {/* Pricing row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {asset.valor_mercado > 0 && (
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Valor de mercado</p>
                  <p className="text-lg font-bold text-foreground">
                    {asset.valor_mercado.toLocaleString("es-ES")} €
                  </p>
                </div>
              )}
              {asset.precio_orientativo > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <p className="text-xs text-accent mb-1">Precio orientativo</p>
                  <p className="text-lg font-bold text-accent">
                    {asset.precio_orientativo.toLocaleString("es-ES")} €
                  </p>
                </div>
              )}
              {discount !== null && discount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs text-green-700 mb-1">Descuento s/ mercado</p>
                  <p className="text-lg font-bold text-green-700 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> {discount}%
                  </p>
                </div>
              )}
              {asset.sqm > 0 && (
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Superficie</p>
                  <p className="text-lg font-bold text-foreground flex items-center gap-1">
                    <Maximize className="w-4 h-4" /> {asset.sqm.toLocaleString("es-ES")} m²
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {asset.descripcion && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-l-2 border-accent/30 pl-4">
                {asset.descripcion}
              </p>
            )}

            {/* 4 Transaction type indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TransactionIndicator
                icon={CreditCard}
                label="Compra de crédito"
                active={asset.cesion_credito}
              />
              <TransactionIndicator
                icon={Gavel}
                label="Cesión de remate"
                active={asset.cesion_remate}
              />
              <TransactionIndicator
                icon={Home}
                label="Propiedad sin posesión"
                active={asset.propiedad_sin_posesion}
              />
              <TransactionIndicator
                icon={Users}
                label="Postura en subasta"
                active={asset.postura_subasta}
              />
            </div>
          </div>
        </div>

        {/* ===== GATED DETAILED CONTENT ===== */}
        <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <Tabs defaultValue="propiedad">
                  <TabsList className="w-full justify-start rounded-none border-b border-border bg-secondary/50 p-0 h-auto flex-wrap">
                    <TabsTrigger value="propiedad" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-5 py-3 gap-2 text-xs sm:text-sm">
                      <Building2 className="w-4 h-4" /> Propiedad
                    </TabsTrigger>
                    <TabsTrigger value="deudor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-5 py-3 gap-2 text-xs sm:text-sm">
                      <Users className="w-4 h-4" /> Deudor
                    </TabsTrigger>
                    <TabsTrigger value="judicial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-5 py-3 gap-2 text-xs sm:text-sm">
                      <Scale className="w-4 h-4" /> Judicial
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-5 py-3 gap-2 text-xs sm:text-sm">
                      <FolderOpen className="w-4 h-4" /> Documentos
                    </TabsTrigger>
                  </TabsList>

                  {/* Información de la propiedad */}
                  <TabsContent value="propiedad" className="p-6 mt-0">
                    <h3 className="font-heading text-base font-bold text-foreground mb-4">Información de la propiedad</h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Comunidad autónoma" value={asset.comunidad_autonoma} />
                      <InfoRow label="Provincia" value={asset.provincia} />
                      <InfoRow label="Municipio" value={asset.municipio} />
                      <InfoRow label="Código postal" value={asset.codigo_postal} />
                      <InfoRow label="Dirección" value={asset.direccion} />
                      <InfoRow label="Tipo de activo" value={asset.tipo_activo} />
                      <InfoRow label="Metros construidos" value={asset.sqm > 0 ? `${asset.sqm.toLocaleString("es-ES")} m²` : null} />
                      <InfoRow label="VPO" value={asset.vpo ? "SÍ" : "NO"} />
                      <InfoRow label="Año construcción" value={asset.anio_construccion} />
                      <InfoRow label="Referencia catastral" value={asset.ref_catastral} />
                      <InfoRow label="Finca registral" value={asset.finca_registral} />
                      <InfoRow label="Registro de propiedad" value={asset.registro_propiedad} />
                      <InfoRow label="Estado ocupacional" value={asset.estado_ocupacional} />
                      <InfoRow label="Servicer" value={asset.servicer} />
                      <InfoRow label="Cartera" value={asset.cartera} />
                    </div>
                  </TabsContent>

                  {/* Deudor */}
                  <TabsContent value="deudor" className="p-6 mt-0">
                    <h3 className="font-heading text-base font-bold text-foreground mb-4">Información del deudor</h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Titulares" value={asset.num_titulares} />
                      <InfoRow label="Nombre deudor" value={asset.name_debtor} />
                      <InfoRow label="Tipo persona" value={asset.persona_tipo} />
                    </div>

                    <h3 className="font-heading text-base font-bold text-foreground mt-8 mb-4">Información de la deuda</h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Deuda pendiente (OB)" value={asset.deuda_ob > 0 ? `${asset.deuda_ob.toLocaleString("es-ES")} €` : "No disponible"} highlight />
                      <InfoRow label="Valor del activo" value={asset.valor_activo > 0 ? `${asset.valor_activo.toLocaleString("es-ES")} €` : "No disponible"} />
                      <InfoRow label="Rango de deuda" value={asset.rango_deuda} />
                      <InfoRow label="NDG" value={asset.ndg} />
                      <InfoRow label="Asset ID" value={asset.asset_id} />
                    </div>
                  </TabsContent>

                  {/* Judicial */}
                  <TabsContent value="judicial" className="p-6 mt-0">
                    <h3 className="font-heading text-base font-bold text-foreground mb-4">Información judicial</h3>
                    <div className="divide-y divide-border">
                      <InfoRow label="Judicializado" value={asset.judicializado ? "SÍ" : "NO"} highlight={asset.judicializado} />
                      <InfoRow label="Fase judicial actual" value={asset.fase_judicial || asset.estado_judicial} />
                      <InfoRow label="Tipo de procedimiento" value={asset.tipo_procedimiento} />
                      <InfoRow label="Referencia" value={asset.referencia_fencia} />
                      <InfoRow label="Cesión de remate" value={asset.cesion_remate ? "SÍ" : "NO"} />
                      <InfoRow label="Cesión de crédito" value={asset.cesion_credito ? "SÍ" : "NO"} />
                      <InfoRow label="Postura en subasta" value={asset.postura_subasta ? "SÍ" : "NO"} />
                      <InfoRow label="Importe pre-aprobado" value={asset.importe_preaprobado > 0 ? `${asset.importe_preaprobado.toLocaleString("es-ES")} €` : "No disponible"} />
                      <InfoRow label="Oferta aprobada" value={asset.oferta_aprobada ? "SÍ" : "NO"} />
                    </div>
                  </TabsContent>

                  {/* Documentos */}
                  <TabsContent value="documentos" className="p-6 mt-0">
                    <h3 className="font-heading text-base font-bold text-foreground mb-4">Documentación del activo</h3>
                    <DocumentsPanel nplAssetId={asset.id} compact showFilters />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* CTA Card */}
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">¿Te interesa este activo?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Solicita más información o presenta tu oferta.
                </p>

                {asset.deposito_porcentaje > 0 && (
                  <div className="bg-secondary rounded-xl p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Depósito requerido</span>
                      <span className="font-bold text-foreground">{asset.deposito_porcentaje}%</span>
                    </div>
                    {asset.comision_porcentaje > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Comisión</span>
                        <span className="font-bold text-foreground">{asset.comision_porcentaje}%</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => setShowOffer(!showOffer)}
                  className="w-full gap-2 mb-3"
                >
                  <Euro className="w-4 h-4" />
                  {showOffer ? "Ocultar formulario" : "Presentar oferta"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2 mb-3"
                  onClick={() => generateInvestmentDossier(nplAssetToDossier(asset as any))}
                >
                  <Download className="w-4 h-4" />
                  Descargar Dossier
                </Button>

                <EnrichedDossierButton
                  dossierData={nplAssetToDossier(asset as any)}
                  variant="outline"
                  className="w-full mb-3"
                />

                <ShareDossierDialog dossierData={nplAssetToDossier(asset as any)}>
                  <Button variant="outline" className="w-full gap-2 mb-3">
                    <Mail className="w-4 h-4" />
                    Enviar Dossier por Email
                  </Button>
                </ShareDossierDialog>

                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="#contacto">
                    <FileText className="w-4 h-4" />
                    Solicitar información
                  </a>
                </Button>

                {showOffer && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <OfferForm
                      propertyId={asset.id}
                      propertyReference={asset.referencia_fencia || asset.asset_id || asset.id.slice(0, 8)}
                    />
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Resumen</h4>
                {asset.valor_mercado > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Valor mercado</span>
                    <span className="ml-auto font-bold text-foreground">{asset.valor_mercado.toLocaleString("es-ES")} €</span>
                  </div>
                )}
                {asset.precio_orientativo > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingDown className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Precio orientativo</span>
                    <span className="ml-auto font-bold text-accent">{asset.precio_orientativo.toLocaleString("es-ES")} €</span>
                  </div>
                )}
                {asset.deuda_ob > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Deuda OB</span>
                    <span className="ml-auto font-bold text-foreground">{asset.deuda_ob.toLocaleString("es-ES")} €</span>
                  </div>
                )}
                {asset.sqm > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Maximize className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Superficie</span>
                    <span className="ml-auto font-bold text-foreground">{asset.sqm.toLocaleString("es-ES")} m²</span>
                  </div>
                )}
                {asset.anio_construccion && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Año</span>
                    <span className="ml-auto font-bold text-foreground">{asset.anio_construccion}</span>
                  </div>
                )}
                {asset.ref_catastral && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ref. catastral</span>
                    <span className="ml-auto font-mono text-xs text-foreground">{asset.ref_catastral}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </NdaGate>
      </div>

      <Footer />
    </div>
  );
};

export default NplDetail;
