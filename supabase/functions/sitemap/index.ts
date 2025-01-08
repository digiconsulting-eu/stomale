import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const BASE_URL = 'https://stomale.info';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('[Sitemap Function] Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Sitemap Function] Missing environment variables');
      throw new Error('Configuration error: Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia');

    if (conditionsError) {
      console.error('[Sitemap Function] Error fetching conditions:', conditionsError);
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        title,
        created_at,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved');

    if (reviewsError) {
      console.error('[Sitemap Function] Error fetching reviews:', reviewsError);
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    // Function to properly encode URLs
    const encodeUrl = (str: string) => {
      return str.toLowerCase().split(' ').map(part => encodeURIComponent(part)).join('%20');
    };

    // Function to format date for sitemap
    const formatDate = (date: string) => {
      return new Date(date).toISOString();
    };

    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add homepage
    xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Add static pages
    const staticPages = [
      { path: '/recensioni', priority: '0.8' },
      { path: '/cerca-patologia', priority: '0.8' },
      { path: '/nuova-recensione', priority: '0.7' },
      { path: '/inserisci-patologia', priority: '0.6' },
      { path: '/cerca-sintomi', priority: '0.8' },
      { path: '/cookie-policy', priority: '0.3' },
      { path: '/privacy-policy', priority: '0.3' },
      { path: '/terms', priority: '0.3' }
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${BASE_URL}${page.path}</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    });
    
    // Add conditions
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    });

    // Add reviews
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}</loc>\n    <lastmod>${formatDate(review.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    xml += '</urlset>';

    console.log('[Sitemap Function] XML sitemap generation completed successfully');

    return new Response(xml, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      status: 200
    });

  } catch (error) {
    console.error('[Sitemap Function] Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate sitemap',
        message: error.message,
        timestamp: new Date().toISOString()
      }), 
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