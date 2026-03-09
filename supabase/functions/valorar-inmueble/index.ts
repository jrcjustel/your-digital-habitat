const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═══ REFERENCE PRICE DATABASE (EUR/m², residential, transaction prices 2024-2025) ═══
// Source: INE Índice de Precios de Vivienda + portales inmobiliarios (precios de cierre, no de oferta)
// IMPORTANT: These are TRANSACTION prices (10-20% below asking prices)
const preciosTransaccion: Record<string, { min: number; max: number; mediana: number }> = {
  'madrid':       { min: 2200, max: 4800, mediana: 3200 },
  'barcelona':    { min: 2000, max: 4200, mediana: 2900 },
  'málaga':       { min: 1400, max: 3000, mediana: 2000 },
  'malaga':       { min: 1400, max: 3000, mediana: 2000 },
  'valencia':     { min: 1000, max: 2100, mediana: 1450 },
  'sevilla':      { min: 900, max: 1900, mediana: 1300 },
  'alicante':     { min: 850, max: 1900, mediana: 1250 },
  'cádiz':        { min: 800, max: 1700, mediana: 1100 },
  'cadiz':        { min: 800, max: 1700, mediana: 1100 },
  'baleares':     { min: 2200, max: 5000, mediana: 3200 },
  'vizcaya':      { min: 1700, max: 3300, mediana: 2300 },
  'guipúzcoa':    { min: 1900, max: 3500, mediana: 2500 },
  'guipuzcoa':    { min: 1900, max: 3500, mediana: 2500 },
  'granada':      { min: 750, max: 1500, mediana: 1050 },
  'murcia':       { min: 650, max: 1300, mediana: 900 },
  'zaragoza':     { min: 800, max: 1700, mediana: 1150 },
  'valladolid':   { min: 650, max: 1400, mediana: 950 },
  'las palmas':   { min: 1000, max: 2400, mediana: 1500 },
  'santa cruz de tenerife': { min: 900, max: 2200, mediana: 1350 },
  'asturias':     { min: 750, max: 1500, mediana: 1050 },
  'cantabria':    { min: 750, max: 1600, mediana: 1050 },
  'navarra':      { min: 900, max: 1900, mediana: 1300 },
  'la rioja':     { min: 550, max: 1200, mediana: 800 },
  'toledo':       { min: 500, max: 1000, mediana: 700 },
  'guadalajara':  { min: 500, max: 1100, mediana: 750 },
  'ciudad real':  { min: 350, max: 750, mediana: 500 },
  'albacete':     { min: 400, max: 850, mediana: 600 },
  'cuenca':       { min: 300, max: 650, mediana: 450 },
  'badajoz':      { min: 400, max: 850, mediana: 550 },
  'cáceres':      { min: 400, max: 850, mediana: 550 },
  'caceres':      { min: 400, max: 850, mediana: 550 },
  'huelva':       { min: 500, max: 1000, mediana: 700 },
  'jaén':         { min: 400, max: 850, mediana: 550 },
  'jaen':         { min: 400, max: 850, mediana: 550 },
  'córdoba':      { min: 550, max: 1200, mediana: 800 },
  'cordoba':      { min: 550, max: 1200, mediana: 800 },
  'almería':      { min: 550, max: 1200, mediana: 800 },
  'almeria':      { min: 550, max: 1200, mediana: 800 },
  'león':         { min: 400, max: 950, mediana: 600 },
  'leon':         { min: 400, max: 950, mediana: 600 },
  'burgos':       { min: 550, max: 1200, mediana: 800 },
  'salamanca':    { min: 650, max: 1300, mediana: 900 },
  'segovia':      { min: 500, max: 1000, mediana: 700 },
  'ávila':        { min: 350, max: 750, mediana: 500 },
  'avila':        { min: 350, max: 750, mediana: 500 },
  'zamora':       { min: 300, max: 650, mediana: 450 },
  'palencia':     { min: 400, max: 850, mediana: 550 },
  'soria':        { min: 350, max: 750, mediana: 500 },
  'teruel':       { min: 300, max: 650, mediana: 450 },
  'huesca':       { min: 500, max: 1050, mediana: 700 },
  'lleida':       { min: 500, max: 1050, mediana: 700 },
  'girona':       { min: 1000, max: 2200, mediana: 1450 },
  'tarragona':    { min: 750, max: 1500, mediana: 1000 },
  'castellón':    { min: 550, max: 1200, mediana: 800 },
  'castellon':    { min: 550, max: 1200, mediana: 800 },
  'pontevedra':   { min: 750, max: 1500, mediana: 1000 },
  'a coruña':     { min: 750, max: 1600, mediana: 1050 },
  'coruña':       { min: 750, max: 1600, mediana: 1050 },
  'lugo':         { min: 400, max: 850, mediana: 550 },
  'ourense':      { min: 400, max: 850, mediana: 550 },
  'álava':        { min: 1300, max: 2600, mediana: 1800 },
  'alava':        { min: 1300, max: 2600, mediana: 1800 },
};

