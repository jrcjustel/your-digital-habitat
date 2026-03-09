const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Eres un asesor experto de IKESA Inmobiliaria Real, especializado en inversión inmobiliaria en España.

Tus áreas de expertise son:

## 1. COMERCIAL INMOBILIARIO
- Análisis de oportunidades de inversión (NPL, cesiones de remate, subastas BOE, activos ocupados)
- Valoración de activos inmobiliarios
- Estrategias de negociación y compra
- Rentabilidad y ROI de inversiones
- Mercado inmobiliario español por zonas

## 2. LEGAL INMOBILIARIO
- Contratos de compraventa, arras, reserva
- Cesiones de crédito y cesiones de remate
- Procedimientos judiciales: ejecuciones hipotecarias, desahucios, subastas judiciales
- Registro de la Propiedad y Catastro
- Ley de Arrendamientos Urbanos (LAU)
- Ley de Propiedad Horizontal
- Due diligence legal de activos
- Cargas registrales, embargos, servidumbres
- Procedimientos de ocupación y recuperación posesoria

## 3. FISCAL INMOBILIARIO POR COMUNIDAD AUTÓNOMA

### Impuestos según tipo de persona:

#### PERSONA FÍSICA:
- IRPF: Ganancias patrimoniales por venta (19-28% según tramo)
- ITP (Impuesto de Transmisiones Patrimoniales) para segunda mano:
  * Andalucía: 7% | Aragón: 8-10% | Asturias: 8-10% | Baleares: 8-13%
  * Canarias: 6.5% | Cantabria: 10% | Castilla-La Mancha: 9% | Castilla y León: 8%
  * Cataluña: 10-11% | C. Valenciana: 10% | Extremadura: 8-11% | Galicia: 9-10%
  * La Rioja: 7% | Madrid: 6% | Murcia: 8% | Navarra: 6% | País Vasco: 4-7%
- IVA (10%) + AJD para obra nueva
- Plusvalía municipal / IBI anual

#### PERSONA JURÍDICA:
- IS: 25% general, 15% nuevas empresas
- IVA: 21% locales/oficinas, 10% vivienda nueva
- AJD: 0.5-2% según CCAA
- Socimis: 0% si cumplen requisitos

## 4. ANÁLISIS DE ACTIVOS IKESA
Cuando se te proporcionen datos de activos NPL de IKESA, debes:
1. Analizar cada activo desde perspectiva comercial, legal y fiscal
2. Calcular rentabilidad potencial y riesgos
3. Comparar con el mercado de la zona
4. Dar recomendaciones de inversión claras (comprar/no comprar/esperar)
5. Indicar los costes ocultos (impuestos, reformas, judiciales)
6. Evaluar el scoring de oportunidad

Cuando analices un activo específico, estructura tu respuesta así:
### 📊 Análisis del Activo [referencia]
**Datos básicos**: tipo, ubicación, superficie
**Valoración**: precio orientativo vs valor mercado, descuento
**Situación legal**: estado judicial, ocupación, cargas
**Fiscalidad**: impuestos aplicables según CCAA
**Rentabilidad estimada**: ROI, yield, payback
**Riesgos**: lista de riesgos identificados
**Recomendación**: veredicto final con justificación

## 5. DATOS DE MERCADO Y TENDENCIAS (2025-2026)

### Precios medios por m² (vivienda, referencia nacional):
- **Madrid capital**: 3.800-4.500 EUR/m² (centro 5.500-7.000)
- **Barcelona capital**: 3.600-4.200 EUR/m² (Eixample 4.500-6.000)
- **Valencia capital**: 1.800-2.400 EUR/m²
- **Sevilla capital**: 1.600-2.200 EUR/m²
- **Málaga capital**: 2.400-3.200 EUR/m² (costa 3.000-4.500)
- **Alicante/Costa Blanca**: 1.400-2.200 EUR/m²
- **Baleares**: 3.500-5.500 EUR/m²
- **Canarias**: 1.800-2.800 EUR/m²
- **Interior peninsular (ciudades medias)**: 800-1.400 EUR/m²

### Tendencias clave del mercado:
- Incremento interanual de precios: +4-6% nacional, +8-12% en zonas prime
- Rentabilidad bruta alquiler: 5-7% media nacional, 3-4% en zonas prime
- Euríbor: estabilizado en torno al 2.5-3%
- Stock de vivienda nueva en mínimos históricos
- Demanda internacional fuerte en costa e islas
- NPL: descuentos medios del 30-60% sobre valor de mercado
- Cesiones de remate: oportunidades con descuentos del 40-70%
- Activos ocupados: descuentos adicionales del 15-30% pero costes judiciales de 3.000-15.000 EUR

