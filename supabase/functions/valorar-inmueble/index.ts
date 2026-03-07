const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      direccion, municipio, provincia, codigo_postal,
      tipo_inmueble, superficie_m2, habitaciones, banos,
      anio_construccion, estado, planta, tiene_garaje,
      tiene_trastero, tiene_ascensor
    } = body;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Eres un tasador inmobiliario profesional en España. Estima el valor de mercado del siguiente inmueble basándote en datos reales del mercado español actual (2025-2026). Responde SOLO con un JSON válido, sin markdown ni texto adicional.

Datos del inmueble:
- Dirección: ${direccion}
- Municipio: ${municipio || 'No especificado'}
- Provincia: ${provincia || 'No especificada'}
- Código postal: ${codigo_postal || 'No especificado'}
- Tipo: ${tipo_inmueble}
- Superficie: ${superficie_m2} m²
- Habitaciones: ${habitaciones || 'No especificado'}
- Baños: ${banos || 'No especificado'}
- Año construcción: ${anio_construccion || 'No especificado'}
- Estado: ${estado || 'No especificado'}
- Planta: ${planta !== null && planta !== undefined ? planta : 'No especificado'}
- Garaje: ${tiene_garaje ? 'Sí' : 'No'}
- Trastero: ${tiene_trastero ? 'Sí' : 'No'}
- Ascensor: ${tiene_ascensor ? 'Sí' : 'No'}

Responde con este formato JSON exacto:
{
  "valor_min": <número en euros>,
  "valor_max": <número en euros>,
  "valor_medio": <número en euros>,
  "precio_m2": <número en euros por m²>,
  "confianza": "<alta|media|baja>",
  "factores_positivos": ["factor1", "factor2"],
  "factores_negativos": ["factor1", "factor2"],
  "comentario": "Breve comentario profesional sobre la valoración"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un tasador inmobiliario profesional español. Respondes siempre en JSON válido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI gateway error [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const valuation = JSON.parse(jsonStr);

    // Save lead to DB
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/valuation_leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        direccion, municipio, provincia, codigo_postal,
        tipo_inmueble, superficie_m2: Number(superficie_m2),
        habitaciones: habitaciones ? Number(habitaciones) : null,
        banos: banos ? Number(banos) : null,
        anio_construccion: anio_construccion ? Number(anio_construccion) : null,
        estado, planta: planta !== null && planta !== undefined ? Number(planta) : null,
        tiene_garaje, tiene_trastero, tiene_ascensor,
        nombre: body.nombre, email: body.email, telefono: body.telefono,
        valor_estimado_min: valuation.valor_min,
        valor_estimado_max: valuation.valor_max,
        valor_estimado_medio: valuation.valor_medio,
      }),
    });

    if (!insertRes.ok) {
      console.error('DB insert error:', await insertRes.text());
    }

    return new Response(JSON.stringify({ success: true, valuation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Valuation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
