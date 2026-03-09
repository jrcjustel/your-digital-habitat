import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Expand, MapPin, Building2, Map, ExternalLink } from "lucide-react";

interface AssetImage {
  id: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}

interface GalleryItem {
  id: string;
  src: string;
  embedSrc?: string;
  linkUrl?: string;
  caption: string;
  type: "uploaded" | "fachada" | "satellite" | "streetview";
}

interface AssetImageGalleryProps {
  assetId: string;
  refCatastral?: string | null;
  direccion?: string | null;
  municipio?: string | null;
  provincia?: string | null;
}

const AssetImageGallery = ({ assetId, refCatastral, direccion, municipio, provincia }: AssetImageGalleryProps) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const items: GalleryItem[] = [];

      // 1. Fetch uploaded images from storage
      const { data: dbImages } = await supabase
        .from("asset_images")
        .select("*")
        .eq("asset_id", assetId)
        .order("sort_order", { ascending: true });

      if (dbImages && dbImages.length > 0) {
        for (const img of dbImages as unknown as AssetImage[]) {
          const { data: urlData } = supabase.storage.from("asset-images").getPublicUrl(img.file_path);
          items.push({
            id: img.id,
            src: urlData.publicUrl,
            caption: img.caption || img.file_name,
            type: "uploaded",
          });
        }
      }

      // 2. Fetch catastro fachada via edge function (server-side proxy)
      if (refCatastral && refCatastral.length >= 14) {
        try {
          const { data: catastroResult } = await supabase.functions.invoke("catastro-lookup", {
            body: { ref_catastral: refCatastral },
          });

          if (catastroResult?.success && catastroResult.data?.fachada_base64) {
            items.push({
              id: "catastro-fachada",
              src: catastroResult.data.fachada_base64,
              caption: "Fachada (Catastro)",
              type: "fachada",
            });
          }
        } catch (e) {
          console.error("Error fetching catastro fachada:", e);
        }
      }

      // 3. Add Google Street View
      const addressParts = [direccion, municipio, provincia].filter(Boolean);
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(", ");
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${encodeURIComponent(fullAddress)}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
        items.push({
          id: "google-streetview",
          src: streetViewUrl,
          caption: "Street View (Google Maps)",
          type: "streetview",
        });

        // 4. Add Google Maps satellite embed
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullAddress)}&maptype=satellite&zoom=18`;
        items.push({
          id: "google-satellite",
          src: "",
          embedSrc: embedUrl,
          caption: "Vista satélite (Google Maps)",
          type: "satellite",
        });
      }

      setGalleryItems(items);
      setLoading(false);
    };

    fetchAll();
  }, [assetId, refCatastral, direccion, municipio, provincia]);

  if (loading) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-2xl animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-muted rounded-2xl flex flex-col items-center justify-center gap-3">
        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Sin imagenes disponibles</p>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : galleryItems.length - 1));
  const next = () => setCurrent((c) => (c < galleryItems.length - 1 ? c + 1 : 0));

  const currentItem = galleryItems[current];

  const TypeBadge = ({ item }: { item: GalleryItem }) => {
    if (item.type === "fachada") {
      return (
        <span className="absolute top-3 left-3 bg-accent/90 text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <Building2 className="w-3 h-3" /> Catastro
        </span>
      );
    }
    if (item.type === "streetview") {
      return (
        <span className="absolute top-3 left-3 bg-secondary/90 text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Street View
        </span>
      );
    }
    if (item.type === "satellite") {
      return (
        <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <Map className="w-3 h-3" /> Satélite
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden group">
        {/* Main image or embed */}
        <div className="aspect-[16/9] bg-muted">
          {currentItem.embedSrc ? (
            <iframe
              src={currentItem.embedSrc}
              title={currentItem.caption}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <img
              src={currentItem.src}
              alt={currentItem.caption}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          )}
        </div>

        {/* Type badge */}
        <TypeBadge item={currentItem} />

        {/* Navigation arrows */}
        {galleryItems.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Counter + fullscreen */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-card/80 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            {current + 1} / {galleryItems.length}
          </span>
          <button
            onClick={() => setFullscreen(true)}
            className="bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <Expand className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Caption */}
        {currentItem.caption && (
          <div className="absolute bottom-12 left-3 right-3">
            <p className="bg-card/80 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-lg">
              {currentItem.caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {galleryItems.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {galleryItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {item.embedSrc ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Map className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <img
                  src={item.src}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              {item.type === "fachada" && (
                <span className="absolute bottom-0 left-0 right-0 bg-accent/80 text-[8px] text-accent-foreground text-center py-0.5">Catastro</span>
              )}
              {item.type === "streetview" && (
                <span className="absolute bottom-0 left-0 right-0 bg-secondary/80 text-[8px] text-secondary-foreground text-center py-0.5">Street View</span>
              )}
              {item.type === "satellite" && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-primary-foreground text-center py-0.5">Satélite</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-foreground bg-card/80 p-2 rounded-full z-10"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
          {currentItem.embedSrc ? (
            <iframe
              src={currentItem.embedSrc}
              title={currentItem.caption}
              className="w-[90vw] h-[80vh] border-0 rounded-lg"
              loading="lazy"
              allowFullScreen
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={currentItem.src}
              alt={currentItem.caption}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 p-3 rounded-full"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 p-3 rounded-full"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AssetImageGallery;
