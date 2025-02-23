
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

console.log('Sitemap function loaded and ready');

serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting sitemap generation...`);

  if (req.method === 'OPTIONS') {
    console.log(`[${startTime}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${startTime}] Missing Supabase configuration`);
      throw new Error('Missing Supabase configuration');
    }

    console.log(`[${startTime}] Creating Supabase client...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch approved reviews
    console.log(`[${startTime}] Fetching approved reviews...`);
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        title,
        created_at,
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

    // Generate XML
    console.log(`[${startTime}] Generating XML...`);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: 'recensioni', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-patologia', priority: '0.8', changefreq: 'weekly' },
      { path: 'cerca-sintomi', priority: '0.8', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add review pages
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
          
          const reviewSlug = review.title.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

          xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(conditionSlug)}/esperienza/${review.id}-${reviewSlug}</loc>
    <lastmod>${new Date(review.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
      });
    }

    xml += '\n</urlset>';

    const endTime = new Date().toISOString();
    console.log(`[${endTime}] Sitemap generation completed successfully`);
    
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
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
});
