
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Definizione delle intestazioni CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  // Gestione delle richieste OPTIONS per CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Estrai il parametro page dalla query string
    const url = new URL(req.url);
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    
    // Numero di URL per pagina
    const urlsPerPage = 100;
    const offset = (page - 1) * urlsPerPage;
    
    // Inizializza il client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generazione sitemap per recensioni (pagina ${page})`);
    
    // Recupera gli URL dal database
    const { data: urls, error } = await supabaseClient
      .from('review_urls')
      .select('url, created_at')
      .range(offset, offset + urlsPerPage - 1)
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Errore nella query Supabase:', error);
      throw error;
    }

    console.log(`Trovati ${urls.length} URL per la pagina ${page}`);
    
    // Data corrente per lastmod (formato ISO)
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Costruisci l'XML della sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Aggiungi ogni URL alla sitemap
    urls.forEach(item => {
      const fullUrl = `https://stomale.info${item.url}`;
      // Usa la data di creazione se disponibile, altrimenti usa la data corrente
      const lastmod = item.created_at 
        ? new Date(item.created_at).toISOString().split('T')[0]
        : currentDate;
      
      xmlContent += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    xmlContent += `</urlset>`;
    
    // Registra l'aggiornamento nel database
    await supabaseClient
      .from('sitemap_files')
      .upsert({ 
        filename: `sitemap-reviews-${page}.xml`,
        url_count: urls.length,
        last_modified: new Date().toISOString()
      }, {
        onConflict: 'filename'
      });
    
    console.log(`Sitemap generata con successo con ${urls.length} URL`);
    
    // Restituisci l'XML
    return new Response(xmlContent, { 
      headers: { 
        ...corsHeaders,
        'Cache-Control': 'public, max-age=86400' // Cache per 24 ore
      } 
    });
    
  } catch (error) {
    console.error('Errore durante la generazione della sitemap:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
