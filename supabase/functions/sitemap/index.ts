import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[Sitemap Function] Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Sitemap Function] Supabase client initialized');

    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia');

    if (conditionsError) {
      console.error('[Sitemap Function] Error fetching conditions:', conditionsError);
      throw conditionsError;
    }

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

    let sitemap = 'SITEMAP STOMALE.INFO\n\n';
    sitemap += 'Homepage:\nhttps://stomale.info/\n\n';
    sitemap += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

    sitemap += 'Patologie:\n';
    conditions?.forEach((condition) => {
      const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
      sitemap += `https://stomale.info/patologia/${encodedCondition}\n`;
    });
    sitemap += '\n';

    sitemap += 'Recensioni per patologia:\n';
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia) {
        const encodedCondition = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase());
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        sitemap += `https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
      }
    });
    sitemap += '\n';

    sitemap += 'Altre pagine:\n';
    sitemap += 'https://stomale.info/cerca-patologia\n';
    sitemap += 'https://stomale.info/nuova-recensione\n';

    console.log('[Sitemap Function] Sitemap generation completed');

    return new Response(sitemap, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('[Sitemap Function] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
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