import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting sitemap index generation...`);

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

    // Fetch sitemap files information
    console.log(`[${startTime}] Fetching sitemap files information...`);
    const { data: sitemapFiles, error: sitemapError } = await supabaseClient
      .from('sitemap_files')
      .select('*')
      .order('filename');

    if (sitemapError) {
      console.error(`[${startTime}] Error fetching sitemap files:`, sitemapError);
      throw sitemapError;
    }

    // Generate sitemap index XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    sitemapFiles?.forEach(file => {
      xml += `
  <sitemap>
    <loc>https://stomale.info/sitemaps/${file.filename}</loc>
    <lastmod>${new Date(file.last_modified).toISOString()}</lastmod>
  </sitemap>`;
    });

    xml += '\n</sitemapindex>';

    const endTime = new Date().toISOString();
    console.log(`[${endTime}] Sitemap index generation completed successfully`);

    // Return the sitemap index with proper headers
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
    console.error(`[${errorTime}] Error generating sitemap index:`, error);
    return new Response(`Error generating sitemap index: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})