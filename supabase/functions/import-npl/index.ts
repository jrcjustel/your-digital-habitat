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
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is authenticated
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rows, clearExisting } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No rows provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optionally clear existing data
    if (clearExisting) {
      await supabaseAdmin.from("npl_assets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Parse currency strings like "201.524,16 €" to number
    const parseCurrency = (val: string): number => {
      if (!val || val === "" || val === "0") return 0;
      return parseFloat(val.replace(/[€\s]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    };

    // Insert in batches of 500
    const BATCH_SIZE = 500;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map((r: any) => ({
        municipio: r.municipio || null,
        provincia: r.provincia || null,
        tipo_activo: r.tipo_activo || null,
        direccion: r.direccion || null,
        ref_catastral: r.ref_catastral || null,
        finca_registral: r.finca_registral || null,
        registro_propiedad: r.registro_propiedad || null,
        valor_activo: parseCurrency(r.valor_activo || "0"),
        deuda_ob: parseCurrency(r.deuda_ob || "0"),
        servicer: r.servicer || null,
        cartera: r.cartera || null,
        publicado: r.publicado === "SI" || r.publicado === "SÍ",
        ndg: r.ndg || null,
        asset_id: r.asset_id || null,
        name_debtor: r.name_debtor || null,
        persona_tipo: r.persona_tipo || null,
        rango_deuda: r.rango_deuda || null,
        comunidad_autonoma: r.comunidad_autonoma || null,
        sqm: parseFloat(String(r.sqm || "0").replace(",", ".")) || 0,
        estado_ocupacional: r.estado_ocupacional || null,
        tipo_procedimiento: r.tipo_procedimiento || null,
        estado_judicial: r.estado_judicial || null,
        cesion_remate: r.cesion_remate === "SI" || r.cesion_remate === "SÍ",
        cesion_credito: r.cesion_credito === "SI" || r.cesion_credito === "SÍ",
        importe_preaprobado: parseCurrency(r.importe_preaprobado || "0"),
        oferta_aprobada: r.oferta_aprobada === "SI" || r.oferta_aprobada === "SÍ",
      }));

      const { error } = await supabaseAdmin.from("npl_assets").insert(batch);
      if (error) {
        console.error("Batch insert error:", error);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, errors, total: rows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
