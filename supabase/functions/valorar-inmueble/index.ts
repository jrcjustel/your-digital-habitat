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

    // Reference price ranges by province (€/m², residential, 2025-2026 market data)
    const preciosReferencia: Record<string, { min: number; max: number }> = {
      'madrid': { min: 2800, max: 5500 }, 'barcelona': { min: 2600, max: 5000 },
      'málaga': { min: 1800, max: 3500 }, 'malaga': { min: 1800, max: 3500 },
      'valencia': { min: 1200, max: 2400 }, 'sevilla': { min: 1100, max: 2200 },
      'alicante': { min: 1000, max: 2200 }, 'cádiz': { min: 1000, max: 2000 }, 'cadiz': { min: 1000, max: 2000 },
      'baleares': { min: 2500, max: 5500 }, 'vizcaya': { min: 2000, max: 3800 },
      'guipúzcoa': { min: 2200, max: 4000 }, 'guipuzcoa': { min: 2200, max: 4000 },
      'granada': { min: 900, max: 1800 }, 'murcia': { min: 800, max: 1600 },
      'zaragoza': { min: 1000, max: 2000 }, 'valladolid': { min: 800, max: 1600 },
      'las palmas': { min: 1200, max: 2800 }, 'santa cruz de tenerife': { min: 1100, max: 2500 },
      'asturias': { min: 900, max: 1800 }, 'cantabria': { min: 900, max: 1800 },
      'navarra': { min: 1100, max: 2200 }, 'la rioja': { min: 700, max: 1400 },
      'toledo': { min: 600, max: 1200 }, 'guadalajara': { min: 600, max: 1300 },
      'ciudad real': { min: 400, max: 900 }, 'albacete': { min: 500, max: 1000 },
      'cuenca': { min: 400, max: 800 }, 'badajoz': { min: 500, max: 1000 },
      'cáceres': { min: 500, max: 1000 }, 'caceres': { min: 500, max: 1000 },
      'huelva': { min: 600, max: 1200 }, 'jaén': { min: 500, max: 1000 }, 'jaen': { min: 500, max: 1000 },
      'córdoba': { min: 700, max: 1400 }, 'cordoba': { min: 700, max: 1400 },
      'almería': { min: 700, max: 1500 }, 'almeria': { min: 700, max: 1500 },
      'león': { min: 500, max: 1100 }, 'leon': { min: 500, max: 1100 },
      'burgos': { min: 700, max: 1400 }, 'salamanca': { min: 800, max: 1500 },
      'segovia': { min: 600, max: 1200 }, 'ávila': { min: 400, max: 900 }, 'avila': { min: 400, max: 900 },
      'zamora': { min: 400, max: 800 }, 'palencia': { min: 500, max: 1000 },
      'soria': { min: 400, max: 900 }, 'teruel': { min: 400, max: 800 },
      'huesca': { min: 600, max: 1200 }, 'lleida': { min: 600, max: 1200 },
      'girona': { min: 1200, max: 2500 }, 'tarragona': { min: 900, max: 1800 },
      'castellón': { min: 700, max: 1500 }, 'castellon': { min: 700, max: 1500 },
      'pontevedra': { min: 900, max: 1800 }, 'a coruña': { min: 900, max: 1800 }, 'coruña': { min: 900, max: 1800 },
      'lugo': { min: 500, max: 1000 }, 'ourense': { min: 500, max: 1000 },
      'álava': { min: 1500, max: 3000 }, 'alava': { min: 1500, max: 3000 },
    };

    const provKey = (provincia || municipio || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const refPrices = Object.entries(preciosReferencia).find(([k]) => provKey.includes(k));
    const refRange = refPrices ? refPrices[1] : { min: 600, max: 1500 };

    // Adjust reference for non-residential types
    const tipoAjuste: Record<string, number> = {
      'garaje': 0.25, 'trastero': 0.20, 'local': 0.85, 'oficina': 0.90,
      'nave': 0.40, 'suelo': 0.50, 'terreno': 0.50, 'industrial': 0.40,
    };
    const ajuste = tipoAjuste[(tipo_inmueble || '').toLowerCase()] || 1.0;
    const refMin = Math.round(refRange.min * ajuste);
    const refMax = Math.round(refRange.max * ajuste);

    const prompt = `Eres un tasador inmobiliario profesional en España. Estima el valor de mercado del siguiente inmueble.

REGLAS CRÍTICAS:
- DEBES usar los PRECIOS DE REFERENCIA por m² que te proporciono como guía principal.
- El precio/m² de tu valoración DEBE estar dentro o cerca del rango de referencia proporcionado.
- NO inflaciones los precios. Es mejor infraestimar ligeramente que sobreestimar.
- Si la zona es rural o de baja demanda, usa la parte baja del rango.
- Si es zona urbana céntrica o prime, puedes usar la parte alta.
- Para inmuebles antiguos (>40 años) sin reforma, aplica un descuento del 10-25%.
- Para plantas bajas sin ascensor, descuento del 5-10%. Para plantas altas sin ascensor, descuento del 10-20%.

PRECIOS DE REFERENCIA para ${provincia || municipio || 'España'} (${tipo_inmueble}): ${refMin}-${refMax} €/m²

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

Responde SOLO con JSON válido (sin markdown):
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
