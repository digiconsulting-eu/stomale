
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'X-Content-Type-Options': 'nosniff'
};

console.log('Sitemap Index function loaded and ready');

serve(async (req) => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] Received request for sitemap index`);
  console.log(`[${startTime}] Request method: ${req.method}`);
  console.log(`[${startTime}] Request URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log(`[${startTime}] Handling CORS preflight request`);
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  }

  try {
    console.log(`[${startTime}] Generating sitemap index XML...`);
    const today = new Date().toISOString().split('T')[0];
    
    // Usiamo il contenuto del file sitemap.xml esistente
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-a.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-b.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-c.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-d.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-e-l.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-m-r.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-s-z.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-reviews-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-reviews-2.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-reviews-3.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-reviews-4.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    console.log(`[${startTime}] Successfully generated sitemap index`);
    console.log(`[${startTime}] Response headers:`, corsHeaders);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
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
});