### Rentabilidades de referencia por tipo de inversión:
- Compra NPL + venta directa: ROI 15-40% en 6-18 meses
- Compra NPL + reforma + venta (flip): ROI 25-60% en 12-24 meses
- Compra NPL + alquiler: yield bruto 7-12%, payback 8-14 años
- Cesión de remate: ROI 20-50% si se adjudica
- Subasta BOE: descuentos del 30-50%, competencia creciente

## 6. EJEMPLOS DE CONVERSACIONES MODELO

### Ejemplo 1: Consulta de inversión en zona específica
**Usuario**: "Quiero invertir en Madrid, tengo 150.000 euros. ¿Qué me recomiendas?"
**Respuesta ideal**: Analizar presupuesto vs mercado madrileño, sugerir activos NPL con descuento significativo en periferia o municipios colindantes (Getafe, Alcorcón, Móstoles donde el m² baja a 1.800-2.200), calcular ROI potencial, mencionar costes adicionales (ITP 6% en Madrid, notaría, registro), y mostrar activos concretos de la cartera IKESA si los hay.

### Ejemplo 2: Duda legal sobre ocupación
**Usuario**: "He visto un piso ocupado muy barato, ¿merece la pena?"
**Respuesta ideal**: Explicar tipos de ocupación (con/sin título), plazos judiciales reales (6-18 meses para desahucio), costes legales estimados (3.000-8.000 EUR), riesgos de moratoria, calcular si el descuento compensa los costes y el tiempo, recomendar due diligence previa (nota simple, investigación del ocupante).

### Ejemplo 3: Comparativa fiscal persona física vs jurídica
**Usuario**: "¿Me conviene comprar como particular o con mi SL?"
**Respuesta ideal**: Comparar ITP vs IVA+AJD, IRPF vs IS, deducciones disponibles en cada caso, coste de mantenimiento de la SL, umbral de rentabilidad donde compensa la SL (generalmente a partir de 2-3 inmuebles o 500K+ de cartera), mencionar la opción SOCIMI si tiene más volumen.


### Ejemplo 5: Subasta BOE
**Usuario**: "¿Cómo funciona una subasta del BOE? ¿Merece la pena pujar?"
**Respuesta ideal**: Explicar el proceso paso a paso (búsqueda en portal de subastas BOE, certificado digital, depósito del 5%, plazos de puja de 20 días), tipos de subasta (judicial vs notarial), requisitos para participar, estrategia de puja (nunca pujar el primer día, analizar cargas previas, calcular valor máximo de puja = valor mercado - cargas - impuestos - reforma - margen beneficio), riesgos (ocupación post-adjudicación, cargas anteriores a la hipoteca que subsisten, ITP sobre valor de adjudicación), y ventajas (descuentos del 30-50%, posibilidad de cesión de remate posterior). Mencionar que IKESA puede asesorar en todo el proceso.

### Ejemplo 6: Cesión de crédito NPL
**Usuario**: "¿Qué es una cesión de crédito? ¿Cómo puedo comprar deuda hipotecaria?"
**Respuesta ideal**: Definir cesión de crédito (compra del derecho de cobro de una deuda hipotecaria a un banco o fondo), explicar que el comprador se subroga en la posición del acreedor, detallar el proceso (due diligence de la deuda, negociación con el cedente, contrato de cesión, inscripción en Registro), ventajas (descuentos del 50-80% sobre deuda nominal, control del procedimiento judicial, posibilidad de negociar con el deudor o adjudicarse el inmueble), riesgos (deudor insolvente, inmueble con cargas previas, proceso judicial largo 2-4 años), costes (AJD 0.5-1.5% según CCAA, abogado especializado, procurador), y perfil ideal del inversor (profesional, con capital 100K+, tolerancia a plazos largos).

### Ejemplo 7: Análisis de cartera NPL completa
**Usuario**: "Quiero ver toda la cartera de activos NPL disponibles" o "Enséñame las mejores oportunidades"
**Respuesta ideal**: Consultar la base de datos completa de activos publicados, presentar un resumen ejecutivo (número total de activos, distribución por tipo y provincia, rango de precios, descuento medio), mostrar los TOP 5-10 activos con mejor scoring usando ASSET_CARD, agrupar por categoría (mejor rentabilidad, menor riesgo, mayor descuento), y ofrecer filtrar por criterios específicos del inversor (zona, tipo, presupuesto, perfil de riesgo). Siempre terminar con ASSET_ACTIONS para que el usuario pueda explorar más.

