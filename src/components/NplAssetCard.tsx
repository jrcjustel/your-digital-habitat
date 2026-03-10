import { Link } from "react-router-dom";
import { useState, memo } from "react";
import { Heart, MapPin, Maximize, TrendingDown, CreditCard, Gavel, Building2, Sparkles, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        await supabase.from("activity_log").insert({ user_id: userId, action: "favorite_added", entity_type: "npl_asset", entity_id: asset.id });
      }
    } catch { /* silent */ }
    setToggling(false);
  };

  const isUnavailable = asset.estado === "oferta_gestion" || asset.estado === "cerrado";

  // Priority & recency indicators
  const isRecent = asset.created_at ? (Date.now() - new Date(asset.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
  const isExpiring = asset.created_at ? (() => {
    const diff = (Date.now() - new Date(asset.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 30 && diff <= 37;
  })() : false;
  const showNew = isNew || isRecent;

  const borderClass = isUnavailable
    ? "border-l-4 border-l-muted-foreground"
    : priority
      ? "border-l-4 border-l-destructive"
      : isExpiring
        ? "border-l-4 border-l-blue-500"
        : showNew
          ? "border-l-4 border-l-accent"
          : "";

  return (
    <Link to={`/npl/${asset.id}`} className="group block">
      <div className={`bg-card rounded-2xl border overflow-hidden transition-all duration-300 ${borderClass} ${
        isUnavailable
          ? "border-border opacity-75 hover:opacity-90"
          : "border-border hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-1"
      }`}>
        {/* Top colored bar */}
        <div className={`h-1 ${isUnavailable ? "bg-muted-foreground" : priority ? "bg-gradient-to-r from-destructive to-destructive/60" : "bg-gradient-to-r from-accent to-primary"}`} />

        <div className="p-5">
          {/* Badges row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="default" className="text-[10px]">
                      {asset.tipo_activo || "Activo"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Tipo de inmueble</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {asset.cesion_remate && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Gavel className="w-3 h-3" /> CDR
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-[200px]">Cesión de remate: adquiere la posición del adjudicatario en subasta</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {asset.cesion_credito && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <CreditCard className="w-3 h-3" /> CC
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-[200px]">Cesión de crédito: compra del préstamo hipotecario</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {showNew && !isUnavailable && (
                <Badge className="text-[10px] gap-0.5 bg-accent/15 text-accent border-accent/30 hover:bg-accent/20">
                  <Sparkles className="w-3 h-3" /> Nuevo
                </Badge>
              )}
              {priority && !isUnavailable && (
                <Badge className="text-[10px] gap-0.5 bg-destructive/15 text-destructive border-destructive/30">
                  Alta
                </Badge>
              )}
              {isExpiring && !isUnavailable && (
                <Badge className="text-[10px] gap-0.5 bg-blue-500/15 text-blue-600 border-blue-500/30">
                  <Clock className="w-3 h-3" /> Vence
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
              className="p-1.5 rounded-full hover:bg-accent/10 transition-all hover:scale-110"
            >
              <Heart className={`w-4 h-4 transition-all ${fav ? "fill-destructive text-destructive scale-110" : "text-muted-foreground group-hover:text-accent"}`} />
            </button>
          </div>

          {/* Location */}
          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-accent transition-colors">
            {asset.tipo_activo} — {asset.municipio || "Sin municipio"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4 line-clamp-1">
            <MapPin className="w-3 h-3 text-accent shrink-0" />
            {asset.direccion || `${asset.municipio || ""}, ${asset.provincia || ""}`}
          </p>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {asset.valor_mercado && asset.valor_mercado > 0 ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-secondary rounded-lg p-2.5 cursor-help transition-colors hover:bg-secondary/80">
                      <p className="text-[10px] text-muted-foreground">Valor mercado</p>
                      <p className="text-sm font-bold text-foreground">{asset.valor_mercado.toLocaleString("es-ES")} €</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Valor de mercado estimado del inmueble</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {asset.precio_orientativo && asset.precio_orientativo > 0 ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-2.5 cursor-help transition-colors hover:bg-accent/15">
                      <p className="text-[10px] text-accent">Precio orient.</p>
                      <p className="text-sm font-bold text-accent">{asset.precio_orientativo.toLocaleString("es-ES")} €</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[220px]">Precio orientativo recomendado para la operación (sujeto a aprobación)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5 text-green-600 font-bold cursor-help">
                      <TrendingDown className="w-3 h-3" /> -{discount}%
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
