import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FolderOpen, Lock, File, FileSpreadsheet, FileImage, Filter } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  category: string;
  npl_asset_id: string | null;
  property_id: string | null;
  is_confidential: boolean;
  created_at: string;
}

interface DocumentsPanelProps {
  nplAssetId?: string;
  propertyId?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const categoryLabels: Record<string, { label: string; icon: typeof FileText }> = {
  general: { label: "General", icon: FileText },
  legal: { label: "Legal / Judicial", icon: File },
  financiero: { label: "Financiero", icon: FileSpreadsheet },
  tasacion: { label: "Tasación", icon: FileImage },
  registral: { label: "Registral", icon: FolderOpen },
  catastro: { label: "Catastro", icon: FileImage },
  fotos: { label: "Fotografías", icon: FileImage },
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return FileText;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("image")) return FileImage;
  return File;
};

const DocumentsPanel = ({ nplAssetId, propertyId, showFilters = true, compact = false }: DocumentsPanelProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    loadDocuments();
  }, [user, nplAssetId, propertyId]);

  const loadDocuments = async () => {
    let query = supabase.from("documents").select("*").order("category").order("created_at", { ascending: false });

    if (nplAssetId) {
      query = query.eq("npl_asset_id", nplAssetId);
    }
    if (propertyId) {
      query = query.eq("property_id", propertyId);
    }

    const { data } = await query;
    setDocuments((data as unknown as Document[]) || []);
    setLoading(false);
  };

  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const filteredDocs = activeCategory === "all" ? documents : documents.filter((d) => d.category === activeCategory);
  const categories = [...new Set(documents.map((d) => d.category))];

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Cargando documentación...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className={`${compact ? "py-8" : "py-12"} text-center`}>
          <FolderOpen className={`${compact ? "w-8 h-8" : "w-12 h-12"} mx-auto text-muted-foreground/30 mb-4`} />
          <p className="text-muted-foreground">No hay documentos disponibles.</p>
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Inicia sesión y firma el NDA para acceder a la documentación.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      {showFilters && categories.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeCategory === "all"
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({documents.length})
          </button>
          {categories.map((cat) => {
            const config = categoryLabels[cat] || { label: cat, icon: FileText };
            const count = documents.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Document list */}
      <div className={`grid gap-2 ${compact ? "" : "md:grid-cols-2"}`}>
        {filteredDocs.map((doc) => {
          const IconComp = getFileIcon(doc.mime_type);
          const catConfig = categoryLabels[doc.category] || { label: doc.category, icon: FileText };

          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-accent/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <IconComp className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{catConfig.label}</span>
                  <span>·</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  {doc.is_confidential && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-destructive">
                        <Lock className="w-3 h-3" /> Confidencial
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(doc)}
                className="shrink-0 opacity-60 group-hover:opacity-100"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsPanel;
