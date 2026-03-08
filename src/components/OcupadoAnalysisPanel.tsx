import { Building2, Euro, Scale, Users, ShieldAlert, Home, CreditCard, AlertTriangle, Info, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface OcupadoAsset {
  direccion: string | null;
  codigo_postal: string | null;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  ref_catastral: string | null;
  sqm: number;
  anio_construccion: number | null;
  estado_ocupacional: string | null;
  vpo: boolean;
  valor_activo: number;
  valor_mercado: number;
  precio_orientativo: number;
  importe_preaprobado: number;
  deuda_ob: number;
  comision_porcentaje: number;
  deposito_porcentaje: number;
  finca_registral: string | null;
  registro_propiedad: string | null;
  persona_tipo: string | null;
  num_titulares: number;
  fase_judicial: string | null;
  estado_judicial: string | null;
  judicializado: boolean;
  cesion_credito: boolean;
  cesion_remate: boolean;
  postura_subasta: boolean;
  propiedad_sin_posesion: boolean;
  referencia_fencia: string | null;
  asset_id: string | null;
  rango_deuda: string | null;
  descripcion: string | null;
  ndg: string | null;
}

interface Props {
  asset: OcupadoAsset;
}

const fmt = (n: number) => n.toLocaleString("es-ES");

const DataRow = ({ label, value, highlight, note }: {
  label: string; value: string | number | null | undefined; highlight?: boolean; note?: string;
}) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {label}
        {note && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs">{note}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className={`text-sm font-medium text-right ${highlight ? "text-accent font-bold" : "text-foreground"}`}>{value}</span>
    </div>
  );
};

