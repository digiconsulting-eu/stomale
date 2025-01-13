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
  console.log('Starting sitemap generation...')

  // Fetch all conditions
  const { data: conditions, error: conditionsError } = await supabase
    .from('PATOLOGIE')
    .select('Patologia')
  
  if (conditionsError) {
    console.error('Error fetching conditions:', conditionsError)
    throw conditionsError
  }

  console.log(`Fetched ${conditions?.length || 0} conditions`)
  conditions?.forEach(condition => {
    console.log('Adding condition URL:', `https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`)
  })

  // Fetch all approved reviews with their associated conditions
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      id,
      PATOLOGIE (
        Patologia
      )
    `)
    .eq('status', 'approved')
  
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
    throw reviewsError
  }

  console.log(`Fetched ${reviews?.length || 0} approved reviews`)
  
  // Log review URLs being generated
  reviews?.forEach(review => {
    if (review.PATOLOGIE?.Patologia) {
      console.log('Adding review URL:', `https://stomale.info/recensione/${review.id}/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}`)
    } else {
      console.warn('Skipping review due to missing condition:', review.id)
    }
  })

  // Static pages
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'weekly' },
    { path: 'recensioni', priority: '0.8', changefreq: 'weekly' },
    { path: 'cerca-patologia', priority: '0.8', changefreq: 'weekly' },
    { path: 'cerca-sintomi', priority: '0.8', changefreq: 'weekly' },
    { path: 'privacy-policy', priority: '0.5', changefreq: 'monthly' },
    { path: 'cookie-policy', priority: '0.5', changefreq: 'monthly' },
    { path: 'terms', priority: '0.5', changefreq: 'monthly' }
  ]

  console.log('Generating XML sitemap...')

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${conditions?.map(condition => `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${reviews?.filter(review => review.PATOLOGIE?.Patologia).map(review => `
  <url>
    <loc>https://stomale.info/recensione/${review.id}/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`

  console.log('Sitemap generation completed')
  return xml.trim()
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    console.log('Received sitemap request')
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const xml = await generateSitemap(supabaseClient)
    console.log('Sitemap successfully generated and ready to be served')
    
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