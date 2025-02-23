
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'X-Content-Type-Options': 'nosniff'
};

serve(async (req) => {
  // Log della richiesta per debug
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  // Gestione CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  }

  // Verifica dell'header di autorizzazione
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    console.error("Missing authorization header");
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
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

    console.log("Generating sitemap index successfully");
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new Response(`Error generating sitemap index: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
});
