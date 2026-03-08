// This function is called via cron or manually when new assets are published.
// It broadcasts new NPL assets to all active subscribers on WhatsApp and Telegram channels.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get assets published in the last hour (for cron) or custom timeframe
    const body = await req.json().catch(() => ({}));
    const hoursBack = body.hours_back || 1;
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const assetsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&created_at=gte.${encodeURIComponent(since)}&select=asset_id,tipo_activo,municipio,provincia,precio_orientativo,valor_mercado,sqm,estado_ocupacional,cesion_remate,cesion_credito&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const newAssets = await assetsRes.json();

    if (!newAssets.length) {
      console.log('No new assets to broadcast');
      return new Response(JSON.stringify({ success: true, message: 'No new assets' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${newAssets.length} new assets to broadcast`);

    // Build message
    const telegramMsg = buildTelegramMessage(newAssets);
    const whatsappMsg = buildWhatsAppMessage(newAssets);

    const results: any = { telegram: null, whatsapp: null };

    // Send to Telegram
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (TELEGRAM_BOT_TOKEN) {
      try {
        const telegramRes = await fetch(`${SUPABASE_URL}/functions/v1/telegram-bot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'broadcast', text: telegramMsg }),
        });
        results.telegram = await telegramRes.json();
        console.log('Telegram broadcast result:', JSON.stringify(results.telegram));
      } catch (e) {
        console.error('Telegram broadcast failed:', e);
        results.telegram = { error: String(e) };
      }
    }

    // Send to WhatsApp
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN');
    if (WHATSAPP_TOKEN) {
      try {
        const waRes = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'broadcast', message: whatsappMsg }),
        });
        results.whatsapp = await waRes.json();
        console.log('WhatsApp broadcast result:', JSON.stringify(results.whatsapp));
      } catch (e) {
        console.error('WhatsApp broadcast failed:', e);
        results.whatsapp = { error: String(e) };
      }
    }

    return new Response(JSON.stringify({ success: true, assets_count: newAssets.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildTelegramMessage(assets: any[]): string {
  let msg = `🚨 <b>¡${assets.length} nuevo${assets.length > 1 ? 's' : ''} activo${assets.length > 1 ? 's' : ''} en IKESA!</b>\n\n`;

  for (const a of assets) {
    const discount = a.valor_mercado && a.precio_orientativo
      ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
      : null;

    msg += `🏠 <b>${a.tipo_activo || 'Activo'}</b> — ${a.municipio || ''}, ${a.provincia || ''}\n`;
    msg += `💰 ${a.precio_orientativo?.toLocaleString('es-ES') || 'Consultar'} €`;
    if (discount && discount > 0) msg += ` <b>(-${discount}%)</b>`;
    msg += `\n`;
    msg += `📐 ${a.sqm || '?'} m² | ${a.estado_ocupacional || 'N/A'}`;
    if (a.cesion_remate) msg += ' | ⚖️ Cesión remate';
    if (a.cesion_credito) msg += ' | 📄 Cesión crédito';
    msg += `\n\n`;
  }

  msg += `🔗 <b>Ver todos en ikesa.es/inmuebles</b>\n`;
  msg += `💬 WhatsApp: wa.me/34600000000`;

  return msg;
}

function buildWhatsAppMessage(assets: any[]): string {
  let msg = `🚨 *¡${assets.length} nuevo${assets.length > 1 ? 's' : ''} activo${assets.length > 1 ? 's' : ''} en IKESA!*\n\n`;

  for (const a of assets) {
    const discount = a.valor_mercado && a.precio_orientativo
      ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
      : null;

    msg += `🏠 *${a.tipo_activo || 'Activo'}* — ${a.municipio || ''}, ${a.provincia || ''}\n`;
    msg += `💰 ${a.precio_orientativo?.toLocaleString('es-ES') || 'Consultar'} €`;
    if (discount && discount > 0) msg += ` *(-${discount}%)*`;
    msg += `\n📐 ${a.sqm || '?'} m²\n\n`;
  }

  msg += `🔗 Ver más en ikesa.es`;

  return msg;
}
