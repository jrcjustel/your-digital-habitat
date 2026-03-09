import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATASTRO_DNPRC = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx";
const CATASTRO_DNPRC_DETAIL = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx";
const CATASTRO_DESCRIPTIVE = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC";

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAllText(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "gi");
  const matches = [];
  let m;
  while ((m = regex.exec(xml)) !== null) {
    if (m[1].trim()) matches.push(m[1].trim());
  }
  return matches;
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
    const { ref_catastral, asset_id, save_to_asset } = await req.json();

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

    // ===== 1) Consulta DNPRC (datos básicos) =====
    const url1 = `${CATASTRO_DNPRC}/Consulta_DNPRC?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;
    console.log("Querying Catastro DNPRC:", url1);
    const res1 = await fetch(url1);
    if (!res1.ok) throw new Error(`Catastro DNPRC error: ${res1.status}`);
    const xml1 = await res1.text();

    // Check for errors
    const errorDesc = extractText(xml1, "des");
    if (errorDesc && (errorDesc.toLowerCase().includes("no encontrado") || errorDesc.toLowerCase().includes("error"))) {
      return new Response(
        JSON.stringify({ success: false, error: `Catastro: ${errorDesc}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract location
    const provincia = extractText(xml1, "np") || extractText(xml1, "cpro");
    const municipio = extractText(xml1, "nm") || extractText(xml1, "cmun");
    const codigo_postal = extractText(xml1, "dp");
    const cpro = extractText(xml1, "cpro") || extractText(xml1, "cp");
    const cmun = extractText(xml1, "cmun") || extractText(xml1, "cm");

    // Address
    const tv = extractText(xml1, "tv");
    const nv = extractText(xml1, "nv");
    const num = extractText(xml1, "pnp");
    const es = extractText(xml1, "es");
    const pt = extractText(xml1, "pt");
    const pu = extractText(xml1, "pu");

    let direccion = "";
    if (tv && nv) {
      direccion = `${tv} ${nv}`;
      if (num) direccion += ` ${num}`;
      if (es) direccion += `, Esc. ${es}`;
      if (pt) direccion += `, Planta ${pt}`;
      if (pu) direccion += `, Puerta ${pu}`;
    }

    // Building details
    const consBlocks = extractAllBlocks(xml1, "cons");
    let superficie_total = 0;
    let uso_principal = "";
    const usos_detalle: { uso: string; superficie: number; planta: string }[] = [];

    const sfcDirect = extractText(xml1, "sfc");
    if (sfcDirect) superficie_total = parseInt(sfcDirect) || 0;

    for (const block of consBlocks) {
      const lcd = extractText(block, "lcd");
      const sfc = extractText(block, "sfc");
      const dfcons = extractText(block, "dfcons");
      const stl = extractText(block, "stl");

      if (lcd && !uso_principal) uso_principal = lcd;

      const superficieBlk = parseInt(sfc) || 0;
      if (sfc && superficieBlk > 0 && superficie_total === 0) {
        superficie_total += superficieBlk;
      }

      if (lcd || sfc) {
        usos_detalle.push({
          uso: lcd || "Desconocido",
          superficie: superficieBlk,
          planta: stl || dfcons || "",
        });
      }
    }

    const ant = extractText(xml1, "ant");

    // Map uso to tipo
    let tipo_inmueble = "";
    const usoUpper = uso_principal.toUpperCase();
    if (usoUpper.includes("VIVIENDA") || usoUpper === "V") tipo_inmueble = "piso";
    else if (usoUpper.includes("LOCAL") || usoUpper === "C") tipo_inmueble = "local";
    else if (usoUpper.includes("OFICINA") || usoUpper === "O") tipo_inmueble = "oficina";
    else if (usoUpper.includes("INDUSTRIAL") || usoUpper === "I") tipo_inmueble = "nave";
    else if (usoUpper.includes("ALMACEN") || usoUpper === "A") tipo_inmueble = "trastero";
    else if (usoUpper.includes("GARAJE") || usoUpper === "G") tipo_inmueble = "garaje";
    else if (usoUpper.includes("SUELO") || usoUpper === "S") tipo_inmueble = "terreno";

    let planta: number | null = null;
    if (pt) {
      const plantaNum = parseInt(pt);
      if (!isNaN(plantaNum)) planta = plantaNum;
      else if (pt.toUpperCase() === "BJ" || pt === "00") planta = 0;
      else if (pt.toUpperCase() === "SS" || pt.toUpperCase() === "ST") planta = -1;
    }

    // ===== 2) Consulta descriptiva y gráfica (más datos) =====
    // Get additional data from the descriptive endpoint
    let clase = "";
    let uso_predominante = "";
    let coeficiente_participacion = "";
    let superficie_suelo = 0;
    let superficie_construida = 0;
    let superficie_construida_comun = 0;
    let valor_catastral_suelo = "";
    let valor_catastral_construccion = "";
    let valor_catastral_total = "";
    let anio_valor = "";

    try {
      // RC1 = first 7 chars, RC2 = next 7 chars
      const rc1 = rc.substring(0, 7);
      const rc2 = rc.substring(7, 14);
      const url2 = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}`;
      console.log("Querying Catastro descriptive:", url2);
      const res2 = await fetch(url2);
      if (res2.ok) {
        const xml2 = await res2.text();
        clase = extractText(xml2, "cn") || "";
        uso_predominante = extractText(xml2, "luso") || uso_principal;
        coeficiente_participacion = extractText(xml2, "cpt") || "";
        
        // Surfaces
        const sst = extractText(xml2, "sst");
        if (sst) superficie_suelo = parseInt(sst) || 0;
        
        const scn = extractText(xml2, "sfc");
        if (scn) superficie_construida = parseInt(scn) || superficie_total;
      }
    } catch (e) {
      console.log("Could not fetch descriptive data:", e);
    }

    // ===== 3) Generate URLs and fetch fachada image =====
    const catastro_web_url = `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCConCiworBienInmueble.aspx?del=${cpro}&mun=${cmun}&UrbRus=&rc1=${rc.substring(0, 7)}&rc2=${rc.substring(7, 14)}&from=OVCBusqueda&pest=rc&RCCompleta=${rc}&from=nuevoVisor`;

    // Fetch fachada image server-side to avoid CORS
    let fachada_base64: string | null = null;
    // Try multiple fachada URL formats
    const rc14 = rc.substring(0, 14);
    const fachadaUrls = [
      `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/OVCFotoFachada.svc/RecuperarFotoFachadaRC?ReferenciaCatastral=${rc}`,
      `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/OVCFotoFachada.svc/RecuperarFotoFachadaRC?ReferenciaCatastral=${rc14}`,
    ];
    for (const fachadaUrl of fachadaUrls) {
      if (fachada_base64) break;
      try {
        console.log("Trying fachada URL:", fachadaUrl);
        const fachadaRes = await fetch(fachadaUrl);
        if (fachadaRes.ok) {
          const contentType = fachadaRes.headers.get('content-type') || 'image/jpeg';
          if (contentType.startsWith('image/')) {
            const buffer = await fachadaRes.arrayBuffer();
            console.log("Fachada response size:", buffer.byteLength, "content-type:", contentType);
            if (buffer.byteLength > 100) {
              const bytes = new Uint8Array(buffer);
              let binary = '';
              for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
              fachada_base64 = `data:${contentType};base64,${btoa(binary)}`;
            }
          }
        }
      } catch (e) {
        console.error("Error fetching fachada from", fachadaUrl, e);
      }
    }

    // Build Google Maps embed URL from address for satellite view
    const fullAddress = [direccion, municipio, provincia].filter(Boolean).join(', ');
    const google_maps_embed = fullAddress
      ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullAddress)}&maptype=satellite&zoom=18`
      : null;

    // Build complete result
    const catastroData = {
      ref_catastral: rc,
      direccion,
      municipio,
      provincia,
      codigo_postal,
      tipo_inmueble,
      uso_catastral: uso_principal,
      uso_predominante: uso_predominante || uso_principal,
      clase,
      superficie_m2: superficie_total || superficie_construida,
      superficie_suelo,
      superficie_construida: superficie_construida || superficie_total,
      superficie_construida_comun,
      anio_construccion: ant ? parseInt(ant) || null : null,
      planta,
      coeficiente_participacion,
      usos_detalle,
      fachada_base64,
      google_maps_embed,
      urls: {
        ficha_catastral: catastro_web_url,
      },
    };

    // ===== 4) Save to asset if requested =====
    if (save_to_asset && asset_id) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Update npl_asset with catastro data
        const updateData: Record<string, unknown> = {};
        if (catastroData.direccion && catastroData.direccion.length > 0) updateData.direccion = catastroData.direccion;
        if (catastroData.municipio) updateData.municipio = catastroData.municipio;
        if (catastroData.provincia) updateData.provincia = catastroData.provincia;
        if (catastroData.codigo_postal) updateData.codigo_postal = catastroData.codigo_postal;
        if (catastroData.superficie_m2 > 0) updateData.sqm = catastroData.superficie_m2;
        if (catastroData.anio_construccion) updateData.anio_construccion = catastroData.anio_construccion;
        if (catastroData.tipo_inmueble) updateData.tipo_activo = catastroData.tipo_inmueble;

        if (Object.keys(updateData).length > 0) {
          const { error: updateErr } = await supabaseAdmin
            .from("npl_assets")
            .update(updateData)
            .eq("id", asset_id);
          if (updateErr) console.error("Error updating asset:", updateErr);
          else console.log("Asset updated with catastro data");
        }

        // Save catastro data as a JSON document record
        const { error: docErr } = await supabaseAdmin
          .from("documents")
          .upsert(
            {
              npl_asset_id: asset_id,
              title: `Ficha Catastral - ${rc}`,
              file_name: `ficha-catastral-${rc}.json`,
              file_path: `catastro/${asset_id}/${rc}.json`,
              category: "catastral",
              description: `Datos extraídos del Catastro para ref. ${rc}. Dirección: ${catastroData.direccion}. Superficie: ${catastroData.superficie_m2} m². Año: ${catastroData.anio_construccion || "N/D"}.`,
              is_confidential: false,
              mime_type: "application/json",
            },
            { onConflict: "npl_asset_id,category", ignoreDuplicates: false }
          );

        if (docErr) {
          // If upsert fails due to no unique constraint, try insert
          console.log("Upsert failed, trying insert:", docErr);
          await supabaseAdmin.from("documents").insert({
            npl_asset_id: asset_id,
            title: `Ficha Catastral - ${rc}`,
            file_name: `ficha-catastral-${rc}.json`,
            file_path: `catastro/${asset_id}/${rc}.json`,
            category: "catastral",
            description: `Datos extraídos del Catastro para ref. ${rc}. Dirección: ${catastroData.direccion}. Superficie: ${catastroData.superficie_m2} m². Año: ${catastroData.anio_construccion || "N/D"}.`,
            is_confidential: false,
            mime_type: "application/json",
          });
        }
      } catch (saveErr) {
        console.error("Error saving catastro data:", saveErr);
      }
    }

    const result = { success: true, data: catastroData };
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
