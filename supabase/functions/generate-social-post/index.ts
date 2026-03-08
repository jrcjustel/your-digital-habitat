const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { channel, asset, custom_prompt } = await req.json();

    const channelInstructions: Record<string, string> = {
      twitter: 'Twitter/X: Máximo 280 caracteres. Usa emojis estratégicamente. Incluye 2-3 hashtags relevantes (#InversionInmobiliaria #NPL #Oportunidad). Tono directo y llamativo. Incluye CTA breve.',
      telegram: 'Telegram: Formato HTML (<b>negrita</b>, <i>cursiva</i>). Mensaje más extenso (500-800 chars). Usa emojis como separadores visuales. Incluye toda la info relevante del activo. CTA con enlace.',
      whatsapp: 'WhatsApp: Formato con *negrita* y _cursiva_. Mensaje medio (300-500 chars). Emojis moderados. Estructura clara con líneas separadas. CTA directo.',
      linkedin: 'LinkedIn: Tono profesional e institucional. 500-1000 chars. Sin emojis excesivos (máx 3-4). Enfoque en datos de mercado, rentabilidad y oportunidad de inversión. Incluye hashtags profesionales (#RealEstate #NPL #InvestmentOpportunity). Párrafos cortos.',
      instagram: 'Instagram: Caption de 300-600 chars. Emojis abundantes y visuales. Hashtags al final (8-15 hashtags relevantes: #InversionInmobiliaria #NPL #RealEstate #Oportunidad #Inmuebles #España). Primera línea gancho. Incluye CTA tipo "Link en bio 👆".',
      tiktok: 'TikTok: Caption corto de 100-200 chars. Tono informal y directo. Emojis llamativos. 3-5 hashtags trending (#inversión #inmobiliaria #oportunidad #fyp #parati). Incluye gancho tipo "¿Sabías que...?" o "POV:".',
      facebook: 'Facebook: Post de 200-500 chars. Tono cercano pero profesional. Emojis moderados. Pregunta al público para generar engagement. Incluye CTA claro hacia ikesa.es. 2-3 hashtags.',
    };

    let assetContext = '';
    if (asset) {
      const discount = asset.valor_mercado && asset.precio_orientativo
        ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
        : null;
      const pricePerSqm = asset.sqm && asset.precio_orientativo
        ? Math.round(asset.precio_orientativo / asset.sqm)
        : null;

      assetContext = `
DATOS DEL ACTIVO:
- Tipo: ${asset.tipo_activo || 'Inmueble'}
- Ubicación: ${asset.municipio || ''}, ${asset.provincia || ''} (${asset.comunidad_autonoma || ''})
- Precio orientativo: ${asset.precio_orientativo?.toLocaleString('es-ES') || 'Consultar'} €
- Valor de mercado: ${asset.valor_mercado?.toLocaleString('es-ES') || 'N/A'} €
- Descuento: ${discount ? discount + '%' : 'N/A'}
- Superficie: ${asset.sqm || '?'} m²
- €/m²: ${pricePerSqm?.toLocaleString('es-ES') || 'N/A'}
- Estado ocupacional: ${asset.estado_ocupacional || 'N/A'}
- Cesión remate: ${asset.cesion_remate ? 'Sí' : 'No'}
- Cesión crédito: ${asset.cesion_credito ? 'Sí' : 'No'}
- Año construcción: ${asset.anio_construccion || 'N/A'}`;
    }

    const systemPrompt = `Eres el social media manager de IKESA, una plataforma española líder en inversión inmobiliaria alternativa especializada en activos NPL (Non-Performing Loans), cesiones de remate, subastas BOE y activos ocupados.

Tu objetivo es crear contenido que:
1. Genere interés y urgencia en inversores profesionales
2. Destaque el descuento sobre valor de mercado
3. Sea profesional pero accesible
4. Incluya datos concretos (precio, descuento, ubicación, m²)
5. Dirija tráfico a ikesa.es

IMPORTANTE: Solo genera el texto del post, sin explicaciones ni comentarios adicionales.
Web: ikesa.es | WhatsApp: wa.me/34600000000`;

    const userPrompt = custom_prompt
      ? `${channelInstructions[channel] || channelInstructions.twitter}\n\n${assetContext}\n\nInstrucciones adicionales: ${custom_prompt}`
      : `${channelInstructions[channel] || channelInstructions.twitter}\n\n${assetContext}\n\nGenera un post atractivo para este activo.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de peticiones excedido, intenta de nuevo en unos segundos.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA agotados.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      throw new Error('Error del servicio de IA');
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content: generatedContent.trim(), channel }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate social post error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
