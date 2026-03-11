import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, ArrowRight,
  ArrowLeft, Columns, Wand2, Download, XCircle, Search, ShieldAlert, Eye
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── TYPES ───

interface ImportResult {
  inserted: number;
  errors: number;
  total: number;
}

interface RowValidation {
  rowIndex: number;
  status: "ok" | "warning" | "error";
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  data: Record<string, string>;
}

type ImportStep = "upload" | "map" | "validate" | "import";

// ─── DB FIELDS ───

const DB_FIELDS: { value: string; label: string; group: string; required?: boolean; type?: string }[] = [
  { value: "comunidad_autonoma", label: "Comunidad Autónoma", group: "Ubicación" },
  { value: "provincia", label: "Provincia", group: "Ubicación", required: true },
  { value: "municipio", label: "Municipio", group: "Ubicación", required: true },
  { value: "direccion", label: "Dirección", group: "Ubicación" },
  { value: "codigo_postal", label: "Código Postal", group: "Ubicación" },
  { value: "asset_id", label: "Asset ID", group: "Identificación" },
  { value: "ndg", label: "NDG", group: "Identificación" },
  { value: "ref_catastral", label: "Ref. Catastral", group: "Identificación" },
  { value: "finca_registral", label: "Finca Registral", group: "Identificación" },
  { value: "registro_propiedad", label: "Registro Propiedad", group: "Identificación" },
  { value: "referencia_interna", label: "Referencia interna", group: "Identificación" },
  { value: "tipo_activo", label: "Tipo de Activo", group: "Activo", required: true },
  { value: "sqm", label: "Superficie (m²)", group: "Activo", type: "number" },
  { value: "anio_construccion", label: "Año Construcción", group: "Activo", type: "number" },
  { value: "descripcion", label: "Descripción", group: "Activo" },
  { value: "vpo", label: "VPO", group: "Activo", type: "boolean" },
  { value: "valor_activo", label: "Valor Activo", group: "Económico", type: "currency" },
  { value: "valor_mercado", label: "Valor Mercado", group: "Económico", type: "currency" },
  { value: "precio_orientativo", label: "Precio Orientativo", group: "Económico", type: "currency" },
  { value: "deuda_ob", label: "Deuda (OB)", group: "Económico", type: "currency" },
  { value: "importe_preaprobado", label: "Importe Pre-Aprobado", group: "Económico", type: "currency" },
  { value: "deposito_porcentaje", label: "Depósito (%)", group: "Económico", type: "percent" },
  { value: "comision_porcentaje", label: "Comisión (%)", group: "Económico", type: "percent" },
  { value: "estado_ocupacional", label: "Estado Ocupacional", group: "Estado" },
  { value: "tipo_procedimiento", label: "Tipo Procedimiento", group: "Estado" },
  { value: "estado_judicial", label: "Estado Judicial", group: "Estado" },
  { value: "fase_judicial", label: "Fase Judicial", group: "Estado" },
  { value: "judicializado", label: "Judicializado", group: "Estado", type: "boolean" },
  { value: "cesion_remate", label: "Cesión de Remate", group: "Operación", type: "boolean" },
  { value: "cesion_credito", label: "Cesión de Crédito", group: "Operación", type: "boolean" },
  { value: "postura_subasta", label: "Postura en Subasta", group: "Operación", type: "boolean" },
  { value: "propiedad_sin_posesion", label: "Propiedad sin posesión", group: "Operación", type: "boolean" },
  { value: "oferta_aprobada", label: "Oferta Aprobada", group: "Operación", type: "boolean" },
  { value: "publicado", label: "Publicado", group: "Operación", type: "boolean" },
  { value: "name_debtor", label: "Nombre Deudor", group: "Deudor" },
  { value: "persona_tipo", label: "Persona Fís/Jur", group: "Deudor" },
  { value: "rango_deuda", label: "Rango Deuda", group: "Deudor" },
  { value: "num_titulares", label: "Nº Titulares", group: "Deudor", type: "number" },
  { value: "servicer", label: "Servicer", group: "Cartera" },
  { value: "cartera", label: "Cartera", group: "Cartera" },
];

// ─── ALIASES ───

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

// ─── VALIDATION ENGINE ───

