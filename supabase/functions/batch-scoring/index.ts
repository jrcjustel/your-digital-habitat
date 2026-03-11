import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Only admins can batch-score
    const { data: isAdmin } = await supabaseUser.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Solo administradores pueden ejecutar scoring masivo" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 500;
    const offset = body.offset || 0;
    const onlyMissing = body.only_missing !== false; // default: only score assets without calculations

    // Fetch assets to score
    let query = supabaseAdmin
      .from("npl_assets")
      .select("id")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: assets, error: fetchError } = await query;

    if (fetchError || !assets?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: "No hay activos para procesar",
        calculated: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let assetIds = assets.map((a: any) => a.id);

    // Filter to only missing if requested
    if (onlyMissing) {
      const { data: existing } = await supabaseAdmin
        .from("oportunidades_extra")
        .select("npl_asset_id")
        .in("npl_asset_id", assetIds);

      const existingIds = new Set((existing || []).map((e: any) => e.npl_asset_id));
      assetIds = assetIds.filter((id: string) => !existingIds.has(id));
    }

    if (assetIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "Todos los activos ya tienen cálculos",
        calculated: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call calculate-investment in batch
    const calcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/calculate-investment`;
    const batchSize = 50;
    let totalCalculated = 0;
    let totalErrors = 0;

    for (let i = 0; i < assetIds.length; i += batchSize) {
      const batchIds = assetIds.slice(i, i + batchSize);

      const response = await fetch(calcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({ batch: true, asset_ids: batchIds }),
      });

      const result = await response.json();
      totalCalculated += result.calculated || 0;
      totalErrors += result.errors || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_assets: assetIds.length,
        calculated: totalCalculated,
        errors: totalErrors,
        message: `Scoring completado: ${totalCalculated} activos calculados, ${totalErrors} errores`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Batch scoring error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
