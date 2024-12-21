import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[Sitemap Function] Starting sitemap generation...');
    
    // Initialize Supabase client
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

    console.log(`[Sitemap Function] Fetched ${conditions?.length || 0} conditions`);

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, title, condition_id')
      .eq('status', 'approved');

    if (reviewsError) {
      throw reviewsError;
    }

    console.log(`[Sitemap Function] Fetched ${reviews?.length || 0} reviews`);

    // Generate sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://stomale.info/recensioni</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add condition pages
    conditions?.forEach((condition) => {
      xml += `
  <url>
    <loc>https://stomale.info/patologia/${condition.Patologia.toLowerCase()}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add review pages
    reviews?.forEach((review) => {
      const condition = conditions?.find(c => c.id === review.condition_id);
      if (condition) {
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        xml += `
  <url>
    <loc>https://stomale.info/patologia/${condition.Patologia.toLowerCase()}/recensione/${reviewSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    // Add static pages
    xml += `
  <url>
    <loc>https://stomale.info/cerca-patologia</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://stomale.info/nuova-recensione</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://stomale.info/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://stomale.info/cookie-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://stomale.info/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    console.log('[Sitemap Function] XML generation completed');
    console.log('[Sitemap Function] Sample of generated XML:', xml.substring(0, 500));

    return new Response(xml, { headers: corsHeaders });
  } catch (error) {
    console.error('[Sitemap Function] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
});