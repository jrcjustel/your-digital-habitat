import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Columns, Wand2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportResult {
  inserted: number;
  errors: number;
  total: number;
}

// All DB fields the user can map to
const DB_FIELDS: { value: string; label: string; group: string }[] = [
  // Ubicación
  { value: "comunidad_autonoma", label: "Comunidad Autónoma", group: "Ubicación" },
  { value: "provincia", label: "Provincia", group: "Ubicación" },
  { value: "municipio", label: "Municipio", group: "Ubicación" },
  { value: "direccion", label: "Dirección", group: "Ubicación" },
  { value: "codigo_postal", label: "Código Postal", group: "Ubicación" },
  // Identificación
  { value: "asset_id", label: "Asset ID", group: "Identificación" },
  { value: "ndg", label: "NDG", group: "Identificación" },
  { value: "ref_catastral", label: "Ref. Catastral", group: "Identificación" },
  { value: "finca_registral", label: "Finca Registral", group: "Identificación" },
  { value: "registro_propiedad", label: "Registro Propiedad", group: "Identificación" },
  { value: "referencia_interna", label: "Referencia interna", group: "Identificación" },
  // Activo
  { value: "tipo_activo", label: "Tipo de Activo", group: "Activo" },
  { value: "sqm", label: "Superficie (m²)", group: "Activo" },
  { value: "anio_construccion", label: "Año Construcción", group: "Activo" },
  { value: "descripcion", label: "Descripción", group: "Activo" },
  { value: "vpo", label: "VPO", group: "Activo" },
  // Económico
  { value: "valor_activo", label: "Valor Activo", group: "Económico" },
  { value: "valor_mercado", label: "Valor Mercado", group: "Económico" },
  { value: "precio_orientativo", label: "Precio Orientativo", group: "Económico" },
  { value: "deuda_ob", label: "Deuda (OB)", group: "Económico" },
  { value: "importe_preaprobado", label: "Importe Pre-Aprobado", group: "Económico" },
  { value: "deposito_porcentaje", label: "Depósito (%)", group: "Económico" },
  { value: "comision_porcentaje", label: "Comisión (%)", group: "Económico" },
  // Judicial / Estado
  { value: "estado_ocupacional", label: "Estado Ocupacional", group: "Estado" },
  { value: "tipo_procedimiento", label: "Tipo Procedimiento", group: "Estado" },
  { value: "estado_judicial", label: "Estado Judicial", group: "Estado" },
  { value: "fase_judicial", label: "Fase Judicial", group: "Estado" },
  { value: "judicializado", label: "Judicializado", group: "Estado" },
  // Operación
  { value: "cesion_remate", label: "Cesión de Remate", group: "Operación" },
  { value: "cesion_credito", label: "Cesión de Crédito", group: "Operación" },
  { value: "postura_subasta", label: "Postura en Subasta", group: "Operación" },
  { value: "propiedad_sin_posesion", label: "Propiedad sin posesión", group: "Operación" },
  { value: "oferta_aprobada", label: "Oferta Aprobada", group: "Operación" },
  { value: "publicado", label: "Publicado", group: "Operación" },
  // Deudor / Cartera
  { value: "name_debtor", label: "Nombre Deudor", group: "Deudor" },
  { value: "persona_tipo", label: "Persona Fís/Jur", group: "Deudor" },
  { value: "rango_deuda", label: "Rango Deuda", group: "Deudor" },
  { value: "num_titulares", label: "Nº Titulares", group: "Deudor" },
  { value: "servicer", label: "Servicer", group: "Cartera" },
  { value: "cartera", label: "Cartera", group: "Cartera" },
];

