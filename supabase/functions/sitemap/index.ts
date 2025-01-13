import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting sitemap generation...`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${startTime}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with anon key instead of service role
    console.log(`[${startTime}] Initializing Supabase client...`);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '' // Using anon key instead of service role key
    )

    // Static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: 'recensioni', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-patologia', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-sintomi', priority: '0.8', changefreq: 'weekly' },
      { path: 'privacy-policy', priority: '0.5', changefreq: 'monthly' },
      { path: 'cookie-policy', priority: '0.5', changefreq: 'monthly' },
      { path: 'terms', priority: '0.5', changefreq: 'monthly' }
    ]

    console.log(`[${startTime}] Adding ${staticPages.length} static pages to sitemap`);

    // Start building XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}`

    // Fetch all conditions
    console.log(`[${startTime}] Fetching conditions from database...`);
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('id, Patologia')
    
    if (conditionsError) {
      console.error(`[${startTime}] Error fetching conditions:`, conditionsError);
      throw conditionsError;
    }

    console.log(`[${startTime}] Found ${conditions?.length || 0} conditions`);

    // Add condition pages to XML
    if (conditions) {
      for (const condition of conditions) {
        const conditionUrl = `https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`;
        console.log(`[${startTime}] Adding condition URL: ${conditionUrl}`);
        xml += `
  <url>
    <loc>${conditionUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Fetch approved reviews
    console.log(`[${startTime}] Fetching approved reviews...`);
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
      .limit(1000);
    
    if (reviewsError) {
      console.error(`[${startTime}] Error fetching reviews:`, reviewsError);
      throw reviewsError;
    }

    console.log(`[${startTime}] Found ${reviews?.length || 0} approved reviews`);

    // Add review pages to XML
    let addedReviews = 0;
    let skippedReviews = 0;

    if (reviews) {
      for (const review of reviews) {
        if (review.PATOLOGIE?.Patologia) {
          const slug = review.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          const reviewUrl = `https://stomale.info/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}/esperienza/${review.id}-${slug}`;
          console.log(`[${startTime}] Adding review URL: ${reviewUrl}`);
          xml += `
  <url>
    <loc>${reviewUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
          addedReviews++;
        } else {
          console.log(`[${startTime}] Skipping review ${review.id} - missing Patologia`);
          skippedReviews++;
        }
      }
    }

    // Close XML
    xml += '\n</urlset>';

    console.log(`[${startTime}] Sitemap generation completed:`);
    console.log(`- Added ${addedReviews} review URLs`);
    console.log(`- Skipped ${skippedReviews} reviews`);
    console.log(`- Total URLs: ${staticPages.length + (conditions?.length || 0) + addedReviews}`);
    
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] Fatal error in sitemap generation:`, error);
    console.error(`[${errorTime}] Error stack:`, error.stack);
    return new Response(`Error generating sitemap: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    });
  }
})