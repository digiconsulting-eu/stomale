
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
    console.log('Generazione sitemap statica');
    
    // Data corrente per lastmod
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Elenco delle pagine statiche del sito
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: 'patologie', priority: '0.9', changefreq: 'weekly' },
      { url: 'about', priority: '0.7', changefreq: 'monthly' },
      { url: 'privacy', priority: '0.5', changefreq: 'yearly' },
      { url: 'cookie', priority: '0.5', changefreq: 'yearly' },
      { url: 'termini', priority: '0.5', changefreq: 'yearly' },
      { url: 'contatti', priority: '0.7', changefreq: 'monthly' },
    ];
    
    // Costruisci l'XML della sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Aggiungi ogni pagina statica alla sitemap
    staticPages.forEach(page => {
      const fullUrl = `https://stomale.info/${page.url}`;
      
      xmlContent += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    xmlContent += `</urlset>`;
    
    console.log('Sitemap statica generata con successo');
    
    // Restituisci l'XML
    return new Response(xmlContent, { 
      headers: { 
        ...corsHeaders,
        'Cache-Control': 'public, max-age=86400' // Cache per 24 ore
      } 
    });
    
  } catch (error) {
    console.error('Errore durante la generazione della sitemap statica:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
