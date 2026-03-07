import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import {
  FileText, Download, FolderOpen, Lock, File, FileSpreadsheet, FileImage,
  Filter, Upload, Loader2, Trash2, X,
} from "lucide-react";

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
  uploaded_by: string | null;
}

interface DocumentsPanelProps {
  nplAssetId?: string;
  propertyId?: string;
  showFilters?: boolean;
  compact?: boolean;
  allowUpload?: boolean;
}

const categoryLabels: Record<string, { label: string; icon: typeof FileText }> = {
  general: { label: "General", icon: FileText },
  legal: { label: "Legal / Judicial", icon: File },
  financiero: { label: "Financiero", icon: FileSpreadsheet },
  tasacion: { label: "Tasación", icon: FileImage },
  registral: { label: "Registral", icon: FolderOpen },
  catastro: { label: "Catastro", icon: FileImage },
  fotos: { label: "Fotografías", icon: FileImage },
  cliente: { label: "Documentación cliente", icon: FileText },
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

const DocumentsPanel = ({ nplAssetId, propertyId, showFilters = true, compact = false, allowUpload = false }: DocumentsPanelProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("cliente");
  const [uploadDescription, setUploadDescription] = useState("");

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

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim() || !user) return;

    setUploading(true);
    try {
      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}-${uploadFile.name}`;

      // Upload to storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, uploadFile);

      if (storageError) {
        toast.error("Error al subir el archivo: " + storageError.message);
        setUploading(false);
        return;
      }

      // Insert record
      const { error: dbError } = await supabase.from("documents").insert({
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || null,
        file_path: filePath,
        file_name: uploadFile.name,
        file_size: uploadFile.size,
        mime_type: uploadFile.type || null,
        category: uploadCategory,
        is_confidential: true,
        uploaded_by: user.id,
        npl_asset_id: nplAssetId || null,
        property_id: propertyId || null,
      });

      if (dbError) {
        toast.error("Error al registrar el documento: " + dbError.message);
        setUploading(false);
        return;
      }

      toast.success("Documento subido correctamente");
      setShowUploadForm(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("cliente");
      loadDocuments();
    } catch (err) {
      toast.error("Error inesperado al subir el documento");
    }
    setUploading(false);
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!user || doc.uploaded_by !== user.id) return;

    const { error: storageError } = await supabase.storage.from("documents").remove([doc.file_path]);
    const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);

    if (dbError) {
      toast.error("Error al eliminar el documento");
    } else {
      toast.success("Documento eliminado");
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
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

  return (
    <div className="space-y-4">
      {/* Upload button */}
      {allowUpload && user && !showUploadForm && (
        <Button onClick={() => setShowUploadForm(true)} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Subir documento
        </Button>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <Card className="border-accent/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Subir nuevo documento</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Título del documento *</Label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: DNI, Escrituras, Justificante de fondos..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Categoría</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Documentación cliente</SelectItem>
                    <SelectItem value="legal">Legal / Judicial</SelectItem>
                    <SelectItem value="financiero">Financiero</SelectItem>
                    <SelectItem value="registral">Registral</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descripción (opcional)</Label>
                <Input
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Breve descripción del documento..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Archivo *</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="doc-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    {uploadFile ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">Haz clic para seleccionar archivo</p>
                        <p className="text-xs text-muted-foreground">PDF, Word, Excel, Imágenes (máx. 20 MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle.trim() || uploading}
                className="w-full gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : "Subir documento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && !showUploadForm ? (
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
            {allowUpload && user && (
              <Button className="mt-4 gap-2" onClick={() => setShowUploadForm(true)}>
                <Upload className="w-4 h-4" />
                Subir tu primer documento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
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
              const isOwner = user && doc.uploaded_by === user.id;

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
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc)}
                      className="opacity-60 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc)}
                        className="opacity-60 group-hover:opacity-100 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsPanel;
