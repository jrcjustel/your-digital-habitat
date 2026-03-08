const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN');
    if (!WHATSAPP_TOKEN) {
      throw new Error('WHATSAPP_TOKEN is not configured');
    }
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID');
    if (!WHATSAPP_PHONE_ID) {
      throw new Error('WHATSAPP_PHONE_ID is not configured');
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'send_message': {
        // Send a text message to a single recipient
        const { to, message } = params;
        if (!to || !message) throw new Error('Missing "to" or "message" params');

        const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: true, body: message },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('WhatsApp API error:', JSON.stringify(data));
          throw new Error(`WhatsApp API error [${res.status}]: ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send_template': {
        // Send a template message (for broadcasts)
        const { to, template_name, language = 'es', components = [] } = params;
        if (!to || !template_name) throw new Error('Missing "to" or "template_name" params');

        const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: template_name,
              language: { code: language },
              components,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('WhatsApp template error:', JSON.stringify(data));
          throw new Error(`WhatsApp template error [${res.status}]: ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'broadcast': {
        // Broadcast to all active WhatsApp subscribers
        const { message, template_name, segments } = params;
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Fetch active subscribers
        let url = `${SUPABASE_URL}/rest/v1/channel_subscribers?channel=eq.whatsapp&is_active=eq.true&select=external_id,display_name,segments`;
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
        console.log(`Broadcasting to ${subscribers.length} WhatsApp subscribers`);

        let sentCount = 0;
        let failedCount = 0;

        for (const sub of subscribers) {
          if (!sub.external_id) continue;
          try {
            const payload: any = {
              messaging_product: 'whatsapp',
              to: sub.external_id,
            };

            if (template_name) {
              payload.type = 'template';
              payload.template = { name: template_name, language: { code: 'es' } };
            } else {
              payload.type = 'text';
              payload.text = { preview_url: true, body: message };
            }

            const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              sentCount++;
            } else {
              failedCount++;
              const errData = await res.json();
              console.error(`Failed to send to ${sub.external_id}:`, JSON.stringify(errData));
            }

            // Rate limit: max 80 msgs/second for WhatsApp Business
            await new Promise(r => setTimeout(r, 50));
          } catch (e) {
            failedCount++;
            console.error(`Error sending to ${sub.external_id}:`, e);
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
            channel: 'whatsapp',
            content: message || template_name,
            sent_count: sentCount,
            failed_count: failedCount,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }),
        });

        return new Response(JSON.stringify({ success: true, sent: sentCount, failed: failedCount }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('WhatsApp function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
