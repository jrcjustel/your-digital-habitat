import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── ITP POR COMUNIDAD AUTÓNOMA (2025-2026) ───
const ITP_POR_CCAA: Record<string, number> = {
  "andalucia": 7,
  "aragon": 8,
  "asturias": 8,
  "baleares": 8,
  "canarias": 6.5,
  "cantabria": 10,
  "castilla y leon": 8,
  "castilla-la mancha": 9,
  "cataluña": 10,
  "catalunya": 10,
  "comunidad valenciana": 10,
  "extremadura": 8,
  "galicia": 9,
  "madrid": 6,
  "comunidad de madrid": 6,
  "murcia": 8,
  "navarra": 6,
  "pais vasco": 7,
  "la rioja": 7,
  "ceuta": 6,
  "melilla": 6,
};

// ─── LIQUIDEZ POR PROVINCIA ───
const PROVINCE_LIQUIDITY: Record<string, number> = {
  "madrid": 95, "barcelona": 92, "malaga": 88, "valencia": 85,
  "sevilla": 82, "alicante": 80, "bilbao": 78, "palma": 78,
  "cadiz": 72, "granada": 70, "zaragoza": 68, "murcia": 65,
  "las palmas": 65, "santa cruz": 62, "valladolid": 58,
  "salamanca": 55, "cordoba": 55, "tarragona": 60, "girona": 62,
};

// ─── RIESGO JUDICIAL ───
const JUDICIAL_PHASE_RISK: Record<string, number> = {
  "pre-demanda": 10, "demanda": 15, "ejecucion": 20,
  "subasta": 12, "adjudicacion": 8, "posesion": 5,
  "monitorio": 12, "concursal": 25,
};

const JUDICIAL_PHASE_MONTHS: Record<string, number> = {
  "pre-demanda": 24, "demanda": 18, "ejecucion": 12,
  "subasta": 6, "adjudicacion": 4, "posesion": 2,
  "monitorio": 10, "concursal": 30,
};

function normalizeText(text: string): string {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getITP(ccaa: string): number {
  const normalized = normalizeText(ccaa);
  for (const [key, val] of Object.entries(ITP_POR_CCAA)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }
  return 8; // default
}

function getLiquidity(provincia: string): number {
  const normalized = normalizeText(provincia);
  for (const [key, val] of Object.entries(PROVINCE_LIQUIDITY)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }
  return 50;
}

function getJudicialRisk(fase: string): number {
  const normalized = normalizeText(fase);
  for (const [key, val] of Object.entries(JUDICIAL_PHASE_RISK)) {
    if (normalized.includes(key)) return val;
  }
  return 10;
}

function getJudicialMonths(fase: string): number {
  const normalized = normalizeText(fase);
  for (const [key, val] of Object.entries(JUDICIAL_PHASE_MONTHS)) {
    if (normalized.includes(key)) return val;
  }
  return 12;
}

// ─── TIR (IRR) CALCULATION ───
function calculateIRR(cashflows: number[], guess = 0.1): number {
  const maxIter = 100;
  const tolerance = 0.00001;
  let rate = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashflows[t] / factor;
      dnpv -= t * cashflows[t] / (factor * (1 + rate));
    }
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) return newRate;
    rate = newRate;
    if (!isFinite(rate) || isNaN(rate)) return 0;
  }
  return rate;
}

interface AssetData {
  id: string;
  precio_orientativo: number;
  valor_mercado: number;
  valor_activo: number;
  deuda_ob: number;
  comunidad_autonoma: string;
  provincia: string;
  tipo_activo: string;
  estado_ocupacional: string;
  fase_judicial: string;
  judicializado: boolean;
  cesion_remate: boolean;
  cesion_credito: boolean;
  sqm: number;
  vpo: boolean;
}

interface CalculationResult {
  gastos_fiscales: number;
  gastos_judiciales: number;
  gastos_notariales: number;
  gastos_reforma: number;
  tir_estimada: number;
  roi_estimado: number;
  score_inversion: number;
  riesgo_judicial: number;
  liquidez_score: number;
}

