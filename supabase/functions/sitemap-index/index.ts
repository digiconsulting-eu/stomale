
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
    // Inizializza il client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generazione sitemap index');
    
    // Recupera il conteggio totale delle recensioni
    const { count, error: countError } = await supabaseClient
      .from('review_urls')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Errore nel conteggio delle recensioni:', countError);
      throw countError;
    }
    
    // Calcola il numero di pagine necessarie
    const urlsPerPage = 100;
    const totalPages = Math.ceil((count || 0) / urlsPerPage);
    
    console.log(`Trovate ${count} recensioni, necessarie ${totalPages} pagine`);
    
    // Data corrente per lastmod
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Costruisci l'XML della sitemap index
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;

    // Aggiungi le sitemap delle condizioni
    const letters = ['a', 'b', 'c', 'd', 'e-l', 'm-r', 's-z'];
    letters.forEach(letter => {
      xmlContent += `  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-${letter}.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
    });

    // Aggiungi le sitemap delle recensioni
    for (let page = 1; page <= totalPages; page++) {
      xmlContent += `  <sitemap>
    <loc>https://stomale.info/sitemap-reviews-${page}.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
    }

    xmlContent += `</sitemapindex>`;
    
    // Restituisci l'XML
    return new Response(xmlContent, { 
      headers: { 
        ...corsHeaders,
        'Cache-Control': 'public, max-age=86400' // Cache per 24 ore
      } 
    });
    
  } catch (error) {
    console.error('Errore durante la generazione della sitemap index:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
