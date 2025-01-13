import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Starting static sitemap generation...`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    // Update the last_modified timestamp for this sitemap
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseAnonKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseClient
        .from('sitemap_files')
        .update({ last_modified: new Date().toISOString(), url_count: staticPages.length })
        .eq('filename', 'sitemap-static.xml');
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`Error generating static sitemap:`, error);
    return new Response(`Error generating static sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})