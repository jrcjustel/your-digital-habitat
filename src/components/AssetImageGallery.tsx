import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Expand } from "lucide-react";

interface AssetImage {
  id: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}

interface AssetImageGalleryProps {
  assetId: string;
}

const AssetImageGallery = ({ assetId }: AssetImageGalleryProps) => {
  const [images, setImages] = useState<AssetImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("asset_images")
        .select("*")
        .eq("asset_id", assetId)
        .order("sort_order", { ascending: true });
      setImages((data as unknown as AssetImage[]) || []);
      setLoading(false);
    };
    fetchImages();
  }, [assetId]);

  if (loading) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-2xl animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-muted rounded-2xl flex flex-col items-center justify-center gap-3">
        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Sin imágenes disponibles</p>
      </div>
    );
  }

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("asset-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden group">
        {/* Main image */}
        <div className="aspect-[16/9] bg-muted">
          <img
            src={getImageUrl(images[current].file_path)}
            alt={images[current].caption || images[current].file_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
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
            {current + 1} / {images.length}
          </span>
          <button
            onClick={() => setFullscreen(true)}
            className="bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <Expand className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Caption */}
        {images[current].caption && (
          <div className="absolute bottom-12 left-3 right-3">
            <p className="bg-card/80 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-lg">
              {images[current].caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={getImageUrl(img.file_path)}
                alt={img.file_name}
                className="w-full h-full object-cover"
              />
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
          <img
            src={getImageUrl(images[current].file_path)}
            alt={images[current].caption || images[current].file_name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
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