function calculateForAsset(asset: AssetData): CalculationResult {
  const precioCompra = asset.precio_orientativo || asset.deuda_ob || 0;
  const valorMercado = asset.valor_mercado || asset.valor_activo || 0;

  if (precioCompra <= 0 || valorMercado <= 0) {
    return {
      gastos_fiscales: 0, gastos_judiciales: 0, gastos_notariales: 0,
      gastos_reforma: 0, tir_estimada: 0, roi_estimado: 0,
      score_inversion: 0, riesgo_judicial: 0, liquidez_score: 0,
    };
  }

  // 1. Gastos fiscales (ITP por CCAA)
  const itpRate = getITP(asset.comunidad_autonoma || "");
  const gastos_fiscales = Math.round(precioCompra * (itpRate / 100));

  // 2. Gastos judiciales
  const isJudicializado = asset.judicializado || false;
  const faseJudicial = asset.fase_judicial || "";
  let gastos_judiciales = 0;
  if (isJudicializado) {
    gastos_judiciales = Math.round(precioCompra * 0.03 + 2000); // 3% + fixed legal fees
  } else if (asset.cesion_remate || asset.cesion_credito) {
    gastos_judiciales = Math.round(precioCompra * 0.02 + 1500);
  }

  // 3. Gastos notariales y registro
  const gastos_notariales = Math.round(
    Math.min(Math.max(precioCompra * 0.015, 500), 5000) // 1.5% capped
  );

  // 4. Gastos reforma (estimate based on sqm and type)
  const sqm = asset.sqm || 80;
  let reformaPerSqm = 0;
  const tipo = normalizeText(asset.tipo_activo || "");
  if (tipo.includes("vivienda") || tipo.includes("piso") || tipo.includes("apartamento")) {
    reformaPerSqm = 200; // basic refurb
  } else if (tipo.includes("local") || tipo.includes("oficina")) {
    reformaPerSqm = 150;
  } else if (tipo.includes("nave") || tipo.includes("industrial")) {
    reformaPerSqm = 80;
  } else if (tipo.includes("terreno") || tipo.includes("solar")) {
    reformaPerSqm = 0;
  } else {
    reformaPerSqm = 150;
  }
  // Occupied properties need more reform
  if (normalizeText(asset.estado_ocupacional || "").includes("ocupado")) {
    reformaPerSqm *= 1.3;
  }
  const gastos_reforma = Math.round(sqm * reformaPerSqm);

  // 5. Total investment
  const totalInversion = precioCompra + gastos_fiscales + gastos_judiciales + gastos_notariales + gastos_reforma;

  // 6. ROI
  const margenBruto = valorMercado - totalInversion;
  const roi_estimado = totalInversion > 0
    ? Math.round((margenBruto / totalInversion) * 1000) / 10
    : 0;

  // 7. TIR (IRR)
  const judicialMonths = getJudicialMonths(faseJudicial);
  const totalMonths = judicialMonths + 6; // +6 for reform and sale
  const periods = Math.ceil(totalMonths / 12); // annual periods
  
  const cashflows: number[] = [-totalInversion];
  for (let i = 1; i < periods; i++) {
    cashflows.push(0); // no income during judicial/reform period
  }
  cashflows.push(valorMercado * 0.95); // sale at 95% market (agent fees)
  
  const tirAnual = calculateIRR(cashflows) * 100;
  const tir_estimada = Math.round(tirAnual * 10) / 10;

  // 8. Riesgo judicial (0-100)
  let riesgo_judicial = 0;
  riesgo_judicial += getJudicialRisk(faseJudicial);
  if (isJudicializado) riesgo_judicial += 15;
  if (asset.cesion_remate) riesgo_judicial += 10;
  if (normalizeText(asset.estado_ocupacional || "").includes("ocupado")) riesgo_judicial += 25;
  if (asset.vpo) riesgo_judicial += 5;
  riesgo_judicial = Math.min(100, riesgo_judicial);

  // 9. Liquidez score (0-100)
  const liquidez_score = getLiquidity(asset.provincia || "");

  // 10. Score de inversión (0-100)
  // Weighted: descuento 35%, ROI 25%, liquidez 20%, riesgo -20%
  const descuento = valorMercado > 0
    ? ((valorMercado - precioCompra) / valorMercado) * 100
    : 0;
  const descuentoScore = Math.min(descuento * 1.5, 40);
  const roiScore = Math.min(Math.max(roi_estimado, 0) * 1.2, 30);
  const liquidezBonus = (liquidez_score / 100) * 20;
  const riesgoPenalty = (riesgo_judicial / 100) * 20;

  const score_inversion = Math.max(0, Math.min(100,
    Math.round(descuentoScore + roiScore + liquidezBonus - riesgoPenalty)
  ));

  return {
    gastos_fiscales,
    gastos_judiciales,
    gastos_notariales,
    gastos_reforma,
    tir_estimada,
    roi_estimado,
    score_inversion,
    riesgo_judicial,
    liquidez_score,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check permission
    const { data: hasPermission } = await supabaseUser.rpc("has_permission", {
      _user_id: user.id,
      _permission: "escribir",
    });

    const { data: isAdmin } = await supabaseUser.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasPermission && !isAdmin) {
      return new Response(JSON.stringify({ error: "Sin permisos para calcular" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { asset_id, batch } = body;

    // Single asset or batch mode
    const assetIds: string[] = batch ? body.asset_ids : [asset_id];

    if (!assetIds || assetIds.length === 0) {
      return new Response(JSON.stringify({ error: "Se requiere asset_id o asset_ids[]" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch assets
    const { data: assets, error: fetchError } = await supabaseAdmin
      .from("npl_assets")
      .select("id, precio_orientativo, valor_mercado, valor_activo, deuda_ob, comunidad_autonoma, provincia, tipo_activo, estado_ocupacional, fase_judicial, judicializado, cesion_remate, cesion_credito, sqm, vpo")
      .in("id", assetIds);

    if (fetchError || !assets?.length) {
      return new Response(JSON.stringify({ error: "Activos no encontrados", details: fetchError?.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ asset_id: string; calculation: CalculationResult }> = [];
    const errors: Array<{ asset_id: string; error: string }> = [];

    for (const asset of assets) {
      try {
        const calc = calculateForAsset(asset as AssetData);

        // Upsert oportunidades_extra
        const { error: upsertError } = await supabaseAdmin
          .from("oportunidades_extra")
          .upsert({
            npl_asset_id: asset.id,
            gastos_fiscales: calc.gastos_fiscales,
            gastos_judiciales: calc.gastos_judiciales,
            gastos_notariales: calc.gastos_notariales,
            gastos_reforma: calc.gastos_reforma,
            tir_estimada: calc.tir_estimada,
            roi_estimado: calc.roi_estimado,
            score_inversion: calc.score_inversion,
            riesgo_judicial: calc.riesgo_judicial,
            liquidez_score: calc.liquidez_score,
            updated_by: user.id,
          }, { onConflict: "npl_asset_id" });

        if (upsertError) {
          errors.push({ asset_id: asset.id, error: upsertError.message });
          continue;
        }

        // Log to historial_cambios
        await supabaseAdmin.from("historial_cambios").insert({
          entidad_tipo: "oportunidad",
          entidad_id: asset.id,
          campo_modificado: "calculo_automatico",
          valor_anterior: null,
          valor_nuevo: JSON.stringify({
            tir: calc.tir_estimada,
            roi: calc.roi_estimado,
            score: calc.score_inversion,
            gastos_fiscales: calc.gastos_fiscales,
          }),
          usuario_id: user.id,
          usuario_nombre: user.email,
        });

        results.push({ asset_id: asset.id, calculation: calc });
      } catch (e) {
        errors.push({ asset_id: asset.id, error: e instanceof Error ? e.message : "Error desconocido" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        calculated: results.length,
        errors: errors.length,
        results,
        error_details: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Calculate investment error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
