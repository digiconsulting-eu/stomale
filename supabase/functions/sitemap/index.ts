import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

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

    // Generate sitemap content
    let sitemap = 'SITEMAP STOMALE.INFO\n\n';
    sitemap += 'Homepage:\nhttps://stomale.info/\n\n';
    sitemap += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

    // Add conditions
    sitemap += 'Patologie:\n';
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
        sitemap += `https://stomale.info/patologia/${encodedCondition}\n`;
      }
    });
    sitemap += '\n';

    // Add reviews
    sitemap += 'Recensioni per patologia:\n';
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase());
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        sitemap += `https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
      }
    });
    sitemap += '\n';

    // Add static pages
    sitemap += 'Altre pagine:\n';
    sitemap += 'https://stomale.info/cerca-patologia\n';
    sitemap += 'https://stomale.info/nuova-recensione\n';
    sitemap += 'https://stomale.info/inserisci-patologia\n';
    sitemap += 'https://stomale.info/cerca-sintomi\n';
    sitemap += 'https://stomale.info/cookie-policy\n';
    sitemap += 'https://stomale.info/privacy-policy\n';
    sitemap += 'https://stomale.info/terms\n';

    console.log('[Sitemap Function] Sitemap generation completed successfully');

    return new Response(sitemap, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
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