import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { municipality, province, postalCode } = await req.json();

    if (!municipality && !province) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos municipio o provincia" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const location = [municipality, province].filter(Boolean).join(", ");
    const cp = postalCode ? ` (CP ${postalCode})` : "";

    const prompt = `Necesito datos demográficos y socioeconómicos reales y actualizados de ${location}${cp}, España. 
Devuelve SOLO los datos en el formato exacto que te pido, sin explicaciones adicionales.

Datos requeridos:
1. Población total del municipio (último dato INE disponible)
2. Tasa de paro (%) del municipio o provincia
3. Renta media por hogar (€/año) del municipio o zona
4. Tasa de absorción inmobiliaria estimada (%) - ratio de transacciones sobre stock
5. Precio medio m² de vivienda en la zona (€/m²)
6. Año de los datos

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "population": número,
  "unemploymentRate": número con un decimal,
  "averageFamilyIncome": número entero,
  "absorptionRate": número con un decimal,
  "pricePerSqm": número entero,
  "dataYear": "2024",
  "source": "breve fuente de los datos"
}

Si no tienes un dato exacto, proporciona tu mejor estimación basada en datos conocidos de la zona. No dejes campos vacíos.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Eres un analista de datos inmobiliarios especializado en el mercado español. Proporcionas datos demográficos y socioeconómicos precisos de municipios españoles basados en fuentes oficiales como INE, Catastro, y portales inmobiliarios. Siempre respondes con JSON válido sin markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo más tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Añade fondos en Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      return new Response(
        JSON.stringify({ error: "Error al consultar datos de zona" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle possible markdown wrapping)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let zoneData;
    try {
      zoneData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "No se pudieron procesar los datos de zona", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(zoneData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("zone-data error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
