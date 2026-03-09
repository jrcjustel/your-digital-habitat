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

    // Reference price ranges by province (EUR/m2, residential, 2025-2026)
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

    const tipoAjuste: Record<string, number> = {
      'garaje': 0.25, 'trastero': 0.20, 'local': 0.85, 'oficina': 0.90,
      'nave': 0.40, 'suelo': 0.50, 'terreno': 0.50, 'industrial': 0.40,
    };
    const ajuste = tipoAjuste[(tipo_inmueble || '').toLowerCase()] || 1.0;
    const refMin = Math.round(refRange.min * ajuste);
    const refMax = Math.round(refRange.max * ajuste);

    const prompt = `Eres un tasador inmobiliario profesional en Espana. Genera un INFORME COMPLETO estilo idealista/data + DataVenues para el siguiente inmueble.

REGLAS CRITICAS DE PRECIOS:
- DEBES usar los PRECIOS DE REFERENCIA por m2: ${refMin}-${refMax} EUR/m2 para ${provincia || municipio || 'Espana'} (${tipo_inmueble}).
- El precio/m2 DEBE estar dentro o cerca de ese rango. NO inflaciones.
- Zona rural/baja demanda = parte baja. Zona urbana centrica = parte alta.
- Inmuebles >40 anos sin reforma: descuento 10-25%.
- Planta baja sin ascensor: -5-10%. Planta alta sin ascensor: -10-20%.
- Alquiler coherente con precio (rentabilidad bruta 4-7% anual).

DATOS DEL INMUEBLE:
- Direccion: ${direccion}
- Municipio: ${municipio || 'No especificado'}
- Provincia: ${provincia || 'No especificada'}
- CP: ${codigo_postal || 'No especificado'}
- Tipo: ${tipo_inmueble}
- Superficie: ${superficie_m2} m2
- Habitaciones: ${habitaciones || 'N/D'}
- Banos: ${banos || 'N/D'}
- Ano construccion: ${anio_construccion || 'N/D'}
- Estado: ${estado || 'N/D'}
- Planta: ${planta !== null && planta !== undefined ? planta : 'N/D'}
- Garaje: ${tiene_garaje ? 'Si' : 'No'}
- Trastero: ${tiene_trastero ? 'Si' : 'No'}
- Ascensor: ${tiene_ascensor ? 'Si' : 'No'}

Responde SOLO con JSON valido (sin backticks, sin markdown). ESTRUCTURA EXACTA:

{
  "valor_min": <numero EUR - precio minimo estimado (bid price)>,
  "valor_max": <numero EUR - precio maximo estimado (asking price)>,
  "valor_medio": <numero EUR - precio estimado de cierre>,
  "precio_m2": <numero EUR/m2>,
  "confianza": "<alta|media|baja>",
  "factores_positivos": ["factor1", "factor2", "factor3"],
  "factores_negativos": ["factor1", "factor2"],
  "comentario": "Comentario profesional breve",

  "alquiler_estimado": <EUR/mes>,
  "alquiler_m2": <EUR/m2/mes>,
  "tiempo_venta_min": <meses>,
  "tiempo_venta_max": <meses>,
  "negociacion_min": <porcentaje, ej: 5>,
  "negociacion_max": <porcentaje, ej: 10>,

  "precio_m2_zona_min": <EUR/m2 minimo zona>,
  "precio_m2_zona_max": <EUR/m2 maximo zona>,
  "precio_m2_zona_mediana": <EUR/m2 mediana zona>,
  "evolucion_12m": <variacion % interanual>,

  "evolucion_trimestral": [
    {"trimestre": "1T 2024", "precio": <EUR>},
    {"trimestre": "2T 2024", "precio": <EUR>},
    {"trimestre": "3T 2024", "precio": <EUR>},
    {"trimestre": "4T 2024", "precio": <EUR>},
    {"trimestre": "1T 2025", "precio": <EUR>},
    {"trimestre": "2T 2025", "precio": <EUR>},
    {"trimestre": "3T 2025", "precio": <EUR>},
    {"trimestre": "4T 2025", "precio": <EUR>}
  ],

  "precio_garaje_zona": <EUR medio garaje en la zona o null>,
  "precio_trastero_zona": <EUR medio trastero en la zona o null>,

  "testigos_compraventa": [
    {
      "direccion": "Calle inventada pero realista para la zona, numero",
      "descripcion": "Piso de segunda mano con X hab y Y bano",
      "precio": <EUR total>,
      "precio_m2": <EUR/m2>,
      "superficie": <m2>,
      "dem": <dias en mercado>,
      "distancia_km": <distancia en km, entre 0.1 y 1.5>,
      "diferencias": "+1 hab, -10m2, reformado"
    }
  ],

  "testigos_alquiler": [
    {
      "direccion": "Calle inventada pero realista para la zona, numero",
      "descripcion": "Piso con X hab",
      "precio_mensual": <EUR/mes>,
      "precio_m2_mes": <EUR/m2/mes>,
      "superficie": <m2>,
      "dem": <dias en mercado>,
      "distancia_km": <distancia en km>,
      "diferencias": "+1 hab, amueblado"
    }
  ],

  "datos_zona": {
    "poblacion": <numero habitantes municipio estimado>,
    "renta_media": <EUR/ano renta media familiar>,
    "tasa_actividad": <porcentaje>,
    "poblacion_extranjera_pct": <porcentaje>,
    "hogares_1persona_pct": <porcentaje>,
    "hogares_familia_pct": <porcentaje>,
    "edad_media_edificacion": <anos>,
    "inmuebles_residenciales": <numero estimado en la zona>
  },

  "tipologia_zona": {
    "por_superficie": [
      {"rango": "<50 m2", "porcentaje": <numero>},
      {"rango": "50-80 m2", "porcentaje": <numero>},
      {"rango": "80-120 m2", "porcentaje": <numero>},
      {"rango": ">120 m2", "porcentaje": <numero>}
    ],
    "por_antiguedad": [
      {"rango": "Antes 1960", "porcentaje": <numero>},
      {"rango": "1960-1980", "porcentaje": <numero>},
      {"rango": "1980-2000", "porcentaje": <numero>},
      {"rango": "2000-2010", "porcentaje": <numero>},
      {"rango": "Despues 2010", "porcentaje": <numero>}
    ]
  },

  "puntos_interes": {
    "transporte": <numero estaciones/paradas cercanas>,
    "comercio": <numero comercios cercanos>,
    "educacion": <numero centros educativos>,
    "sanidad": <numero centros sanitarios>,
    "zonas_verdes": <numero parques/jardines>
  },

  "insight": "Recomendacion directa IKESA con precio de salida sugerido, 1-2 frases"
}

REGLAS PARA TESTIGOS:
- Genera EXACTAMENTE 6 testigos de compraventa y 4 de alquiler.
- Superficie de testigos: +-30% respecto al inmueble analizado (como idealista).
- Los testigos deben estar en el MISMO barrio/zona, con distancia 0.1-1.5 km.
- Las direcciones deben ser calles realistas que puedan existir en ese municipio.
- Los precios/m2 deben variar +-15% respecto al precio/m2 estimado.
- DEM (dias en mercado) debe ser realista: entre 15 y 200 dias.
- Los datos de zona deben ser estimaciones realistas para ese municipio/provincia.
- La evolucion trimestral debe mostrar una tendencia coherente con evolucion_12m.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un tasador inmobiliario profesional espanol. Respondes siempre en JSON valido, sin backticks ni markdown. Todos los datos que generas son estimaciones realistas basadas en datos del mercado espanol.' },
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
