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
    console.log('[Sitemap Function] Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
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

    // Fetch conditions with error handling and timeout
    console.log('[Sitemap Function] Fetching conditions...');
    const { data: conditions, error: conditionsError } = await Promise.race([
      supabase.from('PATOLOGIE').select('Patologia'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Conditions fetch timeout')), 5000)
      )
    ]);

    if (conditionsError) {
      console.error('[Sitemap Function] Error fetching conditions:', conditionsError);
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    // Fetch approved reviews with error handling and timeout
    console.log('[Sitemap Function] Fetching reviews...');
    const { data: reviews, error: reviewsError } = await Promise.race([
      supabase
        .from('reviews')
        .select(`
          title,
          created_at,
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'approved'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Reviews fetch timeout')), 5000)
      )
    ]);

    if (reviewsError) {
      console.error('[Sitemap Function] Error fetching reviews:', reviewsError);
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    // Function to properly encode URLs with validation
    const encodeUrl = (str: string) => {
      if (!str) return '';
      return str.toLowerCase()
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(part => encodeURIComponent(part))
        .join('-');
    };

    // Function to format date for sitemap with validation
    const formatDate = (date: string) => {
      try {
        return new Date(date).toISOString();
      } catch (error) {
        console.error('[Sitemap Function] Date formatting error:', error);
        return new Date().toISOString();
      }
    };

    console.log('[Sitemap Function] Generating XML content...');
    
    // Generate XML sitemap with validation
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add homepage
    xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Add static pages with validation
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
    
    // Add conditions with validation
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        if (encodedCondition) {
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n    <lastmod>${formatDate(new Date().toISOString())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
      }
    });

    // Add reviews with validation
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = encodeUrl(review.title);
          
        if (encodedCondition && reviewSlug) {
          xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}</loc>\n    <lastmod>${formatDate(review.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }
      }
    });

    xml += '</urlset>';

    console.log('[Sitemap Function] XML sitemap generation completed successfully');

    // Set proper XML content type header and cache control
    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    };

    return new Response(xml, { headers, status: 200 });

  } catch (error) {
    console.error('[Sitemap Function] Fatal error:', error);
    
    // Return error in XML format with proper headers
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap: ${error.message} -->
</urlset>`;
    
    return new Response(errorXml, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8'
      },
      status: 500
    });
  }
});