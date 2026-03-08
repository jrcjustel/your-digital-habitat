
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

    const body = await req.json().catch(() => ({}));
    const task = body.task || 'all';
    const results: Record<string, any> = {};

    const headers = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    };

    // ─── 1. REFRESH LEAD SCORES ───
    if (task === 'all' || task === 'lead_scoring') {
      console.log('Starting lead scoring refresh...');
      const profilesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=user_id`,
        { headers }
      );
      const profiles = await profilesRes.json();
      let scored = 0;

      for (const p of profiles) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/refresh_profile_stats`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_user_id: p.user_id }),
          }
        );
        scored++;
      }
      results.lead_scoring = { profiles_scored: scored };
      console.log(`Lead scoring: ${scored} profiles refreshed`);
    }

    // ─── 2. AUTO-MATCH NEW ASSETS ───
    if (task === 'all' || task === 'matching') {
      console.log('Starting investor-asset matching...');
      // Get assets published in the last 24h without matches
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const assetsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&created_at=gte.${encodeURIComponent(since)}&select=id`,
        { headers }
      );
      const assets = await assetsRes.json();
      let totalMatches = 0;

      for (const a of assets) {
        const matchRes = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/match_investors_to_asset`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_asset_id: a.id }),
          }
        );
        const count = await matchRes.json();
        totalMatches += (typeof count === 'number' ? count : 0);
      }
      results.matching = { assets_processed: assets.length, matches_created: totalMatches };
      console.log(`Matching: ${assets.length} assets → ${totalMatches} matches`);
    }

    // ─── 3. ANALYTICS SNAPSHOT ───
    if (task === 'all' || task === 'analytics_snapshot') {
      console.log('Creating analytics snapshot...');

      const [assetsR, pubR, usersR, offersR, pendR, leadsR, subsR, scoresR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/npl_assets?select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/offers?select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/offers?status=eq.pending&select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/valuation_leads?select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/channel_subscribers?is_active=eq.true&select=id`, { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=lead_score&lead_score=gt.0`, { headers }),
      ]);

      const getCount = (r: Response) => parseInt(r.headers.get('content-range')?.split('/')[1] || '0');
      const totalAssets = getCount(assetsR);
      const publishedAssets = getCount(pubR);
      const totalUsers = getCount(usersR);
      const totalOffers = getCount(offersR);
      const pendingOffers = getCount(pendR);
      const totalLeads = getCount(leadsR);
      const totalSubscribers = getCount(subsR);

      const scores = await scoresR.json();
      const avgLeadScore = scores.length > 0
        ? Math.round(scores.reduce((s: number, p: any) => s + (p.lead_score || 0), 0) / scores.length)
        : 0;

      // Assets by type
      const typeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&select=tipo_activo`, { headers }
      );
      const typeData = await typeRes.json();
      const assetsByType: Record<string, number> = {};
      typeData.forEach((a: any) => {
        const t = a.tipo_activo || 'Sin tipo';
        assetsByType[t] = (assetsByType[t] || 0) + 1;
      });

      // Assets by province
      const provRes = await fetch(
        `${SUPABASE_URL}/rest/v1/npl_assets?publicado=eq.true&select=provincia`, { headers }
      );
      const provData = await provRes.json();
      const assetsByProvince: Record<string, number> = {};
      provData.forEach((a: any) => {
        const p = a.provincia || 'Desconocida';
        assetsByProvince[p] = (assetsByProvince[p] || 0) + 1;
      });

      // Offers by status
      const offerStatusRes = await fetch(
        `${SUPABASE_URL}/rest/v1/offers?select=status`, { headers }
      );
      const offerStatusData = await offerStatusRes.json();
      const offersByStatus: Record<string, number> = {};
      offerStatusData.forEach((o: any) => {
        offersByStatus[o.status] = (offersByStatus[o.status] || 0) + 1;
      });

      const acceptedOffers = offersByStatus['accepted'] || 0;
      const conversionRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 1000) / 10 : 0;

      // Upsert snapshot
      const today = new Date().toISOString().split('T')[0];
      await fetch(
        `${SUPABASE_URL}/rest/v1/analytics_snapshots`,
        {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({
            snapshot_date: today,
            total_assets: totalAssets,
            published_assets: publishedAssets,
            total_users: totalUsers,
            total_offers: totalOffers,
            pending_offers: pendingOffers,
            total_leads: totalLeads,
            total_subscribers: totalSubscribers,
            avg_lead_score: avgLeadScore,
            assets_by_type: assetsByType,
            assets_by_province: assetsByProvince,
            offers_by_status: offersByStatus,
            conversion_rate: conversionRate,
          }),
        }
      );

      results.analytics_snapshot = {
        date: today,
        total_assets: totalAssets,
        published_assets: publishedAssets,
        total_users: totalUsers,
        total_offers: totalOffers,
        avg_lead_score: avgLeadScore,
        conversion_rate: conversionRate,
      };
      console.log('Analytics snapshot created:', JSON.stringify(results.analytics_snapshot));
    }

    // ─── 4. STALE LEAD ALERTS ───
    if (task === 'all' || task === 'stale_alerts') {
      console.log('Checking stale leads...');
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const staleRes = await fetch(
        `${SUPABASE_URL}/rest/v1/valuation_leads?estado=is.null&created_at=lte.${encodeURIComponent(threeDaysAgo)}&select=id`,
        { headers: { ...headers, 'Prefer': 'count=exact' }, method: 'HEAD' }
      );
      const staleCount = parseInt(staleRes.headers.get('content-range')?.split('/')[1] || '0');

      if (staleCount > 0) {
        // Log activity for admin visibility
        await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            entity_type: 'system',
            action: 'stale_leads_detected',
            metadata: { count: staleCount, threshold_days: 3 },
          }),
        });
      }
      results.stale_alerts = { stale_leads: staleCount };
      console.log(`Stale leads: ${staleCount} found`);
    }

    return new Response(JSON.stringify({ success: true, task, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scheduled task error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
