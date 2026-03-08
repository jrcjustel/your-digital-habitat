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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No autorizado");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("No autorizado");

    const { front_base64, back_base64, dni_number } = await req.json();

    if (!front_base64 || !back_base64) {
      throw new Error("Se requieren ambas caras del DNI");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key no configurada");

    const prompt = `Eres un sistema de verificación de documentos de identidad español. Analiza las dos imágenes proporcionadas que deberían ser el ANVERSO y REVERSO de un DNI o NIE español.

Verifica lo siguiente:
1. ¿La primera imagen es realmente el ANVERSO de un DNI/NIE español? (debe mostrar foto, nombre, número de documento)
2. ¿La segunda imagen es realmente el REVERSO de un DNI/NIE español? (debe mostrar MRZ, datos adicionales)
3. ¿El documento parece auténtico y no una foto de pantalla o fotocopia de baja calidad?
4. ¿Se puede leer la fecha de validez/caducidad? Si es así, ¿está el documento en vigor (no caducado)?
5. Si se proporciona un número de DNI (${dni_number || "no proporcionado"}), ¿coincide con el que aparece en el documento?

IMPORTANTE: Responde EXCLUSIVAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin backticks):
{
  "is_valid_front": true/false,
  "is_valid_back": true/false,
  "is_authentic": true/false,
  "is_in_vigor": true/false/null,
  "expiry_date": "DD/MM/YYYY" o null si no se puede leer,
  "dni_matches": true/false/null,
  "detected_number": "número detectado" o null,
  "detected_name": "nombre detectado" o null,
  "confidence": "alta"/"media"/"baja",
  "issues": ["lista de problemas encontrados"],
  "summary": "resumen breve en español del resultado de la verificación"
}`;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${front_base64}` },
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${back_base64}` },
          },
        ],
      },
    ];

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          max_tokens: 1000,
          temperature: 0.1,
        }),
      }
    );

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("AI error:", err);
      throw new Error("Error en el servicio de verificación");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content);
      result = {
        is_valid_front: false,
        is_valid_back: false,
        is_authentic: false,
        is_in_vigor: null,
        expiry_date: null,
        dni_matches: null,
        detected_number: null,
        detected_name: null,
        confidence: "baja",
        issues: ["No se pudo analizar el documento correctamente"],
        summary: "Error al procesar las imágenes del documento.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