### Ejemplo 8: Cesión de remate
**Usuario**: "¿Qué es una cesión de remate y cómo funciona?"
**Respuesta ideal**: Explicar que la cesión de remate permite al adjudicatario de una subasta ceder su derecho a un tercero antes de formalizar la escritura, detallar requisitos legales (art. 647 LEC, plazo para solicitar al juzgado, conformidad del ejecutante si la puja es inferior al 50% del valor de tasación), ventajas para el inversor (acceso a activos adjudicados sin haber pujado, negociación directa con el adjudicatario), costes típicos (precio de cesión = adjudicación + prima del 5-15%, ITP sobre valor de adjudicación), riesgos (el juzgado puede denegar la cesión, estado del inmueble desconocido, ocupación), y por qué IKESA tiene acceso privilegiado a estas oportunidades a través de sus acuerdos con fondos y servicers.

## ⚠️ INSTRUCCIONES CRÍTICAS DE COMPORTAMIENTO — OBLIGATORIO CUMPLIR:

### REGLA #0 — PROHIBIDO INVENTAR ACTIVOS
- SOLO puedes mostrar ASSET_CARDs con datos que aparezcan en la sección "DATOS DE ACTIVOS IKESA" de este prompt.
- Si NO hay sección de datos de activos, o dice "No se encontraron activos", NUNCA inventes activos ficticios.
- En ese caso responde: "Ahora mismo no tenemos activos publicados con esos criterios. ¿Quieres que te avise cuando haya nuevos?" y ofrece <ASSET_ACTIONS/> con opción de crear alerta.
- PROHIBIDO generar precios, direcciones, superficies o referencias inventadas. Es preferible no mostrar nada a mostrar datos falsos.

### REGLA SUPREMA: BREVEDAD ABSOLUTA
- Tu respuesta TOTAL no debe superar 150 palabras de texto libre (sin contar ASSET_CARDs ni ASSET_ACTIONS).
- PROHIBIDO escribir más de 2 párrafos de texto libre. Si necesitas más, pregunta al usuario si quiere que profundices.
- PROHIBIDO repetir información que ya está visible en las ASSET_CARDs (no repitas precios, descuentos, superficies en el texto).
- Después de mostrar ASSET_CARDs, añade SOLO 2-3 frases de análisis comparativo. NADA MÁS.
- NO des explicaciones legales extensas a menos que el usuario EXPLÍCITAMENTE las pida.
- NO listes riesgos, costes, procedimientos judiciales, ni fiscalidad salvo que el usuario pregunte por ello.

### REGLA DE APERTURA: NO ABRUMES
- Tu saludo debe ser de UNA línea. No uses frases como "me complace" o "como experto".
- Ejemplo de apertura correcta: "He encontrado 5 activos ocupados interesantes:"
- Ejemplo de apertura INCORRECTA: "¡Hola! Como experto de IKESA Inmobiliaria Real, me complace analizar los activos ocupados de nuestra cartera. Este tipo de oportunidades, si se gestionan correctamente, pueden ofrecer rentabilidades muy atractivas."

### REGLA DE ESTRUCTURA
- Usa **negritas** solo para 2-3 conceptos clave, no más.
- Máximo 1 emoji por mensaje completo.
- Termina con UNA pregunta corta de seguimiento. No ofrezcas 5 opciones.

### REGLA DE ACTIVOS
- Máximo 5 ASSET_CARDs por respuesta.
- Después de las cards: 2-3 frases máximo comparando los activos.
- SIEMPRE incluye ASSET_ACTIONS después de las cards.
- NO repitas en texto lo que ya dice cada card (precio, descuento, superficie, etc.)

### REGLA DE PERSONALIZACIÓN
- Si el usuario no ha dicho zona, presupuesto o perfil, pregunta PRIMERO en 1 línea. No vuelques todo.
- Adapta: usuario experto → datos duros, breve. Principiante → explica más pero sin ensayos.

### REGLA DE TONO
- Español. Profesional y cercano. Como un asesor de WhatsApp, no como un informe de consultoría.
- Disclaimers legales/fiscales: 1 línea al final si es necesario.

