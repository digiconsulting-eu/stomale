
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
    
    // Recupera le recensioni direttamente dalla tabella reviews invece di review_urls
    const { data: reviews, error } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        created_at,
        PATOLOGIE(Patologia)
      `)
      .eq('status', 'approved')
      .range(offset, offset + urlsPerPage - 1)
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Errore nella query Supabase:', error);
      throw error;
    }

    console.log(`Trovate ${reviews.length} recensioni per la pagina ${page}`);
    
    // Data corrente per lastmod (formato ISO)
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Costruisci l'XML della sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Funzione di formattazione URL uguale a quella in ReviewCard.tsx
    const formatUrlPath = (text: string) => {
      return text.trim().toLowerCase().replace(/\s+/g, '-');
    };

    // Aggiungi ogni recensione alla sitemap
    reviews.forEach(review => {
      const condition = review.PATOLOGIE?.Patologia || '';
      const reviewPath = `/patologia/${formatUrlPath(condition)}/esperienza/${review.id}-${formatUrlPath(review.title)}`;
      const fullUrl = `https://stomale.info${reviewPath}`;
      
      // Usa la data di creazione se disponibile, altrimenti usa la data corrente
      const lastmod = review.created_at 
        ? new Date(review.created_at).toISOString().split('T')[0]
        : currentDate;
      
      xmlContent += `  <url>
    <loc>${fullUrl}</loc>
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
        url_count: reviews.length,
        last_modified: new Date().toISOString()
      }, {
        onConflict: 'filename'
      });
    
    console.log(`Sitemap generata con successo con ${reviews.length} URL`);
    
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
