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

    // Determine format based on URL path
    const url = new URL(req.url);
    const isXml = url.pathname.endsWith('.xml');

    if (isXml) {
      // Generate XML sitemap
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
      
      // Add homepage
      xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n  </url>\n`;
      
      // Add static pages
      const staticPages = [
        '/recensioni',
        '/cerca-patologia',
        '/nuova-recensione',
        '/inserisci-patologia',
        '/cerca-sintomi',
        '/cookie-policy',
        '/privacy-policy',
        '/terms'
      ];

      staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${BASE_URL}${page}</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n  </url>\n`;
      });
      
      // Add conditions
      conditions?.forEach((condition) => {
        if (condition.Patologia) {
          const encodedCondition = encodeUrl(condition.Patologia);
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n  </url>\n`;
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
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}</loc>\n    <lastmod>${formatDate(review.created_at)}</lastmod>\n  </url>\n`;
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
    } else {
      // For non-XML requests, return a simple text response
      return new Response('Please use sitemap.xml endpoint for XML format', { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
        },
        status: 200
      });
    }

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