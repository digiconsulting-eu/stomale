import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting sitemap index generation...`);

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

    // Get all sitemap files
    const { data: sitemapFiles, error: sitemapError } = await supabaseClient
      .from('sitemap_files')
      .select('*')
      .order('filename');

    if (sitemapError) {
      throw sitemapError;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add all sitemap files to the index
    sitemapFiles?.forEach(file => {
      xml += `
  <sitemap>
    <loc>https://stomale.info/sitemaps/${file.filename}</loc>
    <lastmod>${new Date(file.last_modified).toISOString()}</lastmod>
  </sitemap>`;
    });

    xml += '\n</sitemapindex>';

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`Error generating sitemap index:`, error);
    return new Response(`Error generating sitemap index: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})