// ═══ HEDONIC ADJUSTMENT COEFFICIENTS ═══
const tipoAjuste: Record<string, number> = {
  'garaje': 0.25, 'trastero': 0.20, 'local': 0.80, 'oficina': 0.85,
  'nave': 0.35, 'suelo': 0.45, 'terreno': 0.45, 'industrial': 0.35,
};

/** Apply hedonic regression adjustments to base price */
function calcHedonicAdjustment(params: {
  anio_construccion?: number;
  estado?: string;
  planta?: number;
  tiene_ascensor?: boolean;
  tiene_garaje?: boolean;
  tiene_trastero?: boolean;
  superficie_m2: number;
  habitaciones?: number;
}): number {
  let coef = 1.0;

  // Age depreciation (stronger for older buildings)
  if (params.anio_construccion) {
    const age = 2025 - params.anio_construccion;
    if (age > 60) coef *= 0.78;
    else if (age > 40) coef *= 0.85;
    else if (age > 25) coef *= 0.92;
    else if (age > 15) coef *= 0.96;
    // New builds get a slight premium
    else if (age <= 3) coef *= 1.05;
  }

  // State adjustment
  if (params.estado === 'a_reformar') coef *= 0.80;
  else if (params.estado === 'reformado') coef *= 1.05;
  else if (params.estado === 'nuevo') coef *= 1.08;

  // Floor without elevator penalty
  if (params.planta != null && !params.tiene_ascensor) {
    if (params.planta >= 4) coef *= 0.85;
    else if (params.planta >= 3) coef *= 0.90;
    else if (params.planta === 0) coef *= 0.95; // ground floor slight discount
  }

  // Extras
  if (params.tiene_garaje) coef *= 1.04;
  if (params.tiene_trastero) coef *= 1.02;

  // Size adjustment (larger units have lower €/m²)
  if (params.superficie_m2 > 150) coef *= 0.92;
  else if (params.superficie_m2 > 120) coef *= 0.95;
  else if (params.superficie_m2 < 40) coef *= 1.08;

  return coef;
}

