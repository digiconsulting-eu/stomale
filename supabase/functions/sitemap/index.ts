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
    const currentDate = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add homepage
    xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Add main sections
    xml += `  <url>\n    <loc>${BASE_URL}/recensioni</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    
    // Add conditions
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    });

    // Add reviews
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const encodedTitle = encodeUrl(review.title);
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${encodedTitle}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    });

    // Add static pages
    const staticPages = [
      'cerca-patologia',
      'cerca-sintomi',
      'nuova-recensione',
      'inserisci-patologia',
      'cookie-policy',
      'privacy-policy',
      'terms'
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${BASE_URL}/${page}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += '</urlset>';

    // Return the XML with proper headers
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
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