
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  console.log('Request received:', req.url); // Log the incoming request URL
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const letter = new URL(req.url).searchParams.get('letter')?.toLowerCase() || 'a'
    console.log('Processing letter:', letter); // Log the letter being processed
    
    // For testing, return a simple static XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/patologia/test-${letter}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    console.log('Generated XML length:', xml.length); // Log the size of generated XML

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error in sitemap-conditions:', error)
    return new Response('Error generating sitemap', { 
      status: 500,
      headers: corsHeaders
    })
  }
})
