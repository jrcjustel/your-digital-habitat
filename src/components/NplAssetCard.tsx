import { Link } from "react-router-dom";
import { useState, memo } from "react";
import { Heart, MapPin, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    created_at?: string;
  };
  isFavorited?: boolean;
  userId?: string;
  onFavoriteToggle?: (assetId: string, favorited: boolean) => void;
  isNew?: boolean;
  priority?: boolean;
}

const NplAssetCard = memo(({ asset, isFavorited = false, userId, onFavoriteToggle, isNew = false, priority = false }: NplAssetCardProps) => {
  const [fav, setFav] = useState(isFavorited);
  const [toggling, setToggling] = useState(false);

  const discount = asset.valor_mercado && asset.precio_orientativo && asset.valor_mercado > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
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
        await supabase.from("activity_log").insert({ user_id: userId, action: "favorite_added", entity_type: "npl_asset", entity_id: asset.id });
      }
    } catch { /* silent */ }
    setToggling(false);
  };

  const isUnavailable = asset.estado === "oferta_gestion" || asset.estado === "cerrado";
  const isRecent = asset.created_at ? (Date.now() - new Date(asset.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
  const showNew = isNew || isRecent;

  // Sale type label
  const saleLabel = asset.cesion_remate ? "CDR" : asset.cesion_credito ? "NPL" : "REO";

  return (
    <Link to={`/npl/${asset.id}`} className="group block">
      <div className={`bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 ${
        isUnavailable
          ? "opacity-60 hover:opacity-80"
          : "hover:shadow-lg hover:border-accent/20 hover:-translate-y-0.5"
      }`}>
        {/* Minimal top accent */}
        <div className={`h-0.5 ${isUnavailable ? "bg-muted-foreground/30" : "bg-accent"}`} />

        <div className="p-4">
          {/* Row 1: Type tags + fav */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded">
                {asset.tipo_activo || "Activo"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                saleLabel === "CDR" ? "bg-accent/15 text-accent" : saleLabel === "NPL" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
              }`}>
                {saleLabel}
              </span>
              {showNew && !isUnavailable && (
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  Nuevo
                </span>
              )}
              {isUnavailable && (
                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                  {asset.estado === "cerrado" ? "Cerrado" : "En gestión"}
                </span>
              )}
            </div>
            <button
              onClick={handleFavorite}
              disabled={toggling}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${fav ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-accent"}`} />
            </button>
          </div>

          {/* Row 2: Title & location */}
          <p className="text-sm font-bold text-foreground mb-1 line-clamp-1 group-hover:text-accent transition-colors tracking-tight">
            {asset.municipio || "Sin municipio"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4 line-clamp-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {asset.direccion || `${asset.provincia || ""}`}
          </p>

          {/* Row 3: Price block */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {asset.precio_orientativo && asset.precio_orientativo > 0 ? (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Precio</p>
                <p className="text-sm font-extrabold text-foreground tracking-tight">
                  {asset.precio_orientativo.toLocaleString("es-ES")} €
                </p>
              </div>
            ) : (
              <div className="bg-secondary rounded-lg p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Precio</p>
                <p className="text-sm font-bold text-muted-foreground">Consultar</p>
              </div>
            )}
            {asset.valor_mercado && asset.valor_mercado > 0 ? (
              <div className="bg-secondary rounded-lg p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Mercado</p>
                <p className="text-sm font-bold text-muted-foreground">
                  {asset.valor_mercado.toLocaleString("es-ES")} €
                </p>
              </div>
            ) : null}
          </div>

          {/* Row 4: Bottom metrics */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              {asset.sqm > 0 && (
                <span>{asset.sqm.toLocaleString("es-ES")} m²</span>
              )}
              {asset.sqm > 0 && asset.valor_mercado && asset.valor_mercado > 0 && (
                <span>{Math.round(asset.valor_mercado / asset.sqm).toLocaleString("es-ES")} €/m²</span>
              )}
            </div>
            {discount && discount > 0 && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5 font-bold text-accent cursor-help">
                      <TrendingDown className="w-3 h-3" /> −{discount}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Descuento sobre valor de mercado</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

NplAssetCard.displayName = "NplAssetCard";

export default NplAssetCard;
