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

## INSTRUCCIONES DE COMPORTAMIENTO:
1. Responde SIEMPRE en español
2. Sé preciso con datos fiscales, indicando siempre la CCAA
3. Pregunta si es persona física o jurídica cuando sea relevante
4. Incluye disclaimers en información legal/fiscal
5. Usa markdown con tablas cuando sea apropiado
6. Sé proactivo sugiriendo aspectos no considerados
7. Da rangos realistas del mercado español 2025-2026`;

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

    const systemMessage = assetContext
      ? `${SYSTEM_PROMPT}\n\nTienes acceso a los siguientes activos reales de la cartera de IKESA. Usa estos datos para dar recomendaciones personalizadas y análisis detallados:${assetContext}`
      : SYSTEM_PROMPT;

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
