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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    if (userError || !user) {
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

    if (clearExisting) {
      await supabaseAdmin.from("npl_assets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const parseCurrency = (val: string): number => {
      if (!val || val === "" || val === "0") return 0;
      return parseFloat(val.replace(/[€\s]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    };

    const parsePercent = (val: string): number => {
      if (!val || val === "" || val === "0") return 0;
      return parseFloat(val.replace(/[%\s]/g, "").replace(",", ".")) || 0;
    };

    const parseBool = (val: string): boolean => {
      const v = (val || "").trim().toUpperCase();
      return v === "SI" || v === "SÍ" || v === "TRUE" || v === "1";
    };

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
        publicado: parseBool(r.publicado || ""),
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
        cesion_remate: parseBool(r.cesion_remate || ""),
        cesion_credito: parseBool(r.cesion_credito || ""),
        importe_preaprobado: parseCurrency(r.importe_preaprobado || "0"),
        oferta_aprobada: parseBool(r.oferta_aprobada || ""),
        postura_subasta: parseBool(r.postura_subasta || ""),
        propiedad_sin_posesion: parseBool(r.propiedad_sin_posesion || ""),
        valor_mercado: parseCurrency(r.valor_mercado || "0"),
        precio_orientativo: parseCurrency(r.precio_orientativo || "0"),
        referencia_fencia: r.referencia_interna || null,
        codigo_postal: r.codigo_postal || null,
        fase_judicial: r.fase_judicial || null,
        deposito_porcentaje: parsePercent(r.deposito_porcentaje || "0"),
        comision_porcentaje: parsePercent(r.comision_porcentaje || "0"),
        descripcion: r.descripcion || null,
        anio_construccion: parseInt(String(r.anio_construccion || "0")) || null,
        vpo: parseBool(r.vpo || ""),
        judicializado: parseBool(r.judicializado || ""),
        num_titulares: parseInt(String(r.num_titulares || "1")) || 1,
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
