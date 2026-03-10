const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BoeAuction {
  ref_boe: string;
  tipo_activo: string;
  provincia: string;
  municipio: string;
  direccion: string;
  valor_subasta: number;
  valor_tasacion: number;
  fecha_subasta: string;
  fecha_conclusion: string;
  juzgado: string;
  tipo_procedimiento: string;
  fase_judicial: string;
  estado_subasta: string;
  lotes: number;
  url_detalle: string;
}

function parseSearchResultsHtml(html: string): BoeAuction[] {
  const auctions: BoeAuction[] = [];

  // BOE search results contain auction blocks with class "resultado-busqueda"
  // Each block has structured data we can extract
  const blocks = html.split(/resultado-busqueda/gi);

  for (let i = 1; i < blocks.length && i <= 50; i++) {
    const block = blocks[i];
    try {
      const auction: BoeAuction = {
        ref_boe: extractField(block, /Identificador:\s*<[^>]*>([^<]+)/i) || extractField(block, /SUB-[A-Z0-9-]+/i) || `BOE-${Date.now()}-${i}`,
        tipo_activo: extractField(block, /(?:Tipo de bien|Descripci[oó]n):\s*<[^>]*>([^<]+)/i) || inferAssetType(block),
        provincia: extractField(block, /Provincia:\s*<[^>]*>([^<]+)/i) || '',
        municipio: extractField(block, /(?:Localidad|Municipio):\s*<[^>]*>([^<]+)/i) || '',
        direccion: extractField(block, /(?:Direcci[oó]n|Ubicaci[oó]n):\s*<[^>]*>([^<]+)/i) || '',
        valor_subasta: extractAmount(block, /(?:Valor\s*subasta|Importe):\s*<[^>]*>([^<]+)/i),
        valor_tasacion: extractAmount(block, /(?:Tasaci[oó]n|Valor\s*tasaci[oó]n):\s*<[^>]*>([^<]+)/i),
        fecha_subasta: extractField(block, /(?:Fecha\s*(?:de\s*)?inicio|Inicio):\s*<[^>]*>([^<]+)/i) || '',
        fecha_conclusion: extractField(block, /(?:Fecha\s*(?:de\s*)?conclusi[oó]n|Fin):\s*<[^>]*>([^<]+)/i) || '',
        juzgado: extractField(block, /(?:Juzgado|[OÓ]rgano):\s*<[^>]*>([^<]+)/i) || '',
        tipo_procedimiento: extractField(block, /(?:Tipo\s*procedimiento|Procedimiento):\s*<[^>]*>([^<]+)/i) || 'Ejecución hipotecaria',
        fase_judicial: 'Subasta',
        estado_subasta: extractEstado(block),
        lotes: parseInt(extractField(block, /(\d+)\s*lotes?/i) || '1'),
        url_detalle: extractUrl(block),
      };

      if (auction.ref_boe && (auction.provincia || auction.valor_subasta > 0)) {
        auctions.push(auction);
      }
    } catch (e) {
      console.error(`Error parsing block ${i}:`, e);
    }
  }

  return auctions;
}

function extractField(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match ? (match[1] || match[0]).trim() : '';
}

