
// Basic headers with content-type
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Content-Type': 'application/xml; charset=utf-8'
}

// Simple test handler
Deno.serve(async (req) => {
  console.log('Request received:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }

  // Basic XML response
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/test</loc>
    <lastmod>2024-03-21</lastmod>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: corsHeaders
  });
});