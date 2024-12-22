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
    console.log('[Sitemap Function] Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Sitemap Function] Supabase client initialized');

    // Fetch conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia');

    if (conditionsError) {
      throw conditionsError;
    }

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, title, condition_id')
      .eq('status', 'approved');

    if (reviewsError) {
      throw reviewsError;
    }

    // Generate sitemap content
    let sitemap = 'https://stomale.info/\n';
    sitemap += 'https://stomale.info/recensioni\n';
    sitemap += 'https://stomale.info/cerca-patologia\n';
    sitemap += 'https://stomale.info/nuova-recensione\n';

    // Add condition pages
    if (conditions) {
      conditions.forEach((condition) => {
        const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
        sitemap += `https://stomale.info/patologia/${encodedCondition}\n`;
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
          sitemap += `https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
        }
      });
    }

    console.log('[Sitemap Function] Generated sitemap content');
    return new Response(sitemap, { headers: corsHeaders });
  } catch (error) {
    console.error('[Sitemap Function] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: corsHeaders
    });
  }
});