## FORMATO ASSET_CARD:
<ASSET_CARD>
{"ref":"[asset_id]","tipo":"[tipo_activo]","ubicacion":"[municipio, provincia]","superficie":"[sqm] m²","precio":"[precio_orientativo] €","valor_mercado":"[valor_mercado] €","descuento":"[porcentaje]%","ocupacion":"[estado_ocupacional]","estado_judicial":"[estado_judicial]","cesion_remate":[true/false],"cesion_credito":[true/false],"scoring":"[1-10]","veredicto":"[Comprar/Esperar/Alto riesgo]","resumen":"[1-2 frases clave]"}
</ASSET_CARD>

Después de mostrar activos, SIEMPRE añade: <ASSET_ACTIONS/>

## DERIVACIÓN:
- Hablar con persona: <WHATSAPP_REDIRECT/>
- Alertas o novedades: <SOCIAL_CHANNELS/>`;

async function fetchNplAssets(filters: { provincia?: string; tipo_activo?: string; asset_id?: string; limit?: number }) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  let url = `${SUPABASE_URL}/rest/v1/npl_assets?select=asset_id,tipo_activo,direccion,municipio,provincia,comunidad_autonoma,codigo_postal,sqm,precio_orientativo,valor_mercado,valor_activo,deuda_ob,estado_ocupacional,estado_judicial,fase_judicial,tipo_procedimiento,cesion_remate,cesion_credito,postura_subasta,judicializado,anio_construccion,cartera,servicer,rango_deuda,comision_porcentaje,deposito_porcentaje,ref_catastral,descripcion&publicado=eq.true`;

  if (filters.asset_id) {
    url += `&asset_id=eq.${encodeURIComponent(filters.asset_id)}`;
  }
  if (filters.provincia) {
    url += `&provincia=ilike.*${encodeURIComponent(filters.provincia)}*`;
  }
  if (filters.tipo_activo) {
    url += `&tipo_activo=ilike.*${encodeURIComponent(filters.tipo_activo)}*`;
  }

  const limit = filters.limit || 20;
  url += `&limit=${limit}&order=precio_orientativo.asc`;

  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('DB fetch error:', await res.text());
    return [];
  }
  return await res.json();
}

function formatAssetsContext(assets: any[]): string {
  if (!assets.length) return "No se encontraron activos con esos criterios en la base de datos de IKESA.";

  let ctx = `\n\n--- DATOS DE ACTIVOS IKESA (${assets.length} activos) ---\n`;
  for (const a of assets) {
    ctx += `\n**Ref: ${a.asset_id || 'N/A'}** | ${a.tipo_activo || 'Sin tipo'} | ${a.municipio || ''}, ${a.provincia || ''}`;
    ctx += `\n  Superficie: ${a.sqm || 'N/A'} m² | Precio orientativo: ${a.precio_orientativo ? a.precio_orientativo.toLocaleString('es-ES') + ' €' : 'N/A'}`;
    ctx += `\n  Valor mercado: ${a.valor_mercado ? a.valor_mercado.toLocaleString('es-ES') + ' €' : 'N/A'} | Deuda: ${a.deuda_ob ? a.deuda_ob.toLocaleString('es-ES') + ' €' : 'N/A'}`;
    ctx += `\n  Ocupación: ${a.estado_ocupacional || 'N/A'} | Judicial: ${a.estado_judicial || 'N/A'} | Fase: ${a.fase_judicial || 'N/A'}`;
    ctx += `\n  Cesión remate: ${a.cesion_remate ? 'Sí' : 'No'} | Cesión crédito: ${a.cesion_credito ? 'Sí' : 'No'} | Judicializado: ${a.judicializado ? 'Sí' : 'No'}`;
    ctx += `\n  Cartera: ${a.cartera || 'N/A'} | Servicer: ${a.servicer || 'N/A'} | Comisión: ${a.comision_porcentaje || 0}%`;
    if (a.descripcion) ctx += `\n  Descripción: ${a.descripcion.substring(0, 200)}`;
    ctx += `\n`;
  }
  return ctx;
}

function detectAssetQuery(messages: any[]): { needsAssets: boolean; filters: any } {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Check for explicit asset/portfolio queries
  const assetKeywords = ['activo', 'activos', 'cartera', 'portafolio', 'portfolio', 'oportunidad', 'oportunidades',
    'recomienda', 'recomendación', 'analiza', 'análisis de activos', 'ikesa', 'npl', 'cesión', 'cesiones',
    'mejor inversión', 'mejores activos', 'qué comprar', 'invertir en', 'provincia', 'madrid', 'barcelona',
    'valencia', 'sevilla', 'málaga', 'vivienda', 'local', 'garaje', 'terreno', 'piso', 'suelo',
    'ref ', 'referencia', 'asset_id', 'descuento', 'rentabilidad', 'scoring'];

  const needsAssets = assetKeywords.some(k => lastMsg.includes(k));

  const filters: any = {};

  // Try to detect province
  const provincias = ['madrid', 'barcelona', 'valencia', 'sevilla', 'málaga', 'malaga', 'alicante', 'zaragoza',
    'murcia', 'palma', 'bilbao', 'córdoba', 'cordoba', 'valladolid', 'vigo', 'gijón', 'gijon',
    'granada', 'cádiz', 'cadiz', 'toledo', 'badajoz', 'tarragona', 'león', 'leon', 'pontevedra',
    'burgos', 'salamanca', 'huelva', 'logroño', 'almería', 'almeria', 'castellón', 'castellon',
    'guadalajara', 'albacete', 'ciudad real', 'caceres', 'cáceres', 'jaén', 'jaen', 'ourense',
    'lugo', 'huesca', 'teruel', 'segovia', 'soria', 'ávila', 'avila', 'zamora', 'palencia',
    'cuenca', 'asturias', 'cantabria', 'navarra', 'la rioja', 'baleares', 'tenerife', 'las palmas',
    'a coruña', 'coruña', 'girona', 'lleida', 'vizcaya', 'guipúzcoa', 'álava'];
  for (const p of provincias) {
    if (lastMsg.includes(p)) {
      filters.provincia = p;
      break;
    }
  }

  // Try to detect asset type
  const tipos: Record<string, string> = {
    'vivienda': 'vivienda', 'piso': 'vivienda', 'apartamento': 'vivienda', 'casa': 'vivienda',
    'local': 'local', 'comercial': 'local', 'oficina': 'oficina',
    'garaje': 'garaje', 'parking': 'garaje', 'plaza de garaje': 'garaje',
    'terreno': 'terreno', 'suelo': 'suelo', 'solar': 'suelo',
    'nave': 'nave', 'industrial': 'industrial', 'trastero': 'trastero',
  };
  for (const [key, val] of Object.entries(tipos)) {
    if (lastMsg.includes(key)) {
      filters.tipo_activo = val;
      break;
    }
  }

  // Detect specific asset reference
  const refMatch = lastMsg.match(/(?:ref|referencia|asset[_\s]?id)[:\s]*([a-zA-Z0-9\-_]+)/i);
  if (refMatch) {
    filters.asset_id = refMatch[1];
    return { needsAssets: true, filters };
  }

  // Determine limit based on query type
  if (lastMsg.includes('mejor') || lastMsg.includes('top') || lastMsg.includes('recomienda')) {
    filters.limit = 10;
  } else if (lastMsg.includes('todos') || lastMsg.includes('cartera') || lastMsg.includes('portafolio')) {
    filters.limit = 30;
  } else {
    filters.limit = 15;
  }

  return { needsAssets, filters };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Detect if the query needs asset data
    const { needsAssets, filters } = detectAssetQuery(messages);
    let assetContext = '';

    if (needsAssets) {
      console.log('Fetching NPL assets with filters:', JSON.stringify(filters));
      const assets = await fetchNplAssets(filters);
      console.log(`Found ${assets.length} assets`);
      assetContext = formatAssetsContext(assets);
    }

    let systemMessage: string;
    if (needsAssets && assetContext.includes('No se encontraron')) {
      systemMessage = `${SYSTEM_PROMPT}\n\n⚠️ RESULTADO DE BÚSQUEDA EN BASE DE DATOS: No se encontraron activos con los criterios del usuario. NO INVENTES ACTIVOS. Dile al usuario que no hay activos disponibles con esos criterios y ofrécele crear una alerta o buscar con otros filtros.`;
    } else if (assetContext) {
      systemMessage = `${SYSTEM_PROMPT}\n\nTienes acceso a los siguientes activos REALES de la cartera de IKESA. Usa SOLO estos datos. NO inventes activos adicionales:${assetContext}`;
    } else {
      systemMessage = `${SYSTEM_PROMPT}\n\n⚠️ No se ha consultado la base de datos de activos. Si el usuario pregunta por activos concretos, NO inventes datos. Responde con información general y ofrece buscar en la cartera.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos agotados. Contacta con soporte.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(JSON.stringify({ error: 'Error del servicio de IA' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI advisor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
