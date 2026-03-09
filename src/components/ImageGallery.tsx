import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Expand, MapPin, Building2, Map, ExternalLink, Loader2 } from "lucide-react";

export interface GalleryItem {
  id: string;
  src: string;
  embedSrc?: string;
  linkUrl?: string;
  caption: string;
  type: "uploaded" | "static" | "fachada" | "satellite" | "streetview" | "loading";
}

interface ImageGalleryProps {
  items: GalleryItem[];
  loading?: boolean;
  emptyMessage?: string;
}

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

const ThumbnailBadge = ({ type }: { type: GalleryItem["type"] }) => {
  if (type === "fachada") {
    return <span className="absolute bottom-0 left-0 right-0 bg-accent/80 text-[8px] text-accent-foreground text-center py-0.5">Catastro</span>;
  }
  if (type === "streetview") {
    return <span className="absolute bottom-0 left-0 right-0 bg-secondary/80 text-[8px] text-secondary-foreground text-center py-0.5">Street View</span>;
  }
  if (type === "satellite") {
    return <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-primary-foreground text-center py-0.5">Satélite</span>;
  }
  return null;
};

const ImageGallery = ({ items, loading = false, emptyMessage = "Sin imágenes disponibles" }: ImageGalleryProps) => {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (loading) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-2xl animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-muted rounded-2xl flex flex-col items-center justify-center gap-3">
        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : items.length - 1));
  const next = () => setCurrent((c) => (c < items.length - 1 ? c + 1 : 0));
  const currentItem = items[current];

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden group">
        {/* Main image or embed */}
        <div className="aspect-[16/9] bg-muted">
          {currentItem.type === "loading" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-secondary to-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground font-medium">{currentItem.caption}</p>
            </div>
          ) : currentItem.embedSrc ? (
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
              className={`w-full h-full object-cover ${currentItem.linkUrl ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (currentItem.linkUrl) window.open(currentItem.linkUrl, "_blank", "noopener");
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          )}
          {currentItem.linkUrl && (
            <a
              href={currentItem.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-14 right-3 bg-card/80 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
            >
              <ExternalLink className="w-3 h-3" /> Abrir en Google Maps
            </a>
          )}
        </div>

        <TypeBadge item={currentItem} />

        {/* Navigation arrows */}
        {items.length > 1 && (
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
            {current + 1} / {items.length}
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
      {items.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {items.map((item, i) => (
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
              <ThumbnailBadge type={item.type} />
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
          {items.length > 1 && (
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

export default ImageGallery;
