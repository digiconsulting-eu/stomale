import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting reviews sitemap generation...`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch all approved reviews
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }

    console.log(`Found ${reviews?.length || 0} approved reviews`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia) {
        const conditionSlug = review.PATOLOGIE.Patologia.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const reviewSlug = review.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(conditionSlug)}/esperienza/${review.id}-${reviewSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    });

    xml += '\n</urlset>';

    // Update the last_modified timestamp for this sitemap
    await supabaseClient
      .from('sitemap_files')
      .update({ 
        last_modified: new Date().toISOString(),
        url_count: reviews?.length || 0
      })
      .eq('filename', 'sitemap-reviews.xml');

    const endTime = new Date().toISOString();
    console.log(`[${endTime}] Completed reviews sitemap generation with ${reviews?.length || 0} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`Error generating reviews sitemap:`, error);
    return new Response(`Error generating reviews sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})