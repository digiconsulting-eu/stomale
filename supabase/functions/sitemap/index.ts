import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

console.log('Sitemap function loaded and ready');

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting sitemap generation...`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${startTime}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    console.log(`[${startTime}] Initializing Supabase client...`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Static pages with proper XML formatting
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: 'recensioni', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-patologia', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-sintomi', priority: '0.8', changefreq: 'weekly' },
      { path: 'privacy-policy', priority: '0.5', changefreq: 'monthly' },
      { path: 'cookie-policy', priority: '0.5', changefreq: 'monthly' },
      { path: 'terms', priority: '0.5', changefreq: 'monthly' }
    ];

    console.log(`[${startTime}] Adding ${staticPages.length} static pages to sitemap`);

    // Start building XML with proper formatting
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages with consistent formatting
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Fetch all conditions
    console.log(`[${startTime}] Fetching conditions from database...`);
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia');
    
    if (conditionsError) {
      console.error(`[${startTime}] Error fetching conditions:`, conditionsError);
      throw conditionsError;
    }

    console.log(`[${startTime}] Found ${conditions?.length || 0} conditions`);

    // Add condition pages with consistent formatting
    if (conditions) {
      conditions.forEach(condition => {
        const conditionSlug = condition.Patologia.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(conditionSlug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
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
      .eq('status', 'approved');
    
    if (reviewsError) {
      console.error(`[${startTime}] Error fetching reviews:`, reviewsError);
      throw reviewsError;
    }

    console.log(`[${startTime}] Found ${reviews?.length || 0} approved reviews`);

    // Add review pages with consistent formatting
    if (reviews) {
      reviews.forEach(review => {
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
    }

    // Close XML
    xml += '\n</urlset>';

    const endTime = new Date().toISOString();
    console.log(`[${endTime}] Sitemap generation completed successfully`);
    
    // Return the sitemap with proper headers
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] Error generating sitemap:`, error);
    return new Response(`Error generating sitemap: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    });
  }
})