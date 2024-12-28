import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = 'https://stomale.info';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conditions and reviews
    const [conditionsResponse, reviewsResponse] = await Promise.all([
      supabase.from('PATOLOGIE').select('Patologia'),
      supabase.from('reviews')
        .select(`
          title,
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'approved')
    ]);

    if (conditionsResponse.error) throw conditionsResponse.error;
    if (reviewsResponse.error) throw reviewsResponse.error;

    const conditions = conditionsResponse.data;
    const reviews = reviewsResponse.data;

    // Function to properly encode URLs
    const encodeUrl = (str: string) => {
      return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    // Generate XML sitemap
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/recensioni</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${conditions?.map(condition => {
  if (condition.Patologia) {
    const encodedCondition = encodeUrl(condition.Patologia);
    return `  <url>
    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  return '';
}).join('\n')}
${reviews?.map(review => {
  if (review.PATOLOGIE?.Patologia && review.title) {
    const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
    const encodedTitle = encodeUrl(review.title);
    return `  <url>
    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${encodedTitle}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
  return '';
}).join('\n')}
${['cerca-patologia', 'cerca-sintomi', 'nuova-recensione', 'inserisci-patologia', 'cookie-policy', 'privacy-policy', 'terms']
  .map(page => `  <url>
    <loc>${BASE_URL}/${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

    // Return the XML with proper headers
    return new Response(xmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Robots-Tag': 'all',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});