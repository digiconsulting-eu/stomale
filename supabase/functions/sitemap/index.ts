import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
}

const generateSitemap = async (supabase: any) => {
  console.log('Generating sitemap...')

  // Fetch all conditions
  const { data: conditions, error: conditionsError } = await supabase
    .from('PATOLOGIE')
    .select('Patologia')
  
  if (conditionsError) {
    console.error('Error fetching conditions:', conditionsError)
    throw conditionsError
  }

  // Fetch all approved reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id')
    .eq('status', 'approved')
  
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
    throw reviewsError
  }

  // Static pages
  const staticPages = [
    '',
    'recensioni',
    'cerca-patologia',
    'cerca-sintomi',
    'privacy-policy',
    'cookie-policy',
    'terms'
  ]

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>https://stomale.info/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${conditions.map(condition => `
  <url>
    <loc>https://stomale.info/patologia/${condition.Patologia.toLowerCase()}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${reviews.map(review => `
  <url>
    <loc>https://stomale.info/recensione/${review.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`

  return xml.trim()
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const xml = await generateSitemap(supabaseClient)
    
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', { 
      status: 500,
      headers: corsHeaders
    })
  }
})