// Known aliases for auto-detection (lowercase → db field)
const ALIASES: Record<string, string> = {
  "municipio": "municipio", "municipality": "municipio", "ciudad": "municipio", "localidad": "municipio",
  "provincia": "provincia", "province": "provincia",
  "tipo activo": "tipo_activo", "tipo_activo": "tipo_activo", "tipologia": "tipo_activo", "asset type": "tipo_activo", "tipo de activo": "tipo_activo", "tipología": "tipo_activo",
  "direccion": "direccion", "dirección": "direccion", "address": "direccion", "domicilio": "direccion",
  "ref catastral": "ref_catastral", "ref. catastral": "ref_catastral", "referencia catastral": "ref_catastral", "catastro": "ref_catastral",
  "finca registral": "finca_registral", "finca": "finca_registral",
  "registro propiedad": "registro_propiedad", "registro": "registro_propiedad",
  "valor activo": "valor_activo", "valor del activo": "valor_activo",
  "deuda (ob)": "deuda_ob", "deuda ob": "deuda_ob", "deuda": "deuda_ob", "outstanding balance": "deuda_ob", "ob": "deuda_ob",
  "servicer": "servicer", "gestor": "servicer",
  "cartera": "cartera", "portfolio": "cartera",
  "publicado": "publicado", "published": "publicado",
  "ndg": "ndg",
  "asset id": "asset_id", "asset_id": "asset_id", "id activo": "asset_id", "referencia activo": "asset_id",
  "name debtor": "name_debtor", "nombre deudor": "name_debtor", "deudor": "name_debtor", "debtor": "name_debtor",
  "persona fis/jur": "persona_tipo", "persona tipo": "persona_tipo", "tipo persona": "persona_tipo",
  "rango deuda (lien)": "rango_deuda", "rango deuda": "rango_deuda", "lien": "rango_deuda",
  "comunidad autonoma": "comunidad_autonoma", "comunidad autónoma": "comunidad_autonoma", "ccaa": "comunidad_autonoma", "c.a.": "comunidad_autonoma",
  "sqm": "sqm", "m2": "sqm", "superficie": "sqm", "metros": "sqm", "superficie m2": "sqm", "superficie (m2)": "sqm", "metros cuadrados": "sqm",
  "estado ocupacional": "estado_ocupacional", "ocupacion": "estado_ocupacional", "ocupación": "estado_ocupacional",
  "tipo procedimiento": "tipo_procedimiento", "procedimiento": "tipo_procedimiento",
  "estado judicial": "estado_judicial",
  "cesion remate": "cesion_remate", "cesión remate": "cesion_remate", "cesión de remate": "cesion_remate",
  "cesion de credito": "cesion_credito", "cesión de crédito": "cesion_credito", "cesion credito": "cesion_credito",
  "importe pre-aprobado": "importe_preaprobado", "importe preaprobado": "importe_preaprobado", "pre-aprobado": "importe_preaprobado",
  "oferta aprobada": "oferta_aprobada",
  "postura subasta": "postura_subasta", "postura en subasta": "postura_subasta",
  "propiedad sin posesion": "propiedad_sin_posesion", "propiedad sin posesión": "propiedad_sin_posesion", "sin posesión": "propiedad_sin_posesion",
  "valor mercado": "valor_mercado", "valor de mercado": "valor_mercado", "market value": "valor_mercado",
  "precio orientativo": "precio_orientativo", "precio": "precio_orientativo", "asking price": "precio_orientativo",
  "referencia": "referencia_interna", "ref. fencia": "referencia_interna", "referencia fencia": "referencia_interna",
  "codigo postal": "codigo_postal", "código postal": "codigo_postal", "cp": "codigo_postal", "zip": "codigo_postal",
  "fase judicial": "fase_judicial", "fase": "fase_judicial",
  "deposito (%)": "deposito_porcentaje", "depósito": "deposito_porcentaje", "deposito": "deposito_porcentaje", "deposit": "deposito_porcentaje",
  "comision (%)": "comision_porcentaje", "comisión": "comision_porcentaje", "comision": "comision_porcentaje", "commission": "comision_porcentaje",
  "descripcion": "descripcion", "descripción": "descripcion", "description": "descripcion",
  "año construccion": "anio_construccion", "año construcción": "anio_construccion", "anio construccion": "anio_construccion", "año": "anio_construccion", "year built": "anio_construccion",
  "vpo": "vpo",
  "judicializado": "judicializado",
  "num titulares": "num_titulares", "nº titulares": "num_titulares", "titulares": "num_titulares",
};

