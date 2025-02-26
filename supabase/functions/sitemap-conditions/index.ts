
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

// Simple test handler for sitemap generation
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Allow': 'GET, OPTIONS',
      }
    })
  }

  // Basic test response
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/test</loc>
    <lastmod>2024-03-21</lastmod>
  </url>
</urlset>`

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=3600',
    }
  })
})
