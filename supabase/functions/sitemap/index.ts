import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, accept',
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

    // Test database connection with a simple query
    const { data: testData, error: testError } = await supabase
      .from('PATOLOGIE')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('[Sitemap Function] Database connection test failed:', testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }

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

    // Determine format based on Accept header
    const acceptHeader = req.headers.get('Accept') || '';
    const isXml = acceptHeader.includes('application/xml');

    if (isXml) {
      // Generate XML sitemap with proper XML declaration and namespace
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
      xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
      xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
      xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
      
      // Add homepage with lastmod and changefreq
      const currentDate = new Date().toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>\n`;
      xml += `  <url>\n    <loc>${BASE_URL}/recensioni</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>\n`;
      
      // Add conditions
      conditions?.forEach((condition) => {
        if (condition.Patologia) {
          const encodedCondition = encodeUrl(condition.Patologia);
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
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
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
        }
      });

      // Add static pages
      const staticPages = [
        'cerca-patologia',
        'nuova-recensione',
        'inserisci-patologia',
        'cerca-sintomi',
        'cookie-policy',
        'privacy-policy',
        'terms'
      ];

      staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${BASE_URL}/${page}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>\n`;
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
      // Generate text sitemap
      let sitemap = 'SITEMAP STOMALE.INFO\n\n';
      sitemap += `Homepage:\n${BASE_URL}/\n\n`;
      sitemap += `Recensioni:\n${BASE_URL}/recensioni\n\n`;

      // Add conditions
      sitemap += 'Patologie:\n';
      conditions?.forEach((condition) => {
        if (condition.Patologia) {
          const encodedCondition = encodeUrl(condition.Patologia);
          sitemap += `${BASE_URL}/patologia/${encodedCondition}\n`;
        }
      });
      sitemap += '\n';

      // Add reviews
      sitemap += 'Recensioni per patologia:\n';
      reviews?.forEach((review) => {
        if (review.PATOLOGIE?.Patologia && review.title) {
          const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
          const reviewSlug = review.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          sitemap += `${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
        }
      });
      sitemap += '\n';

      // Add static pages
      sitemap += 'Altre pagine:\n';
      sitemap += `${BASE_URL}/cerca-patologia\n`;
      sitemap += `${BASE_URL}/nuova-recensione\n`;
      sitemap += `${BASE_URL}/inserisci-patologia\n`;
      sitemap += `${BASE_URL}/cerca-sintomi\n`;
      sitemap += `${BASE_URL}/cookie-policy\n`;
      sitemap += `${BASE_URL}/privacy-policy\n`;
      sitemap += `${BASE_URL}/terms\n`;

      console.log('[Sitemap Function] Text sitemap generation completed successfully');

      return new Response(sitemap, { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
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