/** Validate and correct AI valuation against reference data */
function validateAndCorrectValuation(valuation: any, params: {
  provincia: string;
  municipio: string;
  tipo_inmueble: string;
  superficie_m2: number;
  anio_construccion?: number;
  estado?: string;
  planta?: number;
  tiene_ascensor?: boolean;
  tiene_garaje?: boolean;
  tiene_trastero?: boolean;
  habitaciones?: number;
}): any {
  const provKey = (params.provincia || params.municipio || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const refEntry = Object.entries(preciosTransaccion).find(([k]) => provKey.includes(k));
  const ref = refEntry ? refEntry[1] : { min: 500, max: 1300, mediana: 800 };

  // Apply type adjustment
  const tipoCoef = tipoAjuste[(params.tipo_inmueble || '').toLowerCase()] || 1.0;
  const adjMin = Math.round(ref.min * tipoCoef);
  const adjMax = Math.round(ref.max * tipoCoef);
  const adjMediana = Math.round(ref.mediana * tipoCoef);

  // Apply hedonic adjustments
  const hedonicCoef = calcHedonicAdjustment(params);
  const targetPriceM2 = Math.round(adjMediana * hedonicCoef);
  const targetMin = Math.round(adjMin * hedonicCoef);
  const targetMax = Math.round(adjMax * hedonicCoef);

  const aiPriceM2 = valuation.precio_m2;

  // Check if AI price is within acceptable range (±25% of target)
  const lowerBound = targetMin * 0.85;
  const upperBound = targetMax * 1.15;

  let correctedPriceM2 = aiPriceM2;
  let wasCorreted = false;

  if (aiPriceM2 > upperBound) {
    // AI overvalued — pull down towards the upper reasonable range
    correctedPriceM2 = Math.round(targetMax * 0.95 + targetPriceM2 * 0.05);
    wasCorreted = true;
  } else if (aiPriceM2 < lowerBound) {
    // AI undervalued — pull up towards the lower reasonable range
    correctedPriceM2 = Math.round(targetMin * 1.05);
    wasCorreted = true;
  }

  if (wasCorreted) {
    const ratio = correctedPriceM2 / aiPriceM2;
    valuation.precio_m2 = correctedPriceM2;
    valuation.valor_medio = Math.round(correctedPriceM2 * params.superficie_m2);
    valuation.valor_min = Math.round(valuation.valor_medio * 0.88);
    valuation.valor_max = Math.round(valuation.valor_medio * 1.12);

    // Correct testigos proportionally
    if (valuation.testigos_compraventa) {
      for (const t of valuation.testigos_compraventa) {
        t.precio_m2 = Math.round(t.precio_m2 * ratio);
        t.precio = Math.round(t.precio_m2 * t.superficie);
      }
    }
    if (valuation.testigos_alquiler) {
      for (const t of valuation.testigos_alquiler) {
        t.precio_m2_mes = +(t.precio_m2_mes * ratio).toFixed(1);
        t.precio_mensual = Math.round(t.precio_m2_mes * t.superficie);
      }
    }
    if (valuation.alquiler_estimado) {
      valuation.alquiler_estimado = Math.round(valuation.alquiler_estimado * ratio);
      if (valuation.alquiler_m2) valuation.alquiler_m2 = +(valuation.alquiler_m2 * ratio).toFixed(1);
    }
    if (valuation.evolucion_trimestral) {
      for (const e of valuation.evolucion_trimestral) {
        e.precio = Math.round(e.precio * ratio);
      }
    }

    // Update zone ranges
    valuation.precio_m2_zona_min = targetMin;
    valuation.precio_m2_zona_max = targetMax;
    valuation.precio_m2_zona_mediana = targetPriceM2;

    console.log(`[CORRECTION] AI: ${aiPriceM2}€/m² → Corrected: ${correctedPriceM2}€/m² (ref range: ${targetMin}-${targetMax}, hedonic: ${hedonicCoef.toFixed(2)})`);
  }

  return valuation;
}

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

    // Calculate reference ranges for the prompt
    const provKey = (provincia || municipio || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const refEntry = Object.entries(preciosTransaccion).find(([k]) => provKey.includes(k));
    const ref = refEntry ? refEntry[1] : { min: 500, max: 1300, mediana: 800 };
    const tipoCoef = tipoAjuste[(tipo_inmueble || '').toLowerCase()] || 1.0;
    const hedonicCoef = calcHedonicAdjustment({
      anio_construccion, estado, planta, tiene_ascensor,
      tiene_garaje, tiene_trastero, superficie_m2, habitaciones,
    });
    const targetMin = Math.round(ref.min * tipoCoef * hedonicCoef);
    const targetMax = Math.round(ref.max * tipoCoef * hedonicCoef);
    const targetMediana = Math.round(ref.mediana * tipoCoef * hedonicCoef);

    const prompt = `Eres un tasador inmobiliario profesional en España. Genera un INFORME de valoración para el siguiente inmueble.

REGLAS CRÍTICAS DE PRECIOS — CUMPLIMIENTO OBLIGATORIO:
- Los precios de referencia por m² para ${provincia || municipio || 'España'} (${tipo_inmueble}) son: TRANSACCIÓN (no oferta): ${targetMin}-${targetMax} EUR/m², mediana ${targetMediana} EUR/m².
- Tu precio/m² DEBE estar entre ${targetMin} y ${targetMax}. Si el municipio es rural/poco demandado, usa la parte BAJA. Si es urbano céntrico, la parte ALTA.
- NUNCA superes ${targetMax} EUR/m² salvo inmueble excepcional (obra nueva premium zona prime).
- Inmuebles >40 años sin reforma: -15-25% sobre mediana.
- Planta alta sin ascensor: -10-20%. Planta baja: -5%.
- Estado "a reformar": -15-25%.
- El alquiler debe dar una rentabilidad bruta del 4-7% anual. NO más.
- Los precios de testigos deben ser coherentes con el rango de referencia (±15%).

DATOS DEL INMUEBLE:
- Dirección: ${direccion}
- Municipio: ${municipio || 'No especificado'}
- Provincia: ${provincia || 'No especificada'}
- CP: ${codigo_postal || 'No especificado'}
- Tipo: ${tipo_inmueble}
- Superficie: ${superficie_m2} m²
- Habitaciones: ${habitaciones || 'N/D'}
- Baños: ${banos || 'N/D'}
- Año construcción: ${anio_construccion || 'N/D'}
- Estado: ${estado || 'N/D'}
- Planta: ${planta !== null && planta !== undefined ? planta : 'N/D'}
- Garaje: ${tiene_garaje ? 'Sí' : 'No'}
- Trastero: ${tiene_trastero ? 'Sí' : 'No'}
- Ascensor: ${tiene_ascensor ? 'Sí' : 'No'}

Responde SOLO con JSON válido (sin backticks, sin markdown). ESTRUCTURA EXACTA:

{
  "valor_min": <número EUR - precio mínimo estimado (bid price, aprox 88% del cierre)>,
  "valor_max": <número EUR - precio máximo estimado (asking price, aprox 112% del cierre)>,
  "valor_medio": <número EUR - precio estimado de cierre = precio_m2 × superficie>,
  "precio_m2": <número EUR/m² - DEBE estar entre ${targetMin} y ${targetMax}>,
  "confianza": "<alta|media|baja>",
  "factores_positivos": ["factor1", "factor2", "factor3"],
  "factores_negativos": ["factor1", "factor2"],
  "comentario": "Comentario profesional breve",
  "alquiler_estimado": <EUR/mes, que dé rentabilidad 4-7%>,
  "alquiler_m2": <EUR/m²/mes>,
  "tiempo_venta_min": <meses>, "tiempo_venta_max": <meses>,
  "negociacion_min": <porcentaje>, "negociacion_max": <porcentaje>,
  "precio_m2_zona_min": ${targetMin},
  "precio_m2_zona_max": ${targetMax},
  "precio_m2_zona_mediana": ${targetMediana},
  "evolucion_12m": <variación % interanual>,
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
  "precio_garaje_zona": <EUR o null>,
  "precio_trastero_zona": <EUR o null>,
  "testigos_compraventa": [
    {
      "direccion": "Calle realista para la zona, número",
      "descripcion": "Piso de segunda mano con X hab y Y baño",
      "precio": <EUR total = precio_m2 × superficie>,
      "precio_m2": <EUR/m² dentro del rango ${targetMin}-${targetMax}>,
      "superficie": <m², ±30% del inmueble>,
      "dem": <días en mercado, 15-200>,
      "distancia_km": <0.1-1.5>,
      "diferencias": "+1 hab, -10m², reformado"
    }
  ],
  "testigos_alquiler": [
    {
      "direccion": "Calle realista", "descripcion": "Piso con X hab",
      "precio_mensual": <EUR/mes>, "precio_m2_mes": <EUR/m²/mes>,
      "superficie": <m²>, "dem": <días>, "distancia_km": <km>,
      "diferencias": "+1 hab, amueblado"
    }
  ],
  "datos_zona": {
    "poblacion": <número>, "renta_media": <EUR/año>,
    "tasa_actividad": <porcentaje>, "poblacion_extranjera_pct": <porcentaje>,
    "hogares_1persona_pct": <porcentaje>, "hogares_familia_pct": <porcentaje>,
    "edad_media_edificacion": <años>, "inmuebles_residenciales": <número>
  },
  "tipologia_zona": {
    "por_superficie": [{"rango": "<50 m²", "porcentaje": <n>}, {"rango": "50-80 m²", "porcentaje": <n>}, {"rango": "80-120 m²", "porcentaje": <n>}, {"rango": ">120 m²", "porcentaje": <n>}],
    "por_antiguedad": [{"rango": "Antes 1960", "porcentaje": <n>}, {"rango": "1960-1980", "porcentaje": <n>}, {"rango": "1980-2000", "porcentaje": <n>}, {"rango": "2000-2010", "porcentaje": <n>}, {"rango": "Después 2010", "porcentaje": <n>}]
  },
  "puntos_interes": { "transporte": <n>, "comercio": <n>, "educacion": <n>, "sanidad": <n>, "zonas_verdes": <n> },
  "insight": "Recomendación directa IKESA con precio de salida sugerido"
}

REGLAS PARA TESTIGOS:
- EXACTAMENTE 6 testigos de compraventa y 4 de alquiler.
- Superficie de testigos: ±30% respecto al inmueble analizado.
- Distancia 0.1-1.5 km en el mismo barrio/zona.
- Direcciones realistas del municipio.
- Precios/m² dentro del rango de referencia (±15%).
- DEM realista: 15-200 días.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un tasador inmobiliario profesional español conservador. Respondes siempre en JSON válido, sin backticks ni markdown. Priorizas la infraestimación prudente frente a la sobreestimación. Tus precios se basan en TRANSACCIONES REALES (10-20% por debajo de precios de oferta en portales).' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
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

    let valuation = JSON.parse(jsonStr);

    // ═══ POST-PROCESSING: Validate and correct prices ═══
    valuation = validateAndCorrectValuation(valuation, {
      provincia: provincia || '',
      municipio: municipio || '',
      tipo_inmueble: tipo_inmueble || '',
      superficie_m2: Number(superficie_m2),
      anio_construccion: anio_construccion ? Number(anio_construccion) : undefined,
      estado, planta: planta != null ? Number(planta) : undefined,
      tiene_ascensor, tiene_garaje, tiene_trastero,
      habitaciones: habitaciones ? Number(habitaciones) : undefined,
    });

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