function parseCurrency(val: string): number | null {
  if (!val || val === "" || val === "0") return 0;
  const cleaned = val.replace(/[€$\s]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parsePercent(val: string): number | null {
  if (!val || val === "" || val === "0") return 0;
  const cleaned = val.replace(/[%\s]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseBoolean(val: string): boolean {
  const v = (val || "").trim().toUpperCase();
  return v === "SI" || v === "SÍ" || v === "TRUE" || v === "1" || v === "YES";
}

function validateRow(
  rowData: Record<string, string>,
  rowIndex: number,
  mapping: Record<string, string>,
  existingRefs: Set<string>,
  existingAssetIds: Set<string>,
  seenRefs: Set<string>,
  seenAssetIds: Set<string>
): RowValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isDuplicate = false;

  const mappedFields = Object.values(mapping);

  // Required fields check
  const requiredFields = DB_FIELDS.filter((f) => f.required);
  for (const rf of requiredFields) {
    if (mappedFields.includes(rf.value)) {
      const val = rowData[rf.value]?.trim();
      if (!val) {
        errors.push(`"${rf.label}" es obligatorio y está vacío`);
      }
    }
  }

  // Must have at least one location identifier
  if (!rowData.provincia?.trim() && !rowData.municipio?.trim() && !rowData.direccion?.trim() && !rowData.asset_id?.trim()) {
    errors.push("Se requiere al menos Provincia, Municipio, Dirección o Asset ID");
  }

  // Type validation
  for (const [field, value] of Object.entries(rowData)) {
    if (!value?.trim()) continue;
    const fieldDef = DB_FIELDS.find((f) => f.value === field);
    if (!fieldDef) continue;

    if (fieldDef.type === "currency") {
      const parsed = parseCurrency(value);
      if (parsed === null) {
        errors.push(`"${fieldDef.label}": "${value}" no es un importe válido`);
      } else if (parsed < 0) {
        warnings.push(`"${fieldDef.label}": valor negativo (${value})`);
      }
    }

    if (fieldDef.type === "number") {
      const num = parseFloat(value.replace(",", "."));
      if (isNaN(num)) {
        errors.push(`"${fieldDef.label}": "${value}" no es un número válido`);
      }
    }

    if (fieldDef.type === "percent") {
      const parsed = parsePercent(value);
      if (parsed === null) {
        errors.push(`"${fieldDef.label}": "${value}" no es un porcentaje válido`);
      } else if (parsed > 100) {
        warnings.push(`"${fieldDef.label}": porcentaje > 100% (${value})`);
      }
    }
  }

  // Year validation
  if (rowData.anio_construccion?.trim()) {
    const year = parseInt(rowData.anio_construccion);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
      warnings.push(`Año construcción fuera de rango: ${rowData.anio_construccion}`);
    }
  }

  // sqm validation
  if (rowData.sqm?.trim()) {
    const sqm = parseFloat(rowData.sqm.replace(",", "."));
    if (!isNaN(sqm) && sqm > 50000) {
      warnings.push(`Superficie muy alta: ${sqm} m² — verificar`);
    }
  }

  // Duplicate detection (within file)
  if (rowData.ref_catastral?.trim()) {
    const ref = rowData.ref_catastral.trim().toUpperCase();
    if (seenRefs.has(ref)) {
      isDuplicate = true;
      warnings.push(`Ref. catastral "${ref}" duplicada en el archivo`);
    } else {
      seenRefs.add(ref);
    }
    if (existingRefs.has(ref)) {
      isDuplicate = true;
      warnings.push(`Ref. catastral "${ref}" ya existe en la base de datos`);
    }
  }

  if (rowData.asset_id?.trim()) {
    const aid = rowData.asset_id.trim().toUpperCase();
    if (seenAssetIds.has(aid)) {
      isDuplicate = true;
      warnings.push(`Asset ID "${aid}" duplicado en el archivo`);
    } else {
      seenAssetIds.add(aid);
    }
    if (existingAssetIds.has(aid)) {
      isDuplicate = true;
      warnings.push(`Asset ID "${aid}" ya existe en la base de datos`);
    }
  }

  // Economic consistency
  const precio = parseCurrency(rowData.precio_orientativo || "0") || 0;
  const mercado = parseCurrency(rowData.valor_mercado || "0") || 0;
  if (precio > 0 && mercado > 0 && precio > mercado * 2) {
    warnings.push(`Precio orientativo (${precio.toLocaleString()}€) supera 2x el valor de mercado (${mercado.toLocaleString()}€)`);
  }

  const status: RowValidation["status"] = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok";

  return { rowIndex, status, errors, warnings, isDuplicate, data: rowData };
}

// ─── COMPONENT ───

const AdminImport = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, hasRole, loading: permLoading } = usePermissions();
  const navigate = useNavigate();

  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [validations, setValidations] = useState<RowValidation[]>([]);
  const [validating, setValidating] = useState(false);
  const [validationFilter, setValidationFilter] = useState<"all" | "ok" | "warning" | "error">("all");
  const [previewPage, setPreviewPage] = useState(0);
  const PREVIEW_PAGE_SIZE = 20;

  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof DB_FIELDS> = {};
    for (const f of DB_FIELDS) {
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(f);
    }
    return groups;
  }, []);

  // Loading state
  if (authLoading || permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Permission check
  const canImport = hasRole("admin") || hasPermission("puede_importar_excel");
  if (!canImport) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-muted-foreground">No tienes permisos para importar datos. Contacta a un administrador.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const mappedCount = Object.values(columnMapping).filter(Boolean).length;
  const usedDbFields = new Set(Object.values(columnMapping));

  const getSampleValues = (col: string): string => {
    const samples = rawRows.slice(0, 3).map((r) => String(r[col] || "")).filter(Boolean);
    return samples.join(" · ") || "—";
  };

  const applyMapping = (): Record<string, string>[] => {
    return rawRows.map((row) => {
      const mapped: Record<string, string> = {};
      for (const [excelCol, dbField] of Object.entries(columnMapping)) {
        if (dbField) {
          mapped[dbField] = row[excelCol] !== undefined ? String(row[excelCol]) : "";
        }
      }
      return mapped;
    }).filter((r) => r.provincia || r.municipio || r.direccion || r.asset_id);
  };

  // ─── FILE HANDLING ───

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Formato no válido. Usa .xlsx, .xls o .csv");
      return;
    }

    setFile(f);
    setResult(null);
    setValidations([]);

    try {
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

      const detected = autoDetectMapping(columns);
      setColumnMapping(detected);

      const detectedCount = Object.keys(detected).length;
      toast.success(`${jsonData.length.toLocaleString()} filas · ${columns.length} columnas · ${detectedCount} mapeadas automáticamente`);
      setStep("map");
    } catch (err) {
      toast.error("Error al leer el archivo. Verifica que sea un Excel o CSV válido.");
    }
  };

  const updateMapping = (excelCol: string, dbField: string) => {
    setColumnMapping((prev) => {
      const updated = { ...prev };
      if (dbField === "__none__") {
        delete updated[excelCol];
      } else {
        for (const key of Object.keys(updated)) {
          if (updated[key] === dbField && key !== excelCol) delete updated[key];
        }
        updated[excelCol] = dbField;
      }
      return updated;
    });
  };

  // ─── VALIDATION ───

  const runValidation = async () => {
    setValidating(true);
    setPreviewPage(0);

    const mappedRows = applyMapping();
    if (mappedRows.length === 0) {
      toast.error("No se detectaron filas válidas con el mapeo actual.");
      setValidating(false);
      return;
    }

    // Fetch existing refs from DB for duplicate detection
    let existingRefs = new Set<string>();
    let existingAssetIds = new Set<string>();

    try {
      const { data: existingData } = await supabase
        .from("npl_assets")
        .select("ref_catastral, asset_id")
        .not("ref_catastral", "is", null)
        .limit(10000);

      if (existingData) {
        existingRefs = new Set(existingData.filter((d) => d.ref_catastral).map((d) => d.ref_catastral!.toUpperCase()));
        existingAssetIds = new Set(existingData.filter((d) => d.asset_id).map((d) => d.asset_id!.toUpperCase()));
      }
    } catch (e) {
      console.warn("Could not fetch existing refs for duplicate check");
    }

    const seenRefs = new Set<string>();
    const seenAssetIds = new Set<string>();

    const results: RowValidation[] = mappedRows.map((row, i) =>
      validateRow(row, i + 1, columnMapping, existingRefs, existingAssetIds, seenRefs, seenAssetIds)
    );

    setValidations(results);
    setValidating(false);
    setStep("validate");

    const errorCount = results.filter((r) => r.status === "error").length;
    const warnCount = results.filter((r) => r.status === "warning").length;
    const dupCount = results.filter((r) => r.isDuplicate).length;

    toast.info(
      `Validación: ${results.length} filas · ${errorCount} errores · ${warnCount} avisos · ${dupCount} duplicados`
    );
  };

  // ─── ERROR REPORT DOWNLOAD ───

  const downloadErrorReport = () => {
    const issueRows = validations.filter((v) => v.status !== "ok");
    if (issueRows.length === 0) {
      toast.info("No hay errores ni avisos para descargar");
      return;
    }

    const csvRows = [
      ["Fila", "Estado", "Tipo", "Mensaje", "Provincia", "Municipio", "Asset ID", "Ref. Catastral"].join(";"),
      ...issueRows.flatMap((v) => [
        ...v.errors.map((e) =>
          [v.rowIndex, "ERROR", "Validación", e, v.data.provincia || "", v.data.municipio || "", v.data.asset_id || "", v.data.ref_catastral || ""].join(";")
        ),
        ...v.warnings.map((w) =>
          [v.rowIndex, "AVISO", "Validación", w, v.data.provincia || "", v.data.municipio || "", v.data.asset_id || "", v.data.ref_catastral || ""].join(";")
        ),
      ]),
    ];

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-errores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reporte descargado");
  };

  // ─── IMPORT ───

  const handleImport = async () => {
    const validRows = validations.filter((v) => v.status !== "error");
    if (validRows.length === 0) {
      toast.error("No hay filas válidas para importar");
      return;
    }

    const parsedRows = validRows.map((v) => v.data);
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
          totalErrors += chunk.length;
        } else if (data) {
          totalInserted += data.inserted || 0;
          totalErrors += data.errors || 0;
        }
      } catch {
        totalErrors += chunk.length;
      }
      setProgress(Math.round(((i + 1) / chunks) * 100));
    }

    setResult({ inserted: totalInserted, errors: totalErrors, total: parsedRows.length });
    setImporting(false);

    if (totalErrors === 0) {
      toast.success(`¡Importación completada! ${totalInserted.toLocaleString()} activos importados.`);
    } else {
      toast.warning(`Importación parcial: ${totalInserted.toLocaleString()} importados, ${totalErrors} errores.`);
    }
  };

  // ─── VALIDATION STATS ───

  const stats = useMemo(() => {
    const ok = validations.filter((v) => v.status === "ok").length;
    const warn = validations.filter((v) => v.status === "warning").length;
    const err = validations.filter((v) => v.status === "error").length;
    const dup = validations.filter((v) => v.isDuplicate).length;
    return { ok, warn, err, dup, total: validations.length };
  }, [validations]);

  const filteredValidations = useMemo(() => {
    if (validationFilter === "all") return validations;
    return validations.filter((v) => v.status === validationFilter);
  }, [validations, validationFilter]);

  const paginatedValidations = useMemo(() => {
    const start = previewPage * PREVIEW_PAGE_SIZE;
    return filteredValidations.slice(start, start + PREVIEW_PAGE_SIZE);
  }, [filteredValidations, previewPage]);

  const totalPages = Math.ceil(filteredValidations.length / PREVIEW_PAGE_SIZE);

  // ─── STEPS CONFIG ───
  const steps = [
    { key: "upload", label: "Subir archivo" },
    { key: "map", label: "Mapear columnas" },
    { key: "validate", label: "Validar datos" },
    { key: "import", label: "Importar" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Importar Activos NPL</h1>
        <p className="text-muted-foreground mb-6">
          Sube un archivo Excel/CSV de cualquier servicer o fondo. Valida, previsualiza y descarga reportes de errores antes de importar.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-sm mb-8">
          {steps.map((s, i) => {
            const isActive = stepIndex >= i;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`hidden sm:inline ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 ${isActive ? "bg-accent" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {/* ═══════════ STEP 1: UPLOAD ═══════════ */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-accent" /> Archivo Excel / CSV</CardTitle>
              <CardDescription>Formatos: .xlsx, .xls, .csv — Compatible con cualquier servicer o fondo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="font-semibold text-foreground text-lg">Haz clic para seleccionar archivo</p>
                  <p className="text-sm text-muted-foreground mt-2">Arrastra o selecciona un Excel/CSV</p>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════ STEP 2: COLUMN MAPPING ═══════════ */}
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
                    <Badge className="bg-accent text-accent-foreground text-xs">{file?.name}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Asigna cada columna del Excel al campo de la BD. Las columnas reconocidas se mapean automáticamente.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {excelColumns.map((col) => {
                    const currentMapping = columnMapping[col] || "";
                    const isMapped = !!currentMapping;

                    return (
                      <div
                        key={col}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isMapped ? "border-accent/30 bg-accent/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{col}</span>
                            {isMapped && <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{getSampleValues(col)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="w-56 shrink-0">
                          <Select value={currentMapping || "__none__"} onValueChange={(v) => updateMapping(col, v)}>
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
                                      {f.label} {f.required && <span className="text-destructive">*</span>}
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
                    <Button onClick={runValidation} disabled={mappedCount === 0 || validating} className="gap-2">
                      {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {validating ? "Validando..." : "Validar datos"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════ STEP 3: VALIDATION ═══════════ */}
        {step === "validate" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setValidationFilter("all")}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total filas</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setValidationFilter("ok")}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.ok.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Válidas</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setValidationFilter("warning")}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.warn.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Avisos</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setValidationFilter("error")}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{stats.err.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Errores</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stats.dup.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Duplicados</div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {stats.err > 0 && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>{stats.err} filas con errores</strong> no se importarán. Descarga el reporte para corregirlas.
                </AlertDescription>
              </Alert>
            )}

            {stats.dup > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>{stats.dup} duplicados detectados</strong> (por ref. catastral o asset ID). Se importarán pero revisa si son correctos.
                </AlertDescription>
              </Alert>
            )}

            {/* Validation Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" />
                    Previsualización
                    <Badge variant="outline" className="text-xs ml-2">
                      {filteredValidations.length} filas · Filtro: {validationFilter === "all" ? "Todas" : validationFilter}
                    </Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={downloadErrorReport} className="gap-2">
                    <Download className="w-4 h-4" /> Descargar reporte
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-20">Estado</TableHead>
                        <TableHead>Provincia</TableHead>
                        <TableHead>Municipio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>V. Mercado</TableHead>
                        <TableHead>Detalles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedValidations.map((v) => (
                        <TableRow key={v.rowIndex} className={v.status === "error" ? "bg-destructive/5" : v.status === "warning" ? "bg-amber-500/5" : ""}>
                          <TableCell className="font-mono text-xs">{v.rowIndex}</TableCell>
                          <TableCell>
                            {v.status === "ok" && <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 mr-1" />OK</Badge>}
                            {v.status === "warning" && <Badge className="bg-amber-100 text-amber-800 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Aviso</Badge>}
                            {v.status === "error" && <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />Error</Badge>}
                          </TableCell>
                          <TableCell className="text-sm">{v.data.provincia || "—"}</TableCell>
                          <TableCell className="text-sm">{v.data.municipio || "—"}</TableCell>
                          <TableCell className="text-sm">{v.data.tipo_activo || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{v.data.precio_orientativo || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{v.data.valor_mercado || "—"}</TableCell>
                          <TableCell className="text-xs max-w-xs">
                            {v.errors.map((e, i) => (
                              <div key={`e${i}`} className="text-destructive">✕ {e}</div>
                            ))}
                            {v.warnings.map((w, i) => (
                              <div key={`w${i}`} className="text-amber-600">⚠ {w}</div>
                            ))}
                            {v.status === "ok" && <span className="text-muted-foreground">Sin incidencias</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Página {previewPage + 1} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreviewPage((p) => Math.max(0, p - 1))} disabled={previewPage === 0}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))} disabled={previewPage >= totalPages - 1}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setStep("map")} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver al mapeo
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="clear-existing" checked={clearExisting} onChange={(e) => setClearExisting(e.target.checked)} className="rounded" />
                      <label htmlFor="clear-existing" className="text-sm text-muted-foreground">Limpiar datos existentes</label>
                    </div>
                    <Button onClick={() => { setStep("import"); handleImport(); }} disabled={stats.ok + stats.warn === 0} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Importar {(stats.ok + stats.warn).toLocaleString()} filas válidas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════ STEP 4: IMPORT ═══════════ */}
        {step === "import" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-accent" /> Importación en curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Importando activos...</span>
                    <span className="font-mono font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}

              {result && (
                <div className={`rounded-xl p-6 flex items-start gap-4 ${result.errors === 0 ? "bg-accent/10" : "bg-destructive/10"}`}>
                  {result.errors === 0 ? (
                    <CheckCircle className="w-8 h-8 text-accent shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {result.errors === 0 ? "Importación completada" : "Importación con errores"}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      <strong>{result.inserted.toLocaleString()}</strong> activos importados de <strong>{result.total.toLocaleString()}</strong> totales.
                      {result.errors > 0 && <> · <strong className="text-destructive">{result.errors}</strong> errores.</>}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); setRawRows([]); setValidations([]); setResult(null); }} className="gap-2">
                        <Upload className="w-4 h-4" /> Importar otro archivo
                      </Button>
                      {result.errors > 0 && (
                        <Button variant="outline" onClick={downloadErrorReport} className="gap-2">
                          <Download className="w-4 h-4" /> Descargar reporte
                        </Button>
                      )}
                    </div>
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
