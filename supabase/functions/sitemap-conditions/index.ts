
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
    // Estrai il parametro lettera dalla query string
    const url = new URL(req.url);
    const letter = url.searchParams.get('letter') || 'a';
    
    // Inizializza il client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generazione sitemap per condizioni con lettera ${letter}`);
    
    let query = supabaseClient
      .from('PATOLOGIE')
      .select('Patologia');
    
    // Gestione dei range di lettere (e-l, m-r, s-z)
    if (letter === 'e-l') {
      query = query.gte('Patologia', 'E').lte('Patologia', 'Lz');
    } else if (letter === 'm-r') {
      query = query.gte('Patologia', 'M').lte('Patologia', 'Rz');
    } else if (letter === 's-z') {
      query = query.gte('Patologia', 'S').lte('Patologia', 'Zz');
    } else {
      // Lettera singola
      query = query.ilike('Patologia', `${letter}%`);
    }
    
    const { data: conditions, error } = await query.order('Patologia');
    
    if (error) {
      console.error('Errore nella query Supabase:', error);
      throw error;
    }

    console.log(`Trovate ${conditions.length} condizioni per la lettera ${letter}`);
    
    // Data corrente per lastmod
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Costruisci l'XML della sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Aggiungi ogni condizione alla sitemap
    conditions.forEach(condition => {
      const slug = condition.Patologia.toLowerCase().replace(/\s+/g, '-');
      const fullUrl = `https://stomale.info/patologia/${slug}`;
      
      xmlContent += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    xmlContent += `</urlset>`;
    
    console.log(`Sitemap generata con successo con ${conditions.length} condizioni`);
    
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
