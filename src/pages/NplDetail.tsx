import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, MapPin, Building2, Scale, FileText, Maximize, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NdaGate from "@/components/NdaGate";

interface NplAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
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
  comunidad_autonoma: string | null;
  sqm: number;
  estado_ocupacional: string | null;
  tipo_procedimiento: string | null;
  estado_judicial: string | null;
  cesion_remate: boolean;
  cesion_credito: boolean;
  importe_preaprobado: number;
  oferta_aprobada: boolean;
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

const NplDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<NplAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.from("npl_assets").select("*").eq("id", id).single().then(({ data }) => {
        setAsset(data as unknown as NplAsset);
        setLoading(false);
      });
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/npl" className="hover:text-accent transition-colors">Activos NPL</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{asset.asset_id || asset.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <Building2 className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">
                {asset.tipo_activo || "Activo"} — {asset.municipio || "Sin municipio"}, {asset.provincia}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {asset.direccion || "Dirección no disponible"} · {asset.comunidad_autonoma}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {asset.cesion_remate && <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">Cesión de Remate</span>}
            {asset.cesion_credito && <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Cesión de Crédito</span>}
            {asset.cartera && <span className="bg-secondary text-foreground text-xs font-medium px-3 py-1 rounded-full">Cartera: {asset.cartera}</span>}
            {asset.sqm > 0 && (
              <span className="bg-secondary text-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Maximize className="w-3 h-3" /> {asset.sqm.toLocaleString("es-ES")} m²
              </span>
            )}
          </div>
        </div>

        {/* Gated content */}
        <NdaGate user={user} ndaSigned={ndaSigned} onNdaSigned={() => setNdaSigned(true)}>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <Tabs defaultValue="inmueble">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-secondary/50 p-0 h-auto">
                <TabsTrigger value="inmueble" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                  <Building2 className="w-4 h-4" /> Inmueble
                </TabsTrigger>
                <TabsTrigger value="judicial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                  <Scale className="w-4 h-4" /> Judicial
                </TabsTrigger>
                <TabsTrigger value="deuda" className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-3 gap-2">
                  <FileText className="w-4 h-4" /> Deuda
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inmueble" className="p-6 mt-0">
                <div className="divide-y divide-border">
                  <InfoRow label="Comunidad autónoma" value={asset.comunidad_autonoma} />
                  <InfoRow label="Provincia" value={asset.provincia} />
                  <InfoRow label="Municipio" value={asset.municipio} />
                  <InfoRow label="Dirección" value={asset.direccion} />
                  <InfoRow label="Tipo de activo" value={asset.tipo_activo} />
                  <InfoRow label="Superficie (m²)" value={asset.sqm > 0 ? `${asset.sqm.toLocaleString("es-ES")} m²` : null} />
                  <InfoRow label="Referencia catastral" value={asset.ref_catastral} />
                  <InfoRow label="Finca registral" value={asset.finca_registral} />
                  <InfoRow label="Registro de propiedad" value={asset.registro_propiedad} />
                  <InfoRow label="Estado ocupacional" value={asset.estado_ocupacional} />
                  <InfoRow label="Asset ID" value={asset.asset_id} />
                  <InfoRow label="Servicer" value={asset.servicer} />
                  <InfoRow label="Cartera" value={asset.cartera} />
                </div>
              </TabsContent>

              <TabsContent value="judicial" className="p-6 mt-0">
                <div className="divide-y divide-border">
                  <InfoRow label="Tipo de procedimiento" value={asset.tipo_procedimiento} />
                  <InfoRow label="Estado judicial" value={asset.estado_judicial} />
                  <InfoRow label="Cesión de remate" value={asset.cesion_remate ? "SÍ" : "NO"} />
                  <InfoRow label="Cesión de crédito" value={asset.cesion_credito ? "SÍ" : "NO"} />
                  <InfoRow label="Importe pre-aprobado" value={asset.importe_preaprobado > 0 ? `${asset.importe_preaprobado.toLocaleString("es-ES")} €` : "No disponible"} />
                  <InfoRow label="Oferta aprobada" value={asset.oferta_aprobada ? "SÍ" : "NO"} />
                </div>
              </TabsContent>

              <TabsContent value="deuda" className="p-6 mt-0">
                <div className="divide-y divide-border">
                  <InfoRow label="Deuda pendiente (OB)" value={asset.deuda_ob > 0 ? `${asset.deuda_ob.toLocaleString("es-ES")} €` : "No disponible"} />
                  <InfoRow label="Valor del activo" value={asset.valor_activo > 0 ? `${asset.valor_activo.toLocaleString("es-ES")} €` : "No disponible"} />
                  <InfoRow label="Rango de deuda" value={asset.rango_deuda} />
                  <InfoRow label="NDG" value={asset.ndg} />
                  <InfoRow label="Deudor" value={asset.name_debtor} />
                  <InfoRow label="Tipo persona" value={asset.persona_tipo} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </NdaGate>
      </div>

      <Footer />
    </div>
  );
};

export default NplDetail;
