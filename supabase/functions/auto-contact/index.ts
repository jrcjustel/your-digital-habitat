const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { 
      lead_name, lead_email, lead_phone, channel, asset_id, asset_reference,
      provincia, comunidad_autonoma, message, user_id 
    } = await req.json();

    // 1. Find the assigned gestor by zone
    let gestorQuery = supabase.from('gestores').select('*').eq('is_active', true);
    
    let gestor = null;
    if (provincia) {
      const { data: gestores } = await gestorQuery;
      gestor = gestores?.find((g: any) => 
        g.provincias?.includes(provincia) || 
        g.comunidades_autonomas?.includes(comunidad_autonoma)
      );
      // Fallback to any active gestor
      if (!gestor && gestores?.length) gestor = gestores[0];
    } else {
      const { data: gestores } = await gestorQuery;
      if (gestores?.length) gestor = gestores[0];
    }

    // 2. Fetch asset data if available
    let assetInfo = '';
    if (asset_id) {
      const { data: asset } = await supabase
        .from('npl_assets')
        .select('asset_id, tipo_activo, municipio, provincia, precio_orientativo, valor_mercado, estado_ocupacional, cesion_remate, cesion_credito')
        .eq('id', asset_id)
        .single();
      if (asset) {
        assetInfo = `\n\nDatos del activo de interés:
- Ref: ${asset.asset_id || 'N/A'}
- Tipo: ${asset.tipo_activo || 'N/A'}
- Ubicación: ${asset.municipio || ''}, ${asset.provincia || ''}
- Precio orientativo: ${asset.precio_orientativo ? asset.precio_orientativo.toLocaleString('es-ES') + ' €' : 'N/A'}
- Valor mercado: ${asset.valor_mercado ? asset.valor_mercado.toLocaleString('es-ES') + ' €' : 'N/A'}
- Ocupación: ${asset.estado_ocupacional || 'N/A'}
- Cesión remate: ${asset.cesion_remate ? 'Sí' : 'No'}
- Cesión crédito: ${asset.cesion_credito ? 'Sí' : 'No'}`;
      }
    }

    // 3. Generate AI auto-response
    const systemPrompt = `Eres un asesor comercial de IKESA Inmobiliaria Real. Un lead ha contactado y debes enviarle una respuesta profesional, cercana y orientada a cerrar una reunión o avanzar en el proceso.

Tu respuesta debe:
1. Agradecer su interés
2. Mencionar brevemente el activo si hay datos disponibles
3. Informar que un gestor especializado en su zona le contactará en breve
4. Ofrecer información adicional útil sobre el proceso de inversión
5. Incluir un CTA para agendar una llamada o reunión

${gestor ? `El gestor asignado es: ${gestor.nombre} (${gestor.email})` : 'Se asignará un gestor en breve.'}
${assetInfo}

Responde en español, en formato profesional pero cercano. Máximo 300 palabras.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Canal: ${channel}\nNombre: ${lead_name || 'No proporcionado'}\nEmail: ${lead_email || 'No proporcionado'}\nTeléfono: ${lead_phone || 'No proporcionado'}\nMensaje: ${message || 'Interesado en el activo'}` },
        ],
      }),
    });

    let aiText = 'Gracias por tu interés. Un asesor especializado se pondrá en contacto contigo en breve.';
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiText = aiData.choices?.[0]?.message?.content || aiText;
    }

    // 4. Log the contact
    const { data: contactLog } = await supabase.from('contact_log').insert({
      lead_name,
      lead_email,
      lead_phone,
      channel: channel || 'web',
      asset_id: asset_id || null,
      asset_reference: asset_reference || null,
      provincia,
      comunidad_autonoma,
      message,
      ai_response: aiText,
      gestor_id: gestor?.id || null,
      gestor_notified: false,
      user_id: user_id || null,
      status: 'new',
    }).select('id').single();

    // 5. Notify the assigned manager (log + would send email/WhatsApp in production)
    if (gestor) {
      // Log activity
      await supabase.from('activity_log').insert({
        action: 'contact_received',
        entity_type: 'contact_log',
        entity_id: contactLog?.id || null,
        user_id: user_id || null,
        metadata: {
          channel,
          lead_name,
          lead_email,
          gestor_nombre: gestor.nombre,
          gestor_email: gestor.email,
          asset_reference: asset_reference || asset_id,
        },
      });

      // Mark as notified
      if (contactLog?.id) {
        await supabase.from('contact_log').update({
          gestor_notified: true,
          gestor_notified_at: new Date().toISOString(),
        }).eq('id', contactLog.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      ai_response: aiText,
      gestor: gestor ? { nombre: gestor.nombre, email: gestor.email } : null,
      contact_id: contactLog?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auto-contact error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Error desconocido',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
