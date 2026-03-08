import { useState, useEffect } from "react";
import { Loader2, MapPin, Maximize, Calendar, Building2, ExternalLink, FileText, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CatastroData {
  ref_catastral: string;
  direccion: string;
  municipio: string;
  provincia: string;
  codigo_postal: string;
  tipo_inmueble: string;
  uso_catastral: string;
  uso_predominante: string;
  clase: string;
  superficie_m2: number;
  superficie_suelo: number;
  superficie_construida: number;
  anio_construccion: number | null;
  planta: number | null;
  coeficiente_participacion: string;
  usos_detalle: { uso: string; superficie: number; planta: string }[];
  urls: {
    ficha_catastral: string;
    cartografia: string;
  };
}

interface CatastroPanelProps {
  refCatastral: string | null;
  assetId: string;
  onDataLoaded?: (data: CatastroData) => void;
}

const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};

const CatastroPanel = ({ refCatastral, assetId, onDataLoaded }: CatastroPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CatastroData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchCatastro = async (saveToAsset = false) => {
    if (!refCatastral) {
      setError("Este activo no tiene referencia catastral");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("catastro-lookup", {
        body: {
          ref_catastral: refCatastral,
          asset_id: saveToAsset ? assetId : undefined,
          save_to_asset: saveToAsset,
        },
      });

      if (fnError) throw fnError;
      if (!result?.success) throw new Error(result?.error || "Error consultando Catastro");

      setData(result.data);
      if (saveToAsset) {
        setSaved(true);
        toast.success("Datos catastrales guardados en el activo y documentos");
      }
      onDataLoaded?.(result.data);
    } catch (err: any) {
      console.error("Catastro error:", err);
      setError(err.message || "Error consultando el Catastro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refCatastral) {
      fetchCatastro(false);
    }
  }, [refCatastral]);

  if (!refCatastral) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Este activo no tiene referencia catastral registrada.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground">Consultando Catastro...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive/60" />
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchCatastro(false)}>
          <RefreshCw className="w-4 h-4 mr-1" /> Reintentar
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Status + actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Datos obtenidos del Catastro
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCatastro(false)}
            className="gap-1 text-xs"
          >
            <RefreshCw className="w-3 h-3" /> Actualizar
          </Button>
          {!saved && (
            <Button
              size="sm"
              onClick={() => fetchCatastro(true)}
              className="gap-1 text-xs"
            >
              <FileText className="w-3 h-3" /> Guardar en activo
            </Button>
          )}
          {saved && (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs gap-1">
              <CheckCircle2 className="w-3 h-3" /> Guardado
            </Badge>
          )}
        </div>
      </div>

      {/* Main data */}
      <div className="divide-y divide-border">
        <InfoRow label="Referencia catastral" value={data.ref_catastral} />
        <InfoRow label="Dirección" value={data.direccion} />
        <InfoRow label="Municipio" value={data.municipio} />
        <InfoRow label="Provincia" value={data.provincia} />
        <InfoRow label="Código postal" value={data.codigo_postal} />
        <InfoRow label="Tipo inmueble" value={data.tipo_inmueble} />
        <InfoRow label="Uso catastral" value={data.uso_predominante || data.uso_catastral} />
        {data.clase && <InfoRow label="Clase" value={data.clase} />}
        <InfoRow label="Superficie construida" value={data.superficie_construida > 0 ? `${data.superficie_construida} m²` : null} />
        {data.superficie_suelo > 0 && <InfoRow label="Superficie suelo" value={`${data.superficie_suelo} m²`} />}
        <InfoRow label="Año construcción" value={data.anio_construccion} />
        {data.planta !== null && <InfoRow label="Planta" value={data.planta === 0 ? "Baja" : data.planta === -1 ? "Sótano" : `${data.planta}ª`} />}
        {data.coeficiente_participacion && <InfoRow label="Coef. participación" value={`${data.coeficiente_participacion}%`} />}
      </div>

      {/* Usos detalle */}
      {data.usos_detalle && data.usos_detalle.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Desglose de usos</h4>
          <div className="bg-secondary rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Uso</th>
                  <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium">m²</th>
                  <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium">Planta</th>
                </tr>
              </thead>
              <tbody>
                {data.usos_detalle.map((u, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{u.uso}</td>
                    <td className="px-3 py-2 text-right font-medium text-foreground">{u.superficie || "—"}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{u.planta || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* External links */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={data.urls.ficha_catastral}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2 text-xs">
            <ExternalLink className="w-3.5 h-3.5" />
            Ver ficha en Catastro
          </Button>
        </a>
        <a
          href={data.urls.cartografia}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            Ver cartografía
          </Button>
        </a>
      </div>
    </div>
  );
};

export default CatastroPanel;
