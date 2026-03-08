
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AlertFilters {
  comunidad_autonoma?: string;
  provincia?: string;
  municipio?: string;
  tipo_venta?: string;
  tipo_activo?: string;
  precio_min?: number;
  precio_max?: number;
}

interface NplAsset {
  id: string;
  comunidad_autonoma?: string;
  provincia?: string;
  municipio?: string;
  tipo_activo?: string;
  precio_orientativo?: number;
  cesion_credito?: boolean;
  cesion_remate?: boolean;
  postura_subasta?: boolean;
  asset_id?: string;
  sqm?: number;
  valor_mercado?: number;
}

function doesAlertMatch(filters: AlertFilters, asset: NplAsset): { matches: boolean; criteria: Record<string, boolean> } {
  const criteria: Record<string, boolean> = {};
  let hasAnyFilter = false;
  let allMatch = true;

  // Community match
  if (filters.comunidad_autonoma) {
    hasAnyFilter = true;
    const match = asset.comunidad_autonoma?.toLowerCase() === filters.comunidad_autonoma.toLowerCase();
    criteria.ccaa_match = !!match;
    if (!match) allMatch = false;
  }

  // Province match
  if (filters.provincia) {
    hasAnyFilter = true;
    const match = asset.provincia?.toLowerCase() === filters.provincia.toLowerCase();
    criteria.provincia_match = !!match;
    if (!match) allMatch = false;
  }

  // Municipality match
  if (filters.municipio) {
    hasAnyFilter = true;
    const match = asset.municipio?.toLowerCase().includes(filters.municipio.toLowerCase());
    criteria.municipio_match = !!match;
    if (!match) allMatch = false;
  }

  // Sale type match
  if (filters.tipo_venta) {
    hasAnyFilter = true;
    let match = false;
    if (filters.tipo_venta === 'cesion_credito' && asset.cesion_credito) match = true;
    if (filters.tipo_venta === 'cesion_remate' && asset.cesion_remate) match = true;
    if (filters.tipo_venta === 'compraventa' && !asset.cesion_credito && !asset.cesion_remate && !asset.postura_subasta) match = true;
    if (filters.tipo_venta === 'postura_subasta' && asset.postura_subasta) match = true;
    criteria.tipo_venta_match = match;
    if (!match) allMatch = false;
  }

  // Asset type match
  if (filters.tipo_activo) {
    hasAnyFilter = true;
    const match = asset.tipo_activo?.toLowerCase() === filters.tipo_activo.toLowerCase();
    criteria.tipo_activo_match = !!match;
    if (!match) allMatch = false;
  }

  // Price range match
  if (filters.precio_min !== undefined && filters.precio_min > 0) {
    hasAnyFilter = true;
    const match = (asset.precio_orientativo || 0) >= filters.precio_min;
    criteria.precio_min_match = match;
    if (!match) allMatch = false;
  }

  if (filters.precio_max !== undefined && filters.precio_max > 0) {
    hasAnyFilter = true;
    const match = (asset.precio_orientativo || 0) <= filters.precio_max;
    criteria.precio_max_match = match;
    if (!match) allMatch = false;
  }

  return { matches: hasAnyFilter && allMatch, criteria };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json().catch(() => ({}));
    const { asset_id, hours_back } = body;

    // Get assets to check - either a specific one or recently published
    let assetsUrl = `${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&select=*`;
    if (asset_id) {
      assetsUrl += `&id=eq.${asset_id}`;
    } else {
      const hb = hours_back || 24;
      const since = new Date(Date.now() - hb * 60 * 60 * 1000).toISOString();
      assetsUrl += `&created_at=gte.${encodeURIComponent(since)}&limit=50`;
    }

    const headers = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };

    const assetsRes = await fetch(assetsUrl, { headers });
    const assets: NplAsset[] = await assetsRes.json();

    if (!assets.length) {
      return new Response(JSON.stringify({ success: true, message: 'No assets to match', matches: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active alerts with user emails
    const alertsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/alerts?is_active=eq.true&select=id,user_id,name,filters`,
      { headers }
    );
    const alerts = await alertsRes.json();

    if (!alerts.length) {
      return new Response(JSON.stringify({ success: true, message: 'No active alerts', matches: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Checking ${assets.length} assets against ${alerts.length} active alerts`);

    let totalMatches = 0;
    const notifications: any[] = [];

    for (const asset of assets) {
      for (const alert of alerts) {
        const filters = alert.filters as AlertFilters;
        const { matches, criteria } = doesAlertMatch(filters, asset);

        if (matches) {
          notifications.push({
            alert_id: alert.id,
            asset_id: asset.id,
            user_id: alert.user_id,
            matched_criteria: criteria,
          });
          totalMatches++;
        }
      }
    }

    // Bulk insert notifications (upsert to avoid duplicates)
    if (notifications.length > 0) {
      const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/alert_notifications?on_conflict=alert_id,asset_id`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(notifications),
        }
      );

      if (!insertRes.ok) {
        const err = await insertRes.text();
        console.error('Failed to insert notifications:', err);
      } else {
        console.log(`Inserted ${notifications.length} alert notifications`);
      }
    }

    // Collect unique user_ids that got matches for potential email
    const matchedUserIds = [...new Set(notifications.map(n => n.user_id))];
    console.log(`${matchedUserIds.length} users have matching alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        assets_checked: assets.length,
        alerts_checked: alerts.length,
        matches: totalMatches,
        users_notified: matchedUserIds.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Alert matching error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
