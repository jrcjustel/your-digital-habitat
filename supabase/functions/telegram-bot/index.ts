const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TELEGRAM_API = 'https://api.telegram.org/bot';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }
    const TELEGRAM_CHANNEL_ID = Deno.env.get('TELEGRAM_CHANNEL_ID');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json();

    // Check if this is a Telegram webhook update
    if (body.update_id !== undefined) {
      return await handleWebhookUpdate(body, TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Otherwise it's an internal API call
    const { action, ...params } = body;

    switch (action) {
      case 'send_message': {
        const { chat_id, text, parse_mode = 'HTML' } = params;
        if (!chat_id || !text) throw new Error('Missing chat_id or text');

        const data = await telegramApiCall(TELEGRAM_BOT_TOKEN, 'sendMessage', {
          chat_id, text, parse_mode,
        });

        return jsonResponse({ success: true, data });
      }

      case 'send_to_channel': {
        if (!TELEGRAM_CHANNEL_ID) throw new Error('TELEGRAM_CHANNEL_ID not configured');
        const { text, parse_mode = 'HTML' } = params;
        if (!text) throw new Error('Missing text');

        const data = await telegramApiCall(TELEGRAM_BOT_TOKEN, 'sendMessage', {
          chat_id: TELEGRAM_CHANNEL_ID, text, parse_mode,
        });

        return jsonResponse({ success: true, data });
      }

      case 'broadcast': {
        const { text, segments } = params;
        if (!text) throw new Error('Missing text');

        // Fetch active Telegram subscribers
        let url = `${SUPABASE_URL}/rest/v1/channel_subscribers?channel=eq.telegram&is_active=eq.true&select=external_id,display_name,segments`;
        if (segments?.length) {
          url += `&segments=ov.{${segments.join(',')}}`;
        }

        const subsRes = await fetch(url, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        });
        const subscribers = await subsRes.json();
        console.log(`Broadcasting to ${subscribers.length} Telegram subscribers`);

        let sentCount = 0;
        let failedCount = 0;

        for (const sub of subscribers) {
          if (!sub.external_id) continue;
          try {
            await telegramApiCall(TELEGRAM_BOT_TOKEN, 'sendMessage', {
              chat_id: sub.external_id,
              text,
              parse_mode: 'HTML',
            });
            sentCount++;
            // Telegram rate limit: 30 msgs/second
            await new Promise(r => setTimeout(r, 40));
          } catch (e) {
            failedCount++;
            console.error(`Failed to send to ${sub.external_id}:`, e);
          }
        }

        // Also send to channel if configured
        if (TELEGRAM_CHANNEL_ID) {
          try {
            await telegramApiCall(TELEGRAM_BOT_TOKEN, 'sendMessage', {
              chat_id: TELEGRAM_CHANNEL_ID, text, parse_mode: 'HTML',
            });
          } catch (e) {
            console.error('Failed to send to channel:', e);
          }
        }

        // Log broadcast
        await fetch(`${SUPABASE_URL}/rest/v1/broadcast_messages`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            channel: 'telegram',
            content: text,
            sent_count: sentCount,
            failed_count: failedCount,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }),
        });

        return jsonResponse({ success: true, sent: sentCount, failed: failedCount });
      }

      case 'set_webhook': {
        // Set the Telegram webhook URL
        const { url } = params;
        if (!url) throw new Error('Missing webhook url');
        const data = await telegramApiCall(TELEGRAM_BOT_TOKEN, 'setWebhook', { url });
        return jsonResponse({ success: true, data });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Telegram bot error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle incoming Telegram webhook updates (messages from users)
async function handleWebhookUpdate(
  update: any,
  botToken: string,
  supabaseUrl: string,
  serviceKey: string
) {
  const message = update.message;
  if (!message?.text) {
    return new Response('ok', { status: 200 });
  }

  const chatId = message.chat.id.toString();
  const text = message.text;
  const firstName = message.from?.first_name || 'Usuario';

  // Handle /start command — register subscriber
  if (text === '/start') {
    // Upsert subscriber
    await fetch(`${supabaseUrl}/rest/v1/channel_subscribers`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        channel: 'telegram',
        external_id: chatId,
        display_name: firstName,
        is_active: true,
      }),
    });

    await telegramApiCall(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `¡Hola ${firstName}! 👋

Bienvenido al bot de <b>IKESA Inmobiliaria</b>.

Puedes usar estos comandos:

/activos — Ver últimos activos disponibles
/alertas — Configurar alertas de inversión
/ayuda — Más información

¿En qué puedo ayudarte?`,
      parse_mode: 'HTML',
    });

    return new Response('ok', { status: 200 });
  }

  // Handle /activos command — show latest assets
  if (text === '/activos' || text.startsWith('/activos')) {
    const assetsRes = await fetch(
      `${supabaseUrl}/rest/v1/npl_assets?publicado=eq.true&select=asset_id,tipo_activo,municipio,provincia,precio_orientativo,valor_mercado,sqm,estado_ocupacional&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );
    const assets = await assetsRes.json();

    if (!assets.length) {
      await telegramApiCall(botToken, 'sendMessage', {
        chat_id: chatId,
        text: 'No hay activos publicados en este momento. Te avisaremos cuando haya nuevas oportunidades.',
        parse_mode: 'HTML',
      });
    } else {
      let msg = '🏠 <b>Últimos activos IKESA:</b>\n\n';
      for (const a of assets) {
        const discount = a.valor_mercado && a.precio_orientativo
          ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100)
          : null;
        msg += `📍 <b>${a.tipo_activo || 'Activo'}</b> — ${a.municipio || ''}, ${a.provincia || ''}\n`;
        msg += `   💰 ${a.precio_orientativo?.toLocaleString('es-ES') || 'N/A'} € `;
        if (discount && discount > 0) msg += `(-${discount}%) `;
        msg += `| ${a.sqm || '?'} m²\n`;
        msg += `   Estado: ${a.estado_ocupacional || 'N/A'}\n\n`;
      }
      msg += '🔗 Visita ikesa.es para ver más detalles y análisis completos.';

      await telegramApiCall(botToken, 'sendMessage', {
        chat_id: chatId, text: msg, parse_mode: 'HTML',
      });
    }

    return new Response('ok', { status: 200 });
  }

  // Handle /alertas
  if (text === '/alertas') {
    await telegramApiCall(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '🔔 <b>Alertas de inversión</b>\n\nEstás suscrito a nuestras alertas. Recibirás notificaciones cuando se publiquen nuevos activos.\n\nPara gestionar alertas avanzadas, visita tu panel en ikesa.es',
      parse_mode: 'HTML',
    });
    return new Response('ok', { status: 200 });
  }

  // Handle /ayuda or /help
  if (text === '/ayuda' || text === '/help') {
    await telegramApiCall(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `ℹ️ <b>Bot IKESA - Ayuda</b>\n\n/activos — Ver últimos activos NPL\n/alertas — Info sobre alertas\n/ayuda — Este mensaje\n\nTambién puedes escribir el nombre de una provincia para buscar activos en esa zona.\n\n🌐 Web: ikesa.es\n📱 WhatsApp: wa.me/34600000000`,
      parse_mode: 'HTML',
    });
    return new Response('ok', { status: 200 });
  }

  // Free text — try to find assets by province
  const provincias = ['madrid', 'barcelona', 'valencia', 'sevilla', 'málaga', 'malaga', 'alicante',
    'zaragoza', 'murcia', 'cádiz', 'cadiz', 'toledo', 'granada', 'córdoba', 'cordoba',
    'huelva', 'almería', 'jaén', 'badajoz', 'cáceres'];
  const matchedProv = provincias.find(p => text.toLowerCase().includes(p));

  if (matchedProv) {
    const assetsRes = await fetch(
      `${supabaseUrl}/rest/v1/npl_assets?publicado=eq.true&provincia=ilike.*${encodeURIComponent(matchedProv)}*&select=asset_id,tipo_activo,municipio,provincia,precio_orientativo,valor_mercado,sqm&order=precio_orientativo.asc&limit=5`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );
    const assets = await assetsRes.json();

    if (!assets.length) {
      await telegramApiCall(botToken, 'sendMessage', {
        chat_id: chatId,
        text: `No encontré activos en ${matchedProv}. Prueba con /activos para ver todos los disponibles.`,
      });
    } else {
      let msg = `🔍 <b>Activos en ${matchedProv}:</b>\n\n`;
      for (const a of assets) {
        msg += `• ${a.tipo_activo || 'Activo'} en ${a.municipio || matchedProv} — ${a.precio_orientativo?.toLocaleString('es-ES') || 'N/A'} € | ${a.sqm || '?'} m²\n`;
      }
      msg += '\n🔗 Más detalles en ikesa.es';
      await telegramApiCall(botToken, 'sendMessage', {
        chat_id: chatId, text: msg, parse_mode: 'HTML',
      });
    }
    return new Response('ok', { status: 200 });
  }

  // Default response
  await telegramApiCall(botToken, 'sendMessage', {
    chat_id: chatId,
    text: `Gracias por tu mensaje, ${firstName}. Usa /activos para ver oportunidades o /ayuda para más opciones.\n\nSi necesitas atención personalizada, contacta por WhatsApp: wa.me/34600000000`,
  });

  return new Response('ok', { status: 200 });
}

async function telegramApiCall(token: string, method: string, params: any) {
  const res = await fetch(`${TELEGRAM_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Telegram API error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
      'Content-Type': 'application/json',
    },
  });
}