function autoDetectMapping(excelColumns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedDbFields = new Set<string>();

  for (const col of excelColumns) {
    const normalized = col.toLowerCase().trim().replace(/_/g, " ");
    const match = ALIASES[normalized];
    if (match && !usedDbFields.has(match)) {
      mapping[col] = match;
      usedDbFields.add(match);
    }
  }
  return mapping;
}

const AdminImport = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"upload" | "map" | "import">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [clearExisting, setClearExisting] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!user) {
    navigate("/auth");
    return null;
  }

  const mappedCount = Object.values(columnMapping).filter(Boolean).length;
  const totalDbFields = DB_FIELDS.length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const data = await f.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (jsonData.length === 0) {
      toast.error("El archivo está vacío");
      return;
    }

    const columns = Object.keys(jsonData[0] as object);
    setExcelColumns(columns);
    setRawRows(jsonData as any[]);

    // Auto-detect mapping
    const detected = autoDetectMapping(columns);
    setColumnMapping(detected);

    const detectedCount = Object.keys(detected).length;
    toast.success(`${jsonData.length} filas · ${columns.length} columnas · ${detectedCount} mapeadas automáticamente`);
    setStep("map");
  };

  const updateMapping = (excelCol: string, dbField: string) => {
    setColumnMapping((prev) => {
      const updated = { ...prev };
      if (dbField === "__none__") {
        delete updated[excelCol];
      } else {
        // Remove any other column mapped to this field
        for (const key of Object.keys(updated)) {
          if (updated[key] === dbField && key !== excelCol) {
            delete updated[key];
          }
        }
        updated[excelCol] = dbField;
      }
      return updated;
    });
  };

  const applyMapping = (): any[] => {
    return rawRows.map((row) => {
      const mapped: any = {};
      for (const [excelCol, dbField] of Object.entries(columnMapping)) {
        if (dbField) {
          mapped[dbField] = row[excelCol] !== undefined ? String(row[excelCol]) : "";
        }
      }
      return mapped;
    }).filter((r) => r.provincia || r.municipio || r.direccion || r.asset_id);
  };

  const handleProceedToImport = () => {
    const mapped = applyMapping();
    if (mapped.length === 0) {
      toast.error("No se detectaron filas válidas con el mapeo actual. Asegúrate de mapear al menos Provincia, Municipio o Dirección.");
      return;
    }
    toast.success(`${mapped.length} filas listas para importar`);
    setStep("import");
  };

  const handleImport = async () => {
    const parsedRows = applyMapping();
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

  // Group DB fields for the select
  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof DB_FIELDS> = {};
    for (const f of DB_FIELDS) {
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(f);
    }
    return groups;
  }, []);

  const usedDbFields = new Set(Object.values(columnMapping));

  // Get sample values for a column
  const getSampleValues = (col: string): string => {
    const samples = rawRows.slice(0, 3).map((r) => String(r[col] || "")).filter(Boolean);
    return samples.join(" · ") || "—";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Importar Activos NPL</h1>
        <p className="text-muted-foreground mb-6">Sube un archivo Excel de cualquier servicer o fondo. Mapea las columnas a los campos de la base de datos.</p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-sm mb-8">
          {[
            { key: "upload", label: "Subir archivo" },
            { key: "map", label: "Mapear columnas" },
            { key: "import", label: "Importar" },
          ].map((s, i) => {
            const steps = ["upload", "map", "import"];
            const isActive = steps.indexOf(step) >= i;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`hidden sm:inline ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                {i < 2 && <div className={`w-8 h-0.5 ${isActive ? "bg-accent" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-accent" /> Archivo Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="font-semibold text-foreground text-lg">Haz clic para seleccionar archivo</p>
                  <p className="text-sm text-muted-foreground mt-2">Compatible con cualquier formato de servicer o fondo</p>
                  <p className="text-xs text-muted-foreground mt-1">Formatos: .xlsx, .xls</p>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Column Mapping */}
        {step === "map" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Columns className="w-5 h-5 text-accent" /> Mapeo de columnas
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {mappedCount} de {excelColumns.length} columnas mapeadas
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      {file?.name}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Asigna cada columna del Excel al campo correspondiente de la base de datos. Las columnas reconocidas se mapean automáticamente.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {excelColumns.map((col) => {
                    const currentMapping = columnMapping[col] || "";
                    const isMapped = !!currentMapping;
                    const fieldLabel = isMapped ? DB_FIELDS.find((f) => f.value === currentMapping)?.label : "";

                    return (
                      <div
                        key={col}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isMapped ? "border-accent/30 bg-accent/5" : "border-border bg-card"
                        }`}
                      >
                        {/* Excel column info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{col}</span>
                            {isMapped && <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {getSampleValues(col)}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

                        {/* DB field selector */}
                        <div className="w-56 shrink-0">
                          <Select
                            value={currentMapping || "__none__"}
                            onValueChange={(v) => updateMapping(col, v)}
                          >
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="Sin mapear" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— Sin mapear —</SelectItem>
                              {Object.entries(groupedFields).map(([group, fields]) => (
                                <div key={group}>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group}</div>
                                  {fields.map((f) => (
                                    <SelectItem
                                      key={f.value}
                                      value={f.value}
                                      disabled={usedDbFields.has(f.value) && columnMapping[col] !== f.value}
                                    >
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setStep("upload")} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Otro archivo
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setColumnMapping(autoDetectMapping(excelColumns));
                        toast.success("Mapeo auto-detectado aplicado");
                      }}
                      className="gap-2"
                    >
                      <Wand2 className="w-4 h-4" /> Auto-detectar
                    </Button>
                    <Button onClick={handleProceedToImport} disabled={mappedCount === 0} className="gap-2">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Import */}
        {step === "import" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-accent" /> Confirmar importación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Archivo:</span>
                  <span className="font-medium text-foreground">{file?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filas válidas:</span>
                  <span className="font-medium text-foreground">{applyMapping().length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Columnas mapeadas:</span>
                  <span className="font-medium text-foreground">{mappedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campos mapeados:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-md">
                    {Object.values(columnMapping).filter(Boolean).map((f) => {
                      const field = DB_FIELDS.find((d) => d.value === f);
                      return <Badge key={f} variant="outline" className="text-xs">{field?.label || f}</Badge>;
                    })}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-sm font-medium text-foreground mb-2">Vista previa (primeras 5 filas):</p>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="text-muted-foreground">
                        {Object.values(columnMapping).filter(Boolean).slice(0, 6).map((f) => {
                          const field = DB_FIELDS.find((d) => d.value === f);
                          return <th key={f} className="text-left p-1">{field?.label || f}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {applyMapping().slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          {Object.values(columnMapping).filter(Boolean).slice(0, 6).map((f) => (
                            <td key={f} className="p-1 text-foreground max-w-[180px] truncate">{r[f] || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep("map")} className="gap-2" disabled={importing}>
                  <ArrowLeft className="w-4 h-4" /> Volver al mapeo
                </Button>
                <Button onClick={handleImport} disabled={importing} className="gap-2">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {importing ? `Importando... ${progress}%` : `Importar ${applyMapping().length} activos`}
                </Button>
              </div>

              {importing && <Progress value={progress} className="h-2" />}

              {result && (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${result.errors === 0 ? "bg-accent/10" : "bg-destructive/10"}`}>
                  {result.errors === 0 ? (
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
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
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminImport;
