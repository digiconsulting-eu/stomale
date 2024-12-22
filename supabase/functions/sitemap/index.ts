import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain; charset=utf-8'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[Sitemap] Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Sitemap] Supabase client initialized');

    // Fetch all conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia');

    if (conditionsError) {
      throw conditionsError;
    }
    console.log(`[Sitemap] Found ${conditions?.length || 0} conditions`);

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, title, condition_id')
      .eq('status', 'approved');

    if (reviewsError) {
      throw reviewsError;
    }
    console.log(`[Sitemap] Found ${reviews?.length || 0} approved reviews`);

    // Generate sitemap content
    let urls = [];
    
    // Add static pages
    urls.push('https://stomale.info/');
    urls.push('https://stomale.info/recensioni');
    urls.push('https://stomale.info/cerca-patologia');
    urls.push('https://stomale.info/nuova-recensione');

    // Add condition pages
    if (conditions) {
      conditions.forEach((condition) => {
        const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
        urls.push(`https://stomale.info/patologia/${encodedCondition}`);
      });
    }

    // Add review pages
    if (reviews && conditions) {
      reviews.forEach((review) => {
        const condition = conditions.find(c => c.id === review.condition_id);
        if (condition) {
          const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
          const reviewSlug = review.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          urls.push(`https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}`);
        }
      });
    }

    // Join URLs with newlines
    const sitemap = urls.join('\n');
    console.log('[Sitemap] Generated sitemap with', urls.length, 'URLs');

    return new Response(sitemap, { headers: corsHeaders });
  } catch (error) {
    console.error('[Sitemap] Error:', error);
    return new Response('Error generating sitemap', { 
      status: 500,
      headers: corsHeaders
    });
  }
});