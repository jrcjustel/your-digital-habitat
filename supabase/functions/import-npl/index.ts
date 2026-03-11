/**
 * ============================================================
 * IMPORTADOR AVANZADO DE ACTIVOS NPL — Edge Function
 * ============================================================
 *
 * Soporta .xlsx y .csv con mapeo automático de columnas,
 * validación, detección de duplicados, upsert inteligente,
 * gestión de histórico (activos vendidos) y reporte de errores.
 *
 * ENDPOINTS (POST /import-npl):
 *
 *   body.action = "analyze"
 *     → Recibe { rows: any[], columns: string[] }
 *     → Devuelve mapeo sugerido + validación previa
 *
 *   body.action = "import"  (default)
 *     → Recibe { rows: any[], mapping?: Record<string,string>, markSoldMissing?: boolean }
 *     → Ejecuta upsert, marca vendidos, registra cambios
 *     → Devuelve { inserted, updated, sold, errors, errorDetails[] }
 *
 * SEGURIDAD: Solo admin con permiso importar_excel
 * ============================================================
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Alias dictionary for auto-mapping ───────────────────────
const COLUMN_ALIASES: Record<string, string[]> = {
  municipio: ["municipio", "municipality", "ciudad", "city", "localidad", "poblacion", "town"],
  provincia: ["provincia", "province", "prov"],
  comunidad_autonoma: ["comunidad_autonoma", "ccaa", "comunidad", "region", "autonomous_community"],
  tipo_activo: ["tipo_activo", "tipo", "asset_type", "type", "tipologia", "subtipo"],
  direccion: ["direccion", "address", "domicilio", "dir", "calle"],
  ref_catastral: ["ref_catastral", "referencia_catastral", "cadastral_ref", "catastro", "rc"],
  finca_registral: ["finca_registral", "finca", "registro", "land_registry"],
  registro_propiedad: ["registro_propiedad", "reg_propiedad"],
  valor_activo: ["valor_activo", "asset_value", "valor", "value", "precio_cartera"],
  deuda_ob: ["deuda_ob", "deuda", "debt", "outstanding_balance", "saldo_pendiente", "ob"],
  servicer: ["servicer", "gestor", "servicing", "fondo", "entidad"],
  cartera: ["cartera", "portfolio", "portfolio_name"],
  publicado: ["publicado", "published", "visible", "activo"],
  ndg: ["ndg", "ndg_id", "numero_gestion"],
  asset_id: ["asset_id", "id_activo", "referencia", "ref", "reference", "codigo"],
  name_debtor: ["name_debtor", "deudor", "debtor", "nombre_deudor", "titular"],
  persona_tipo: ["persona_tipo", "tipo_persona", "person_type", "pf_pj"],
  rango_deuda: ["rango_deuda", "debt_range", "tramo_deuda"],
  sqm: ["sqm", "superficie", "m2", "metros", "area", "superficie_m2", "sup"],
  estado_ocupacional: ["estado_ocupacional", "ocupacion", "occupancy", "ocupado"],
  tipo_procedimiento: ["tipo_procedimiento", "procedimiento", "procedure_type"],
  estado_judicial: ["estado_judicial", "judicial_status", "estado_legal"],
  fase_judicial: ["fase_judicial", "fase", "judicial_phase"],
  cesion_remate: ["cesion_remate", "remate", "foreclosure_assignment"],
  cesion_credito: ["cesion_credito", "credit_assignment"],
  importe_preaprobado: ["importe_preaprobado", "preaprobado", "pre_approved"],
  oferta_aprobada: ["oferta_aprobada", "approved_offer"],
  postura_subasta: ["postura_subasta", "auction_bid"],
  propiedad_sin_posesion: ["propiedad_sin_posesion", "sin_posesion", "no_possession"],
  valor_mercado: ["valor_mercado", "market_value", "vm", "valor_de_mercado"],
  precio_orientativo: ["precio_orientativo", "asking_price", "precio_venta", "precio", "price", "po"],
  referencia_fencia: ["referencia_fencia", "referencia_interna", "internal_ref", "ref_interna"],
  codigo_postal: ["codigo_postal", "cp", "postal_code", "zip"],
  deposito_porcentaje: ["deposito_porcentaje", "deposito", "deposit_pct", "deposit"],
  comision_porcentaje: ["comision_porcentaje", "comision", "commission_pct", "commission"],
  descripcion: ["descripcion", "description", "desc", "notas", "notes", "observaciones"],
  anio_construccion: ["anio_construccion", "year_built", "anio", "año", "año_construccion"],
  vpo: ["vpo", "proteccion_oficial", "social_housing"],
  judicializado: ["judicializado", "litigated", "en_litigio", "judicial"],
  num_titulares: ["num_titulares", "titulares", "holders", "owners"],
};

// ── Campos obligatorios ─────────────────────────────────────
const REQUIRED_FIELDS = ["provincia", "tipo_activo"];

// ── Parsers ─────────────────────────────────────────────────
const parseCurrency = (val: any): number => {
  if (val == null || val === "") return 0;
  const s = String(val);
  return parseFloat(s.replace(/[€$\s]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
};

const parsePercent = (val: any): number => {
  if (val == null || val === "") return 0;
  return parseFloat(String(val).replace(/[%\s]/g, "").replace(",", ".")) || 0;
};

const parseBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  const v = String(val ?? "").trim().toUpperCase();
  return ["SI", "SÍ", "TRUE", "1", "YES", "X"].includes(v);
};

const parseIntSafe = (val: any, fallback: number | null = null): number | null => {
  if (val == null || val === "") return fallback;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? fallback : n;
};

const parseFloatSafe = (val: any): number => {
  if (val == null || val === "") return 0;
  return parseFloat(String(val).replace(",", ".")) || 0;
};

// ── Field type config for validation ────────────────────────
const FIELD_TYPES: Record<string, "currency" | "percent" | "bool" | "int" | "float" | "text"> = {
  valor_activo: "currency", deuda_ob: "currency", importe_preaprobado: "currency",
  valor_mercado: "currency", precio_orientativo: "currency",
  deposito_porcentaje: "percent", comision_porcentaje: "percent",
  publicado: "bool", cesion_remate: "bool", cesion_credito: "bool",
  oferta_aprobada: "bool", postura_subasta: "bool", propiedad_sin_posesion: "bool",
  vpo: "bool", judicializado: "bool",
  sqm: "float",
  anio_construccion: "int", num_titulares: "int",
};

// ── Auto-mapping logic ──────────────────────────────────────
function autoMapColumns(sourceColumns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalize = (s: string) => s.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

  for (const src of sourceColumns) {
    const norm = normalize(src);
    for (const [target, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.some(a => normalize(a) === norm)) {
        mapping[src] = target;
        break;
      }
    }
  }
  return mapping;
}

// ── Row validation ──────────────────────────────────────────
interface RowError { row: number; field: string; message: string; value: any; severity: "error" | "warning"; }

function validateRow(mapped: Record<string, any>, rowIndex: number): RowError[] {
  const errors: RowError[] = [];

  // Required fields
  for (const f of REQUIRED_FIELDS) {
    if (!mapped[f] || String(mapped[f]).trim() === "") {
      errors.push({ row: rowIndex, field: f, message: `Campo obligatorio vacío: ${f}`, value: mapped[f], severity: "error" });
    }
  }

  // Type checks
  for (const [field, type] of Object.entries(FIELD_TYPES)) {
    const val = mapped[field];
    if (val == null || val === "") continue;
    if ((type === "currency" || type === "float") && isNaN(parseCurrency(val))) {
      errors.push({ row: rowIndex, field, message: `Valor numérico inválido`, value: val, severity: "error" });
    }
    if (type === "int" && parseIntSafe(val) === null) {
      errors.push({ row: rowIndex, field, message: `Entero inválido`, value: val, severity: "warning" });
    }
  }

  // Economic consistency warnings
  const precio = parseCurrency(mapped.precio_orientativo);
  const mercado = parseCurrency(mapped.valor_mercado);
  if (precio > 0 && mercado > 0 && precio > mercado * 1.5) {
    errors.push({ row: rowIndex, field: "precio_orientativo", message: "Precio orientativo > 150% valor mercado", value: precio, severity: "warning" });
  }

  return errors;
}

// ── Transform mapped row to DB record ───────────────────────
function toDbRecord(mapped: Record<string, any>): Record<string, any> {
  return {
    municipio: mapped.municipio || null,
    provincia: mapped.provincia || null,
    comunidad_autonoma: mapped.comunidad_autonoma || null,
    tipo_activo: mapped.tipo_activo || null,
    direccion: mapped.direccion || null,
    ref_catastral: mapped.ref_catastral || null,
    finca_registral: mapped.finca_registral || null,
    registro_propiedad: mapped.registro_propiedad || null,
    valor_activo: parseCurrency(mapped.valor_activo),
    deuda_ob: parseCurrency(mapped.deuda_ob),
    servicer: mapped.servicer || null,
    cartera: mapped.cartera || null,
    publicado: parseBool(mapped.publicado),
    ndg: mapped.ndg || null,
    asset_id: mapped.asset_id || null,
    name_debtor: mapped.name_debtor || null,
    persona_tipo: mapped.persona_tipo || null,
    rango_deuda: mapped.rango_deuda || null,
    sqm: parseFloatSafe(mapped.sqm),
    estado_ocupacional: mapped.estado_ocupacional || null,
    tipo_procedimiento: mapped.tipo_procedimiento || null,
    estado_judicial: mapped.estado_judicial || null,
    fase_judicial: mapped.fase_judicial || null,
    cesion_remate: parseBool(mapped.cesion_remate),
    cesion_credito: parseBool(mapped.cesion_credito),
    importe_preaprobado: parseCurrency(mapped.importe_preaprobado),
    oferta_aprobada: parseBool(mapped.oferta_aprobada),
    postura_subasta: parseBool(mapped.postura_subasta),
    propiedad_sin_posesion: parseBool(mapped.propiedad_sin_posesion),
    valor_mercado: parseCurrency(mapped.valor_mercado),
    precio_orientativo: parseCurrency(mapped.precio_orientativo),
    referencia_fencia: mapped.referencia_fencia || null,
    codigo_postal: mapped.codigo_postal || null,
    deposito_porcentaje: parsePercent(mapped.deposito_porcentaje),
    comision_porcentaje: parsePercent(mapped.comision_porcentaje),
    descripcion: mapped.descripcion || null,
    anio_construccion: parseIntSafe(mapped.anio_construccion),
    vpo: parseBool(mapped.vpo),
    judicializado: parseBool(mapped.judicializado),
    num_titulares: parseIntSafe(mapped.num_titulares, 1) ?? 1,
  };
}

// ── Unique key for deduplication ────────────────────────────
function getUniqueKey(rec: Record<string, any>): string | null {
  if (rec.asset_id) return `aid:${rec.asset_id}`;
  if (rec.ref_catastral) return `rc:${rec.ref_catastral}`;
  if (rec.ndg) return `ndg:${rec.ndg}`;
  return null;
}

// ── Main handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ── Auth ──────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "No autorizado" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) return json({ error: "No autorizado" }, 401);

    // Check admin + import permission
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    const { data: canImport } = await supabaseAdmin.rpc("has_permission", { _user_id: user.id, _permission: "importar_excel" });
    if (!isAdmin && !canImport) return json({ error: "Sin permisos de importación" }, 403);

    const body = await req.json();
    const action = body.action || "import";

    // ═══════════════════════════════════════════════════════
    // ACTION: ANALYZE — devuelve mapeo + validación previa
    // ═══════════════════════════════════════════════════════
    if (action === "analyze") {
      const { columns = [], rows = [] } = body;
      const mapping = autoMapColumns(columns);

      // Validate sample rows
      const sampleErrors: RowError[] = [];
      const previewRows: Record<string, any>[] = [];
      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const raw = rows[i];
        const mapped: Record<string, any> = {};
        for (const [src, target] of Object.entries(mapping)) {
          mapped[target] = raw[src];
        }
        sampleErrors.push(...validateRow(mapped, i + 1));
        previewRows.push(toDbRecord(mapped));
      }

      const mappedFields = Object.values(mapping);
      const unmappedColumns = columns.filter((c: string) => !mapping[c]);

      return json({
        success: true,
        mapping,
        summary: {
          totalColumns: columns.length,
          mappedColumns: mappedFields.length,
          unmappedColumns: unmappedColumns.length,
          unmapped: unmappedColumns,
          totalRows: rows.length,
          sampleErrors: sampleErrors.length,
          errorsByField: sampleErrors.reduce((acc, e) => {
            acc[e.field] = (acc[e.field] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        preview: previewRows,
        errors: sampleErrors,
      });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: IMPORT — upsert + histórico + cambios
    // ═══════════════════════════════════════════════════════
    const { rows, mapping: userMapping, markSoldMissing = true } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return json({ error: "No se proporcionaron filas" }, 400);
    }

    // Determine mapping
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const mapping = userMapping || autoMapColumns(columns);

    // ── Phase 1: Map + Validate all rows ────────────────
    const allErrors: RowError[] = [];
    const validRecords: { index: number; record: Record<string, any>; key: string | null }[] = [];
    const seenKeys = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const mapped: Record<string, any> = {};
      for (const [src, target] of Object.entries(mapping)) {
        mapped[target] = raw[src];
      }
      // Also check unmapped columns directly by target name
      for (const col of columns) {
        const norm = col.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_");
        if (!mapping[col] && COLUMN_ALIASES[norm]) {
          mapped[norm] = raw[col];
        }
      }

      const rowErrors = validateRow(mapped, i + 1);
      const fatalErrors = rowErrors.filter(e => e.severity === "error");

      if (fatalErrors.length > 0) {
        allErrors.push(...rowErrors);
        continue;
      }

      // Warnings are kept but row proceeds
      allErrors.push(...rowErrors.filter(e => e.severity === "warning"));

      const record = toDbRecord(mapped);
      const key = getUniqueKey(record);

      // In-file duplicate check
      if (key && seenKeys.has(key)) {
        allErrors.push({ row: i + 1, field: "duplicado", message: `Duplicado en archivo: ${key}`, value: key, severity: "warning" });
        continue;
      }
      if (key) seenKeys.add(key);

      validRecords.push({ index: i + 1, record, key });
    }

    // ── Phase 2: Fetch existing assets for upsert ───────
    const { data: existingAssets } = await supabaseAdmin
      .from("npl_assets")
      .select("id, asset_id, ref_catastral, ndg, provincia, municipio, tipo_activo, valor_activo, valor_mercado, precio_orientativo, deuda_ob, estado_ocupacional, estado_judicial, servicer, cartera, sqm, direccion, comunidad_autonoma, tipo_procedimiento, fase_judicial");

    // Build lookup maps
    const byAssetId = new Map<string, any>();
    const byRefCatastral = new Map<string, any>();
    const byNdg = new Map<string, any>();
    const allExistingIds = new Set<string>();

    for (const a of existingAssets || []) {
      allExistingIds.add(a.id);
      if (a.asset_id) byAssetId.set(a.asset_id, a);
      if (a.ref_catastral) byRefCatastral.set(a.ref_catastral, a);
      if (a.ndg) byNdg.set(a.ndg, a);
    }

    // ── Phase 3: Classify records (insert vs update) ────
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const matchedExistingIds = new Set<string>();
    const BATCH_SIZE = 200;

    // Prepare batches
    const toInsert: Record<string, any>[] = [];
    const toUpdate: { id: string; changes: Record<string, any>; original: any; rowIndex: number }[] = [];

    for (const { record, key, index } of validRecords) {
      // Find existing match
      let existing: any = null;
      if (record.asset_id) existing = byAssetId.get(record.asset_id);
      if (!existing && record.ref_catastral) existing = byRefCatastral.get(record.ref_catastral);
      if (!existing && record.ndg) existing = byNdg.get(record.ndg);

      if (existing) {
        matchedExistingIds.add(existing.id);
        // Detect changed fields
        const changes: Record<string, any> = {};
        const trackFields = [
          "provincia", "municipio", "tipo_activo", "valor_activo", "valor_mercado",
          "precio_orientativo", "deuda_ob", "estado_ocupacional", "estado_judicial",
          "servicer", "cartera", "sqm", "direccion", "comunidad_autonoma",
          "tipo_procedimiento", "fase_judicial",
        ];
        for (const f of trackFields) {
          const newVal = record[f];
          const oldVal = existing[f];
          if (newVal != null && String(newVal) !== String(oldVal ?? "")) {
            changes[f] = newVal;
          }
        }
        // Also update all fields (full overwrite minus id)
        if (Object.keys(changes).length > 0) {
          toUpdate.push({ id: existing.id, changes: record, original: existing, rowIndex: index });
        } else {
          skipped++;
        }
      } else {
        toInsert.push(record);
      }
    }

    // ── Phase 4: Execute inserts in batches ─────────────
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabaseAdmin.from("npl_assets").insert(batch);
      if (error) {
        console.error("Insert batch error:", error);
        for (let j = 0; j < batch.length; j++) {
          allErrors.push({ row: i + j + 1, field: "insert", message: error.message, value: null, severity: "error" });
        }
      } else {
        inserted += batch.length;
      }
    }

    // ── Phase 5: Execute updates + track changes ────────
    for (const { id, changes, original, rowIndex } of toUpdate) {
      const { error } = await supabaseAdmin.from("npl_assets").update(changes).eq("id", id);
      if (error) {
        allErrors.push({ row: rowIndex, field: "update", message: error.message, value: id, severity: "error" });
      } else {
        updated++;
        // Log changes to historial_cambios
        const trackFields = [
          "provincia", "municipio", "tipo_activo", "valor_activo", "valor_mercado",
          "precio_orientativo", "deuda_ob", "estado_ocupacional", "estado_judicial",
          "servicer", "cartera",
        ];
        for (const f of trackFields) {
          if (changes[f] != null && String(changes[f]) !== String(original[f] ?? "")) {
            await supabaseAdmin.from("historial_cambios").insert({
              entidad_tipo: "npl_asset",
              entidad_id: id,
              campo_modificado: f,
              valor_anterior: String(original[f] ?? ""),
              valor_nuevo: String(changes[f] ?? ""),
              usuario_id: user.id,
              usuario_nombre: user.email,
            });
          }
        }
      }
    }

    // ── Phase 6: Mark missing assets as sold ────────────
    let sold = 0;
    if (markSoldMissing && (existingAssets || []).length > 0) {
      const missingIds = [...allExistingIds].filter(id => !matchedExistingIds.has(id));

      for (const missingId of missingIds) {
        const existing = (existingAssets || []).find(a => a.id === missingId);
        if (!existing) continue;

        // Move to historico
        const { error: histError } = await supabaseAdmin.from("oportunidades_historico").insert({
          npl_asset_id: existing.id,
          asset_id: existing.asset_id,
          ref_catastral: existing.ref_catastral,
          municipio: existing.municipio,
          provincia: existing.provincia,
          comunidad_autonoma: existing.comunidad_autonoma,
          tipo_activo: existing.tipo_activo,
          direccion: existing.direccion,
          servicer: existing.servicer,
          cartera: existing.cartera,
          valor_activo: existing.valor_activo,
          valor_mercado: existing.valor_mercado,
          precio_orientativo: existing.precio_orientativo,
          deuda_ob: existing.deuda_ob,
          sqm: existing.sqm,
          estado_ocupacional: existing.estado_ocupacional,
          tipo_procedimiento: existing.tipo_procedimiento,
          estado_judicial: existing.estado_judicial,
          fase_judicial: existing.fase_judicial,
          motivo: "vendido",
          fecha_cierre: new Date().toISOString(),
          snapshot_data: existing,
          imported_by: user.id,
        });

        if (!histError) {
          // Update estado in npl_assets
          await supabaseAdmin.from("npl_assets")
            .update({ estado: "vendido", publicado: false })
            .eq("id", missingId);

          // Log the change
          await supabaseAdmin.from("historial_cambios").insert({
            entidad_tipo: "npl_asset",
            entidad_id: missingId,
            campo_modificado: "estado",
            valor_anterior: "disponible",
            valor_nuevo: "vendido",
            usuario_id: user.id,
            usuario_nombre: user.email,
          });

          sold++;
        }
      }
    }

    // ── Phase 7: Log activity ───────────────────────────
    await supabaseAdmin.from("activity_log").insert({
      action: "import_npl",
      entity_type: "npl_assets",
      user_id: user.id,
      metadata: {
        total_rows: rows.length,
        inserted,
        updated,
        sold,
        skipped,
        errors: allErrors.filter(e => e.severity === "error").length,
        warnings: allErrors.filter(e => e.severity === "warning").length,
      },
    });

    // ── Response ────────────────────────────────────────
    return json({
      success: true,
      summary: {
        totalRows: rows.length,
        inserted,
        updated,
        sold,
        skipped,
        errors: allErrors.filter(e => e.severity === "error").length,
        warnings: allErrors.filter(e => e.severity === "warning").length,
      },
      errorDetails: allErrors,
    });

  } catch (err) {
    console.error("Import error:", err);
    return json({ error: "Error interno del servidor", details: String(err) }, 500);
  }
});
