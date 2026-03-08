import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, MapPin, Maximize, TrendingDown, CreditCard, Gavel, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface NplAssetCardProps {
  asset: {
    id: string;
    municipio: string | null;
    provincia: string | null;
    tipo_activo: string | null;
    direccion: string | null;
    comunidad_autonoma: string | null;
    sqm: number;
    precio_orientativo?: number;
    valor_mercado?: number;
    deuda_ob?: number;
    cesion_remate: boolean;
    cesion_credito: boolean;
    estado?: string | null;
  };
  isFavorited?: boolean;
  userId?: string;
  onFavoriteToggle?: (assetId: string, favorited: boolean) => void;
}

const NplAssetCard = ({ asset, isFavorited = false, userId, onFavoriteToggle }: NplAssetCardProps) => {
  const [fav, setFav] = useState(isFavorited);
  const [toggling, setToggling] = useState(false);

  const discount = asset.valor_mercado && asset.precio_orientativo && asset.valor_mercado > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
    : null;

  const eurPerSqm = asset.valor_mercado && asset.sqm > 0
    ? Math.round(asset.valor_mercado / asset.sqm)
    : null;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }
    setToggling(true);
    try {
      if (fav) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("property_id", asset.id);
        setFav(false);
        onFavoriteToggle?.(asset.id, false);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, property_id: asset.id });
        setFav(true);
        onFavoriteToggle?.(asset.id, true);
        // Log activity
        await supabase.from("activity_log").insert({ user_id: userId, action: "favorite_added", entity_type: "npl_asset", entity_id: asset.id });
      }
    } catch { /* silent */ }
    setToggling(false);
  };

  const isUnavailable = asset.estado === "oferta_gestion" || asset.estado === "cerrado";

  return (
    <Link to={`/npl/${asset.id}`} className="group block">
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300">
        {/* Top colored bar */}
        <div className={`h-1 ${isUnavailable ? "bg-muted-foreground" : "bg-gradient-to-r from-accent to-primary"}`} />

        <div className="p-5">
          {/* Badges row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" className="text-[10px]">
                {asset.tipo_activo || "Activo"}
              </Badge>
              {asset.cesion_remate && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Gavel className="w-3 h-3" /> CDR
                </Badge>
              )}
              {asset.cesion_credito && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <CreditCard className="w-3 h-3" /> CC
                </Badge>
              )}
              {isUnavailable && (
                <Badge variant="destructive" className="text-[10px]">
                  {asset.estado === "cerrado" ? "Cerrado" : "En gestión"}
                </Badge>
              )}
            </div>
            <button
              onClick={handleFavorite}
              disabled={toggling}
              className="p-1.5 rounded-full hover:bg-accent/10 transition-colors"
            >
              <Heart className={`w-4 h-4 transition-colors ${fav ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-accent"}`} />
            </button>
          </div>

          {/* Location */}
          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {asset.tipo_activo} — {asset.municipio || "Sin municipio"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4 line-clamp-1">
            <MapPin className="w-3 h-3 text-accent shrink-0" />
            {asset.direccion || `${asset.municipio || ""}, ${asset.provincia || ""}`}
          </p>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {asset.valor_mercado && asset.valor_mercado > 0 ? (
              <div className="bg-secondary rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground">Valor mercado</p>
                <p className="text-sm font-bold text-foreground">{asset.valor_mercado.toLocaleString("es-ES")} €</p>
              </div>
            ) : null}
            {asset.precio_orientativo && asset.precio_orientativo > 0 ? (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-2.5">
                <p className="text-[10px] text-accent">Precio orient.</p>
                <p className="text-sm font-bold text-accent">{asset.precio_orientativo.toLocaleString("es-ES")} €</p>
              </div>
            ) : null}
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              {asset.sqm > 0 && (
                <span className="flex items-center gap-1">
                  <Maximize className="w-3 h-3" /> {asset.sqm.toLocaleString("es-ES")} m²
                </span>
              )}
              {eurPerSqm && (
                <span>{eurPerSqm.toLocaleString("es-ES")} €/m²</span>
              )}
            </div>
            {discount && discount > 0 && (
              <span className="flex items-center gap-0.5 text-green-600 font-bold">
                <TrendingDown className="w-3 h-3" /> -{discount}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NplAssetCard;
