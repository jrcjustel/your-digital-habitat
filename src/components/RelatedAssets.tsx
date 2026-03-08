import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, TrendingDown, Maximize, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RelatedAssetsProps {
  currentAssetId: string;
  tipoActivo: string | null;
  provincia: string | null;
  comunidadAutonoma: string | null;
}

interface RelatedAsset {
  id: string;
  municipio: string | null;
  provincia: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  sqm: number;
  precio_orientativo: number;
  valor_mercado: number;
}

const RelatedAssets = ({ currentAssetId, tipoActivo, provincia, comunidadAutonoma }: RelatedAssetsProps) => {
  const [similar, setSimilar] = useState<RelatedAsset[]>([]);
  const [popular, setPopular] = useState<RelatedAsset[]>([]);

  useEffect(() => {
    loadRelated();
  }, [currentAssetId]);

  const loadRelated = async () => {
    // Similar: same tipo_activo or same provincia
    let query = supabase
      .from("npl_assets")
      .select("id, municipio, provincia, tipo_activo, direccion, sqm, precio_orientativo, valor_mercado")
      .eq("publicado", true)
      .neq("id", currentAssetId)
      .limit(6);

    if (tipoActivo) query = query.eq("tipo_activo", tipoActivo);
    else if (provincia) query = query.eq("provincia", provincia);

    const { data: simData } = await query;
    setSimilar((simData as unknown as RelatedAsset[]) || []);

    // Popular: random published assets from same CCAA
    let popQuery = supabase
      .from("npl_assets")
      .select("id, municipio, provincia, tipo_activo, direccion, sqm, precio_orientativo, valor_mercado")
      .eq("publicado", true)
      .neq("id", currentAssetId)
      .limit(6);

    if (comunidadAutonoma) popQuery = popQuery.eq("comunidad_autonoma", comunidadAutonoma);

    const { data: popData } = await popQuery;
    setPopular((popData as unknown as RelatedAsset[]) || []);
  };

  const renderCard = (a: RelatedAsset) => {
    const discount = a.valor_mercado > 0 && a.precio_orientativo > 0
      ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
      : null;

    return (
      <Link key={a.id} to={`/npl/${a.id}`} className="group min-w-[260px] max-w-[300px] shrink-0">
        <div className="bg-card rounded-xl border border-border p-4 hover:border-accent/30 hover:shadow-md transition-all h-full">
          <Badge variant="default" className="text-[10px] mb-2">{a.tipo_activo || "Activo"}</Badge>
          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {a.tipo_activo} — {a.municipio || "—"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-accent" /> {a.provincia || "—"}
          </p>
          <div className="flex items-center justify-between text-xs">
            {a.precio_orientativo > 0 && (
              <span className="font-bold text-accent">{a.precio_orientativo.toLocaleString("es-ES")} €</span>
            )}
            {a.valor_mercado > 0 && (
              <span className="text-muted-foreground">{a.valor_mercado.toLocaleString("es-ES")} € VM</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            {a.sqm > 0 && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{a.sqm} m²</span>}
            {discount && discount > 0 && (
              <span className="text-green-600 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />-{discount}%
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (similar.length === 0 && popular.length === 0) return null;

  return (
    <div className="space-y-8 mt-8">
      {similar.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Activos similares</h3>
            <Link to="/npl" className="text-xs text-accent flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {similar.map(renderCard)}
          </div>
        </div>
      )}
      {popular.length > 0 && similar.length === 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">Otros activos en {comunidadAutonoma || "la zona"}</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {popular.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedAssets;
