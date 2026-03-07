const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATASTRO_BASE = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx";

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(regex) || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ref_catastral } = await req.json();

    if (!ref_catastral || typeof ref_catastral !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Referencia catastral requerida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rc = ref_catastral.trim().toUpperCase().replace(/\s/g, "");
    if (rc.length < 14) {
      return new Response(
        JSON.stringify({ success: false, error: "La referencia catastral debe tener al menos 14 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query Catastro OVC API
    const url = `${CATASTRO_BASE}/Consulta_DNPRC?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;
    console.log("Querying Catastro:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Catastro API error: ${response.status}`);
    }

    const xml = await response.text();
    console.log("Catastro response length:", xml.length);

    // Check for errors
    const errorDesc = extractText(xml, "des");
    if (errorDesc && (errorDesc.toLowerCase().includes("no encontrado") || errorDesc.toLowerCase().includes("error"))) {
      return new Response(
        JSON.stringify({ success: false, error: `Catastro: ${errorDesc}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract location data
    const provincia = extractText(xml, "np") || extractText(xml, "cpro");
    const municipio = extractText(xml, "nm") || extractText(xml, "cmun");
    const codigo_postal = extractText(xml, "dp");

    // Extract address components
    const tv = extractText(xml, "tv"); // tipo via (CL, AV, etc.)
    const nv = extractText(xml, "nv"); // nombre via
    const num = extractText(xml, "pnp"); // numero
    const es = extractText(xml, "es"); // escalera
    const pt = extractText(xml, "pt"); // planta
    const pu = extractText(xml, "pu"); // puerta

    let direccion = "";
    if (tv && nv) {
      direccion = `${tv} ${nv}`;
      if (num) direccion += ` ${num}`;
      if (es) direccion += `, Esc. ${es}`;
      if (pt) direccion += `, Planta ${pt}`;
      if (pu) direccion += `, Puerta ${pu}`;
    }

    // Extract building/property details from cons blocks
    const consBlocks = extractAllBlocks(xml, "cons");
    let superficie_total = 0;
    let uso_principal = "";

    // Also try getting surface from sfc tag directly
    const sfcDirect = extractText(xml, "sfc");
    if (sfcDirect) {
      superficie_total = parseInt(sfcDirect) || 0;
    }

    for (const block of consBlocks) {
      const lcd = extractText(block, "lcd");
      const dfcons = extractText(block, "dfcons");
      const stl = extractText(block, "stl");

      if (lcd && !uso_principal) {
        uso_principal = lcd;
      }

      // Sum surfaces
      const sfc = extractText(block, "sfc");
      if (sfc && parseInt(sfc) > 0 && superficie_total === 0) {
        superficie_total += parseInt(sfc);
      }
    }

    // Try to get year of construction
    const ant = extractText(xml, "ant");

    // Map uso catastral to tipo inmueble
    let tipo_inmueble = "";
    const usoUpper = uso_principal.toUpperCase();
    if (usoUpper.includes("VIVIENDA") || usoUpper === "V") tipo_inmueble = "piso";
    else if (usoUpper.includes("LOCAL") || usoUpper === "C") tipo_inmueble = "local";
    else if (usoUpper.includes("OFICINA") || usoUpper === "O") tipo_inmueble = "oficina";
    else if (usoUpper.includes("INDUSTRIAL") || usoUpper === "I") tipo_inmueble = "nave";
    else if (usoUpper.includes("ALMACEN") || usoUpper === "A") tipo_inmueble = "trastero";
    else if (usoUpper.includes("GARAJE") || usoUpper === "G") tipo_inmueble = "garaje";
    else if (usoUpper.includes("SUELO") || usoUpper === "S") tipo_inmueble = "terreno";

    // Parse planta number
    let planta: number | null = null;
    if (pt) {
      const plantaNum = parseInt(pt);
      if (!isNaN(plantaNum)) planta = plantaNum;
      else if (pt.toUpperCase() === "BJ" || pt === "00") planta = 0;
      else if (pt.toUpperCase() === "SS" || pt.toUpperCase() === "ST") planta = -1;
    }

    const result = {
      success: true,
      data: {
        ref_catastral: rc,
        direccion,
        municipio,
        provincia,
        codigo_postal,
        tipo_inmueble,
        superficie_m2: superficie_total,
        anio_construccion: ant ? parseInt(ant) || null : null,
        planta,
        uso_catastral: uso_principal,
      },
    };

    console.log("Parsed result:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Catastro lookup error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error consultando el Catastro",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
