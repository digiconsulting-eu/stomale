import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[Sitemap Function] Starting sitemap generation...');
    
    // Get environment variables and log their presence (not their values)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('[Sitemap Function] Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration error: Missing environment variables');
    }

    console.log('[Sitemap Function] Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database connection
    console.log('[Sitemap Function] Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('PATOLOGIE')
      .select('count(*)', { count: 'exact' });

    if (testError) {
      console.error('[Sitemap Function] Database connection test failed:', testError);
      throw testError;
    }

    console.log('[Sitemap Function] Database connection successful. Row count:', testData);

    // Fetch conditions
    console.log('[Sitemap Function] Fetching conditions...');
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia');

    if (conditionsError) {
      console.error('[Sitemap Function] Error fetching conditions:', conditionsError);
      throw conditionsError;
    }

    console.log(`[Sitemap Function] Successfully fetched ${conditions?.length || 0} conditions`);

    // Fetch approved reviews
    console.log('[Sitemap Function] Fetching approved reviews...');
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
      throw reviewsError;
    }

    console.log(`[Sitemap Function] Successfully fetched ${reviews?.length || 0} reviews`);

    // Generate sitemap content
    console.log('[Sitemap Function] Generating sitemap content...');
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
    console.log('[Sitemap Function] Sitemap content length:', sitemap.length);

    return new Response(sitemap, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('[Sitemap Function] Error:', error);
    console.error('[Sitemap Function] Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate sitemap',
        details: error.message 
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