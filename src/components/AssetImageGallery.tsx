import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImageGallery, { type GalleryItem } from "@/components/ImageGallery";

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
  refCatastral?: string | null;
  direccion?: string | null;
  municipio?: string | null;
  provincia?: string | null;
}

const GOOGLE_MAPS_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

const AssetImageGallery = ({ assetId, refCatastral, direccion, municipio, provincia }: AssetImageGalleryProps) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

      // 2. Fetch catastro fachada via edge function
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

      // 3. Google Street View + Satellite
      const addressParts = [direccion, municipio, provincia].filter(Boolean);
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(", ");
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
        items.push({
          id: "google-streetview",
          src: `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_KEY}`,
          linkUrl: mapsUrl,
          caption: "Street View (Google Maps)",
          type: "streetview",
        });
        items.push({
          id: "google-satellite",
          src: "",
          embedSrc: `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(fullAddress)}&maptype=satellite&zoom=18`,
          caption: "Vista satélite (Google Maps)",
          type: "satellite",
        });
      }

      setGalleryItems(items);
      setLoading(false);
    };

    fetchAll();
  }, [assetId, refCatastral, direccion, municipio, provincia]);

  return <ImageGallery items={galleryItems} loading={loading} />;
};

export default AssetImageGallery;
