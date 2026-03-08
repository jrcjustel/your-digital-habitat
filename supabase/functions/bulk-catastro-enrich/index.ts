import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATASTRO_DNPRC = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC";

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(regex) || [];
}

async function lookupCatastro(rc: string) {
  const url = `${CATASTRO_DNPRC}?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Catastro HTTP ${res.status}`);
  const xml = await res.text();

  const errorDesc = extractText(xml, "des");
  if (errorDesc && (errorDesc.toLowerCase().includes("no encontrado") || errorDesc.toLowerCase().includes("error"))) {
    throw new Error(errorDesc);
  }

  const provincia = extractText(xml, "np") || extractText(xml, "cpro");
  const municipio = extractText(xml, "nm") || extractText(xml, "cmun");
  const codigo_postal = extractText(xml, "dp");
  const tv = extractText(xml, "tv");
  const nv = extractText(xml, "nv");
  const num = extractText(xml, "pnp");
  const es = extractText(xml, "es");
  const pt = extractText(xml, "pt");
  const pu = extractText(xml, "pu");

  let direccion = "";
  if (tv && nv) {
    direccion = `${tv} ${nv}`;
    if (num) direccion += ` ${num}`;
    if (es) direccion += `, Esc. ${es}`;
    if (pt) direccion += `, Planta ${pt}`;
    if (pu) direccion += `, Puerta ${pu}`;
  }

  const consBlocks = extractAllBlocks(xml, "cons");
  let superficie_total = 0;
  let uso_principal = "";

  const sfcDirect = extractText(xml, "sfc");
  if (sfcDirect) superficie_total = parseInt(sfcDirect) || 0;

  for (const block of consBlocks) {
    const lcd = extractText(block, "lcd");
    const sfc = extractText(block, "sfc");
    if (lcd && !uso_principal) uso_principal = lcd;
    const s = parseInt(sfc) || 0;
    if (s > 0 && superficie_total === 0) superficie_total += s;
  }

  const ant = extractText(xml, "ant");

  let tipo_activo = "";
  const u = uso_principal.toUpperCase();
  if (u.includes("VIVIENDA") || u === "V") tipo_activo = "piso";
  else if (u.includes("LOCAL") || u === "C") tipo_activo = "local";
  else if (u.includes("OFICINA") || u === "O") tipo_activo = "oficina";
  else if (u.includes("INDUSTRIAL") || u === "I") tipo_activo = "nave";
  else if (u.includes("ALMACEN") || u === "A") tipo_activo = "trastero";
  else if (u.includes("GARAJE") || u === "G") tipo_activo = "garaje";
  else if (u.includes("SUELO") || u === "S") tipo_activo = "terreno";

  return { direccion, municipio, provincia, codigo_postal, superficie_total, anio_construccion: ant ? parseInt(ant) || null : null, tipo_activo };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batch_size = 50, offset = 0 } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch assets with ref_catastral that are missing key data
    const { data: assets, error: fetchErr } = await supabaseAdmin
      .from("npl_assets")
      .select("id, ref_catastral, direccion, municipio, provincia, sqm, anio_construccion, tipo_activo")
      .not("ref_catastral", "is", null)
      .neq("ref_catastral", "")
      .range(offset, offset + batch_size - 1);

    if (fetchErr) throw fetchErr;
    if (!assets || assets.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, enriched: 0, errors: 0, done: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to assets actually missing data
    const toEnrich = assets.filter(a =>
      !a.direccion || !a.municipio || !a.provincia || !a.sqm || a.sqm === 0
    );

    let enriched = 0;
    let errors = 0;
    const errorDetails: { id: string; ref: string; error: string }[] = [];

    for (const asset of toEnrich) {
      try {
        const rc = asset.ref_catastral!.trim().toUpperCase().replace(/\s/g, "");
        if (rc.length < 14) {
          errors++;
          errorDetails.push({ id: asset.id, ref: rc, error: "RC < 14 chars" });
          continue;
        }

        const data = await lookupCatastro(rc);

        const updateData: Record<string, unknown> = {};
        if (data.direccion && !asset.direccion) updateData.direccion = data.direccion;
        if (data.municipio && !asset.municipio) updateData.municipio = data.municipio;
        if (data.provincia && !asset.provincia) updateData.provincia = data.provincia;
        if (data.codigo_postal) updateData.codigo_postal = data.codigo_postal;
        if (data.superficie_total > 0 && (!asset.sqm || asset.sqm === 0)) updateData.sqm = data.superficie_total;
        if (data.anio_construccion && !asset.anio_construccion) updateData.anio_construccion = data.anio_construccion;
        if (data.tipo_activo && !asset.tipo_activo) updateData.tipo_activo = data.tipo_activo;

        if (Object.keys(updateData).length > 0) {
          const { error: updateErr } = await supabaseAdmin
            .from("npl_assets")
            .update(updateData)
            .eq("id", asset.id);
          if (updateErr) throw updateErr;
          enriched++;
        }

        // Rate limit: ~1 req/sec to be polite to Catastro
        await new Promise(r => setTimeout(r, 1000));
      } catch (e: any) {
        errors++;
        errorDetails.push({ id: asset.id, ref: asset.ref_catastral || "", error: e.message || "Unknown" });
      }
    }

    const hasMore = assets.length === batch_size;

    return new Response(
      JSON.stringify({
        success: true,
        total_in_batch: assets.length,
        needed_enrichment: toEnrich.length,
        enriched,
        errors,
        error_details: errorDetails.slice(0, 10),
        done: !hasMore,
        next_offset: hasMore ? offset + batch_size : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bulk catastro error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
