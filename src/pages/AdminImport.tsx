import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportResult {
  inserted: number;
  errors: number;
  total: number;
}

const COLUMN_MAP: Record<string, string> = {
  "Municipio": "municipio",
  "Provincia": "provincia",
  "Tipo Activo": "tipo_activo",
  "Direccion": "direccion",
  "Ref Catastral": "ref_catastral",
  "Finca Registral": "finca_registral",
  "Registro Propiedad": "registro_propiedad",
  "Valor Activo": "valor_activo",
  "Deuda (OB)": "deuda_ob",
  "Servicer": "servicer",
  "Cartera": "cartera",
  "Publicado": "publicado",
  "NDG": "ndg",
  "Asset ID": "asset_id",
  "Name Debtor": "name_debtor",
  "Persona Fis/Jur": "persona_tipo",
  "Rango Deuda (Lien)": "rango_deuda",
  "Comunidad Autonoma": "comunidad_autonoma",
  "SQM": "sqm",
  "Estado Ocupacional": "estado_ocupacional",
  "Tipo Procedimiento": "tipo_procedimiento",
  "Estado Judicial": "estado_judicial",
  "Cesion Remate": "cesion_remate",
  "Cesion de Credito": "cesion_credito",
  "Importe Pre-Aprobado": "importe_preaprobado",
  "Oferta Aprobada": "oferta_aprobada",
  "Postura Subasta": "postura_subasta",
  "Propiedad Sin Posesion": "propiedad_sin_posesion",
  "Valor Mercado": "valor_mercado",
  "Precio Orientativo": "precio_orientativo",
  "Referencia": "referencia_interna",
  "Codigo Postal": "codigo_postal",
  "Fase Judicial": "fase_judicial",
  "Deposito (%)": "deposito_porcentaje",
  "Comision (%)": "comision_porcentaje",
  "Descripcion": "descripcion",
  "Año Construccion": "anio_construccion",
  "VPO": "vpo",
  "Judicializado": "judicializado",
  "Num Titulares": "num_titulares",
};

const AdminImport = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [clearExisting, setClearExisting] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const data = await f.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Map columns
    const mapped = jsonData.map((row: any) => {
      const mapped: any = {};
      for (const [excelCol, dbCol] of Object.entries(COLUMN_MAP)) {
        mapped[dbCol] = row[excelCol] !== undefined ? String(row[excelCol]) : "";
      }
      return mapped;
    }).filter((r: any) => r.provincia || r.municipio || r.direccion);

    setParsedRows(mapped);
    toast.success(`${mapped.length} filas detectadas en el archivo`);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    const CHUNK_SIZE = 2000;
    let totalInserted = 0;
    let totalErrors = 0;
    const chunks = Math.ceil(parsedRows.length / CHUNK_SIZE);

    for (let i = 0; i < chunks; i++) {
      const chunk = parsedRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      try {
        const { data, error } = await supabase.functions.invoke("import-npl", {
          body: { rows: chunk, clearExisting: i === 0 && clearExisting },
        });

        if (error) {
          console.error("Import chunk error:", error);
          totalErrors += chunk.length;
        } else if (data) {
          totalInserted += data.inserted || 0;
          totalErrors += data.errors || 0;
        }
      } catch (err) {
        console.error("Network error:", err);
        totalErrors += chunk.length;
      }

      setProgress(Math.round(((i + 1) / chunks) * 100));
    }

    setResult({ inserted: totalInserted, errors: totalErrors, total: parsedRows.length });
    setImporting(false);

    if (totalErrors === 0) {
      toast.success(`¡Importación completada! ${totalInserted} activos importados.`);
    } else {
      toast.warning(`Importación parcial: ${totalInserted} importados, ${totalErrors} errores.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Importar Activos NPL</h1>
        <p className="text-muted-foreground mb-8">Sube un archivo Excel (.xlsx) con los datos de activos NPL para importarlos a la base de datos.</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-accent" /> Archivo Excel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={importing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                {file ? (
                  <div>
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{parsedRows.length} filas detectadas</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-foreground">Haz clic para seleccionar archivo</p>
                    <p className="text-sm text-muted-foreground mt-1">Formatos: .xlsx, .xls</p>
                  </div>
                )}
              </label>
            </div>

            {parsedRows.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="clear-existing"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="clear-existing" className="text-sm text-foreground">
                    Limpiar datos existentes antes de importar
                  </label>
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Vista previa (primeras 5 filas):</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left p-1">Municipio</th>
                          <th className="text-left p-1">Provincia</th>
                          <th className="text-left p-1">Tipo</th>
                          <th className="text-left p-1">Dirección</th>
                          <th className="text-right p-1">Deuda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-1 text-foreground">{r.municipio || "—"}</td>
                            <td className="p-1 text-foreground">{r.provincia || "—"}</td>
                            <td className="p-1 text-foreground">{r.tipo_activo || "—"}</td>
                            <td className="p-1 text-foreground max-w-[200px] truncate">{r.direccion || "—"}</td>
                            <td className="p-1 text-foreground text-right">{r.deuda_ob || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {importing ? `Importando... ${progress}%` : `Importar ${parsedRows.length} activos`}
                </Button>

                {importing && <Progress value={progress} className="h-2" />}
              </div>
            )}

            {result && (
              <div className={`rounded-xl p-4 flex items-start gap-3 ${result.errors === 0 ? "bg-green-50" : "bg-yellow-50"}`}>
                {result.errors === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {result.errors === 0 ? "Importación completada" : "Importación con errores"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.inserted} activos importados de {result.total} totales.
                    {result.errors > 0 && ` ${result.errors} errores.`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AdminImport;
