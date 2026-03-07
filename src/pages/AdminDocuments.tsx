import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import {
  Upload, FileText, Trash2, Loader2, FolderOpen, Search, Download,
  File, FileSpreadsheet, FileImage, Lock, Building2
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
}

interface NplAssetOption {
  id: string;
  label: string;
}

const categories = [
  { value: "general", label: "General" },
  { value: "legal", label: "Legal / Judicial" },
  { value: "financiero", label: "Financiero" },
  { value: "tasacion", label: "Tasación" },
  { value: "registral", label: "Registral" },
  { value: "catastro", label: "Catastro" },
  { value: "fotos", label: "Fotografías" },
];

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

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [nplAssets, setNplAssets] = useState<NplAssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload form
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [nplAssetId, setNplAssetId] = useState<string>("none");
  const [isConfidential, setIsConfidential] = useState(true);
  const [searchAsset, setSearchAsset] = useState("");

  const loadData = useCallback(async () => {
    const [docsRes, assetsRes] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("npl_assets").select("id, asset_id, municipio, provincia, tipo_activo").limit(500),
    ]);

    setDocuments((docsRes.data as unknown as Document[]) || []);
    setNplAssets(
      (assetsRes.data || []).map((a: any) => ({
        id: a.id,
        label: `${a.asset_id || a.id.slice(0, 8)} — ${a.tipo_activo || "Activo"} · ${a.municipio || ""}, ${a.provincia || ""}`,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);

    try {
      // 1. Upload file to storage
      const ext = file.name.split(".").pop();
      const filePath = `${category}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      // 2. Insert document record
      const { error: insertError } = await supabase.from("documents").insert({
        title,
        description: description || null,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        category,
        npl_asset_id: nplAssetId !== "none" ? nplAssetId : null,
        is_confidential: isConfidential,
      } as any);

      if (insertError) throw insertError;

      toast.success("Documento subido correctamente");

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("general");
      setNplAssetId("none");
      setIsConfidential(true);

      // Reset file input
      const input = document.getElementById("doc-file-upload") as HTMLInputElement;
      if (input) input.value = "";

      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al subir: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`¿Eliminar "${doc.title}"?`)) return;

    // Delete from storage
    await supabase.storage.from("documents").remove([doc.file_path]);
    // Delete record
    await supabase.from("documents").delete().eq("id", doc.id);

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Documento eliminado");
  };

  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const filteredAssets = searchAsset
    ? nplAssets.filter((a) => a.label.toLowerCase().includes(searchAsset.toLowerCase()))
    : nplAssets.slice(0, 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de documentos</h1>
            <p className="text-muted-foreground">Sube y gestiona documentos vinculados a activos.</p>
          </div>
          <span className="text-sm text-muted-foreground">{documents.length} documentos</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5 text-accent" /> Subir documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  {/* File */}
                  <div className="space-y-2">
                    <Label>Archivo</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                      <input
                        type="file"
                        id="doc-file-upload"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFile(f);
                            if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
                          }
                        }}
                        disabled={uploading}
                      />
                      <label htmlFor="doc-file-upload" className="cursor-pointer">
                        {file ? (
                          <div>
                            <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Seleccionar archivo</p>
                            <p className="text-xs text-muted-foreground">PDF, Excel, imágenes (máx. 50MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="doc-title">Título</Label>
                    <Input
                      id="doc-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Nota simple finca 12345"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="doc-desc">Descripción (opcional)</Label>
                    <Input
                      id="doc-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Breve descripción del documento"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Asset link */}
                  <div className="space-y-2">
                    <Label>Vincular a activo NPL (opcional)</Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar activo..."
                          value={searchAsset}
                          onChange={(e) => setSearchAsset(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={nplAssetId} onValueChange={setNplAssetId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin vincular" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin vincular (global)</SelectItem>
                          {filteredAssets.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <span className="truncate block max-w-[250px]">{a.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Confidential */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidential" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Confidencial (requiere NDA)
                    </Label>
                    <Switch
                      id="confidential"
                      checked={isConfidential}
                      onCheckedChange={setIsConfidential}
                    />
                  </div>

                  <Button type="submit" disabled={!file || !title || uploading} className="w-full gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Subiendo..." : "Subir documento"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Documents list */}
          <div className="lg:col-span-2">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No hay documentos todavía.</p>
                  <p className="text-sm text-muted-foreground mt-1">Sube el primer documento usando el formulario.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const IconComp = getFileIcon(doc.mime_type);
                  const catLabel = categories.find((c) => c.value === doc.category)?.label || doc.category;
                  const linkedAsset = nplAssets.find((a) => a.id === doc.npl_asset_id);

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="bg-secondary px-2 py-0.5 rounded-full">{catLabel}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString("es-ES")}</span>
                          {doc.is_confidential && (
                            <span className="flex items-center gap-0.5 text-destructive">
                              <Lock className="w-3 h-3" /> NDA
                            </span>
                          )}
                        </div>
                        {linkedAsset && (
                          <p className="text-xs text-accent mt-1 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 shrink-0" /> {linkedAsset.label}
                          </p>
                        )}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc)}
                          className="opacity-60 group-hover:opacity-100 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDocuments;