/** Boolean flag chip */
const FlagChip = ({ label, active }: { label: string; active: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
    {active ? <Check className="w-4 h-4 text-accent" /> : <X className="w-4 h-4 text-muted-foreground/40" />}
    <span className={`text-xs font-medium ${active ? "text-accent" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

const OcupadoAnalysisPanel = ({ asset }: Props) => {
  const market = asset.valor_mercado || asset.valor_activo || 0;
  const price = asset.precio_orientativo || 0;
  const area = asset.sqm || 0;
  const reference = asset.referencia_fencia || asset.asset_id || "";
  const discount = market > 0 && price > 0 ? Math.round((1 - price / market) * 100) : null;

  return (
    <div className="space-y-6">
      {/* ── Description ── */}
      <div>
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {asset.descripcion || (
              <>
                Inmueble situado en <strong>{asset.municipio || "ubicación no disponible"}</strong>
                {asset.provincia ? `, (${asset.provincia})` : ""}.
                {area > 0 ? ` El piso cuenta con una superficie construida de ${fmt(area)} m²` : ""}
                {market > 0 ? ` y cuenta con un valor de mercado estimado de ${fmt(market)} €` : ""}.
                {" "}Dicho inmueble <strong className="text-destructive">se transmite sin posesión</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Operation type flags ── */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Tipo de operación</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <FlagChip label="Compra de crédito" active={asset.cesion_credito} />
          <FlagChip label="Cesión de remate" active={asset.cesion_remate} />
          <FlagChip label="Propiedad sin posesión" active={asset.propiedad_sin_posesion} />
          <FlagChip label="Postura en subasta" active={asset.postura_subasta} />
        </div>
      </div>

      {/* ── Occupation warning ── */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-destructive mb-1">Inmueble transmitido sin posesión</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Este inmueble se transmite sin posesión efectiva. El adquirente deberá gestionar la recuperación
              posesoria por vía amistosa o judicial, asumiendo los plazos y costes asociados.
            </p>
            {asset.estado_ocupacional && (
              <Badge variant="outline" className="mt-2 text-destructive border-destructive/30">
                Estado: {asset.estado_ocupacional}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Left: Property info + Deudor ── */}
        <div className="space-y-6">
          {/* Información de la propiedad */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Información de la propiedad</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Comunidad autónoma" value={asset.comunidad_autonoma} />
              <DataRow label="Provincia" value={asset.provincia} />
              <DataRow label="Municipio" value={asset.municipio} />
              <DataRow label="Código postal" value={asset.codigo_postal} />
              <DataRow label="Dirección" value={asset.direccion} />
              <DataRow label="Tipología" value={asset.tipo_activo} />
              <DataRow label="Metros construidos" value={area > 0 ? `${fmt(area)} m²` : null} />
              <DataRow label="VPO" value={asset.vpo ? "SÍ" : "NO"} />
              <DataRow label="Año construcción" value={asset.anio_construccion} />
              <DataRow label="Referencia catastral" value={asset.ref_catastral} />
              <DataRow label="Finca registral" value={asset.finca_registral} />
              <DataRow label="Registro propiedad" value={asset.registro_propiedad} />
            </div>
          </div>

          {/* Deudor */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Deudor</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Titulares" value={asset.num_titulares} />
              <DataRow label="Tipo persona" value={asset.persona_tipo === "juridica" ? "Jurídica" : asset.persona_tipo === "fisica" ? "Física" : asset.persona_tipo || "n.d."} />
            </div>
          </div>
        </div>

        {/* ── Right: Deuda + Judicial + Valoración ── */}
        <div className="space-y-6">
          {/* Deuda */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Deuda</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Rango" value={asset.rango_deuda || "–"} />
              <DataRow label="Deuda actual" value={asset.deuda_ob > 0 ? `${fmt(asset.deuda_ob)} €` : "–"} highlight />
              <DataRow label="Valor del activo" value={asset.valor_activo > 0 ? `${fmt(asset.valor_activo)} €` : "–"} />
              <DataRow label="NDG" value={asset.ndg || "–"} />
              <DataRow label="Asset ID" value={asset.asset_id || "–"} />
              {asset.deuda_ob > 0 && market > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">LTV (Deuda / Valor)</span>
                    <span className="text-sm font-bold text-foreground">{Math.round((asset.deuda_ob / market) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información judicial */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Información judicial</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Judicializado" value={asset.judicializado ? "SÍ" : "NO"} highlight={asset.judicializado} />
              <DataRow label="Fase judicial actual" value={asset.fase_judicial || asset.estado_judicial || "n.a."} />
              <DataRow label="Referencia" value={reference || "n.a."} />
              <DataRow label="Importe pre-aprobado" value={asset.importe_preaprobado > 0 ? `${fmt(asset.importe_preaprobado)} €` : "n.a."} />
            </div>
          </div>

          {/* Valoración */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold text-foreground">Valoración</h4>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DataRow label="Valor de mercado" value={market > 0 ? `${fmt(market)} €` : "–"} highlight />
              <DataRow label="Precio orientativo" value={price > 0 ? `${fmt(price)} €` : "–"} highlight />
              {discount !== null && discount > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Descuento s/ mercado</span>
                  <Badge className="bg-accent/10 text-accent border-accent/20 font-bold">-{discount}%</Badge>
                </div>
              )}
              {area > 0 && market > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">€/m²</span>
                  <span className="text-sm font-medium text-foreground">{fmt(Math.round(market / area))} €/m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Consideraciones importantes ── */}
      <div className="bg-secondary/50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-foreground mb-2">Consideraciones importantes</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>El proceso de desahucio puede tardar entre 6-18 meses según la jurisdicción.</li>
              <li>Evalúe la posibilidad de negociación de salida voluntaria con compensación económica.</li>
              <li>Considere los costes legales adicionales en el cálculo de rentabilidad.</li>
              <li>El estado de conservación del inmueble puede ser desconocido o deteriorado.</li>
              <li>Los valores de mercado se refieren al inmueble libre de ocupantes y no reflejan su valor actual con ocupación.</li>
              {asset.vpo && <li className="text-destructive font-semibold">⚠️ Inmueble VPO: puede tener restricciones de venta y precio máximo.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Footnote ── */}
      <div className="text-[10px] text-muted-foreground leading-relaxed">
        Los datos tienen carácter meramente informativo y no constituyen asesoramiento de inversión. Se recomienda verificación independiente y asesoramiento legal especializado.
      </div>
    </div>
  );
};

export default OcupadoAnalysisPanel;