function extractAmount(text: string, pattern: RegExp): number {
  const raw = extractField(text, pattern);
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function extractEstado(text: string): string {
  if (/celebr[aá]ndose|abierta|en\s*curso/i.test(text)) return 'Abierta';
  if (/pr[oó]xima|pendiente/i.test(text)) return 'Próxima';
  if (/finalizada|cerrada|concluida/i.test(text)) return 'Finalizada';
  if (/suspendida/i.test(text)) return 'Suspendida';
  return 'Abierta';
}

function extractUrl(text: string): string {
  const match = text.match(/href="([^"]*detalleSubasta[^"]*)"/i);
  if (match) return `https://subastas.boe.es/${match[1]}`;
  const idMatch = text.match(/id_subasta=([^&"'\s]+)/i);
  if (idMatch) return `https://subastas.boe.es/detalleSubasta.php?id_subasta=${idMatch[1]}`;
  return '';
}

function inferAssetType(text: string): string {
  const lower = text.toLowerCase();
  if (/vivienda|piso|apartamento|[aá]tico/i.test(lower)) return 'Vivienda';
  if (/local|comercial|oficina/i.test(lower)) return 'Local comercial';
  if (/garaje|parking|plaza/i.test(lower)) return 'Garaje';
  if (/terreno|solar|parcela|r[uú]stic/i.test(lower)) return 'Terreno';
  if (/nave|industrial|almac[eé]n/i.test(lower)) return 'Nave industrial';
  if (/trastero/i.test(lower)) return 'Trastero';
  return 'Inmueble';
}

function mapProvinciaToCCAA(provincia: string): string {
  const map: Record<string, string> = {
    'madrid': 'Comunidad de Madrid', 'barcelona': 'Cataluña', 'tarragona': 'Cataluña',
    'girona': 'Cataluña', 'lleida': 'Cataluña', 'valencia': 'Comunitat Valenciana',
    'alicante': 'Comunitat Valenciana', 'castellón': 'Comunitat Valenciana',
    'sevilla': 'Andalucía', 'málaga': 'Andalucía', 'granada': 'Andalucía',
    'córdoba': 'Andalucía', 'cádiz': 'Andalucía', 'jaén': 'Andalucía',
    'huelva': 'Andalucía', 'almería': 'Andalucía',
    'zaragoza': 'Aragón', 'huesca': 'Aragón', 'teruel': 'Aragón',
    'murcia': 'Región de Murcia', 'toledo': 'Castilla-La Mancha',
    'ciudad real': 'Castilla-La Mancha', 'albacete': 'Castilla-La Mancha',
    'cuenca': 'Castilla-La Mancha', 'guadalajara': 'Castilla-La Mancha',
    'valladolid': 'Castilla y León', 'burgos': 'Castilla y León',
    'león': 'Castilla y León', 'salamanca': 'Castilla y León',
    'palencia': 'Castilla y León', 'zamora': 'Castilla y León',
    'segovia': 'Castilla y León', 'ávila': 'Castilla y León', 'soria': 'Castilla y León',
    'las palmas': 'Canarias', 'santa cruz de tenerife': 'Canarias',
    'a coruña': 'Galicia', 'pontevedra': 'Galicia', 'ourense': 'Galicia', 'lugo': 'Galicia',
    'vizcaya': 'País Vasco', 'guipúzcoa': 'País Vasco', 'álava': 'País Vasco',
    'navarra': 'Comunidad Foral de Navarra', 'la rioja': 'La Rioja',
    'asturias': 'Principado de Asturias', 'cantabria': 'Cantabria',
    'baleares': 'Illes Balears', 'badajoz': 'Extremadura', 'cáceres': 'Extremadura',
  };
  const key = provincia.toLowerCase().trim();
  return map[key] || '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json().catch(() => ({}));
    const { provincia, tipo_bien, page = 1 } = body;

    // Build BOE search URL
    const searchParams = new URLSearchParams({
      'accion': 'Mas',
      'campo[0]': 'SUBASTA.ORIGEN',
      'dato[0]': '',
      'campo[1]': 'SUBASTA.ESTADO',
      'dato[1]': 'EJ',  // Estado: En ejecución
      'campo[2]': 'BIEN.TIPO',
      'dato[2]': tipo_bien || '',
      'campo[3]': 'BIEN.DIRECCION_PROVINCIA',
      'dato[3]': provincia || '',
      'page_hits': '40',
      'sort_field[0]': 'SUBASTA.FECHA_FIN_YMD',
      'sort_order[0]': 'desc',
      'sort_field[1]': 'SUBASTA.FECHA_FIN_YMD',
      'sort_order[1]': 'asc',
      'accion_origen': 'BUS',
    });

    if (page > 1) {
      searchParams.set('offset', String((page - 1) * 40));
    }

    const boeUrl = `https://subastas.boe.es/subastas_ava.php?${searchParams.toString()}`;
    console.log(`Fetching BOE: ${boeUrl}`);

    const boeRes = await fetch(boeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });

    if (!boeRes.ok) {
      throw new Error(`BOE returned ${boeRes.status}: ${boeRes.statusText}`);
    }

    const html = await boeRes.text();
    console.log(`Received ${html.length} bytes from BOE`);

    // Extract total results count
    const totalMatch = html.match(/(\d+)\s*resultado/i);
    const totalResults = totalMatch ? parseInt(totalMatch[1]) : 0;

    // Parse auctions from HTML
    const auctions = parseSearchResultsHtml(html);
    console.log(`Parsed ${auctions.length} auctions from page ${page}`);

    if (auctions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No auctions found for the given criteria',
        imported: 0,
        total_results: totalResults,
        page,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Transform to npl_assets format and upsert
    const headers = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    };

    const nplAssets = auctions.map(a => ({
      asset_id: a.ref_boe,
      tipo_activo: a.tipo_activo,
      provincia: a.provincia,
      municipio: a.municipio,
      direccion: a.direccion,
      comunidad_autonoma: mapProvinciaToCCAA(a.provincia),
      precio_orientativo: a.valor_subasta,
      valor_mercado: a.valor_tasacion,
      valor_activo: a.valor_tasacion,
      deuda_ob: a.valor_subasta,
      tipo_procedimiento: a.tipo_procedimiento,
      fase_judicial: a.fase_judicial,
      estado_judicial: a.estado_subasta,
      estado: a.estado_subasta === 'Finalizada' ? 'vendido' : 'disponible',
      descripcion: `Subasta BOE - ${a.juzgado}. ${a.tipo_activo} en ${a.municipio}, ${a.provincia}. Fecha subasta: ${a.fecha_subasta}. ${a.lotes > 1 ? `${a.lotes} lotes.` : ''}`,
      postura_subasta: true,
      publicado: true,
      cartera: 'BOE',
      servicer: 'BOE - Subastas Judiciales',
      referencia_fencia: a.url_detalle,
    }));

    // Upsert into npl_assets (using asset_id as unique key)
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/npl_assets?on_conflict=asset_id`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(nplAssets),
      }
    );

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error('Insert error:', err);
      // Try individual inserts to handle partial failures
      let inserted = 0;
      for (const asset of nplAssets) {
        const singleRes = await fetch(`${SUPABASE_URL}/rest/v1/npl_assets`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'return=minimal,resolution=ignore-duplicates',
          },
          body: JSON.stringify(asset),
        });
        if (singleRes.ok) inserted++;
      }
      console.log(`Individually inserted ${inserted}/${nplAssets.length}`);

      return new Response(JSON.stringify({
        success: true,
        imported: inserted,
        total_parsed: auctions.length,
        total_results: totalResults,
        page,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Successfully upserted ${nplAssets.length} assets`);

    // Trigger alert matching for newly imported assets
    try {
      const alertRes = await fetch(`${SUPABASE_URL}/functions/v1/notify-alert-matches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours_back: 1 }),
      });
      const alertData = await alertRes.json();
      console.log('Alert matching result:', alertData);
    } catch (alertErr) {
      console.error('Alert matching failed (non-blocking):', alertErr);
    }

    return new Response(JSON.stringify({
      success: true,
      imported: nplAssets.length,
      total_parsed: auctions.length,
      total_results: totalResults,
      page,
      sample: auctions.slice(0, 3),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('BOE scraping error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
