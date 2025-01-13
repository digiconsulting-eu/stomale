import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting sitemap generation...')
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    // Start building XML with static pages
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>https://stomale.info/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}`

    // Fetch all conditions
    console.log('Fetching conditions...')
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('id, Patologia')
    
    if (conditionsError) {
      console.error('Error fetching conditions:', conditionsError)
      throw conditionsError
    }

    console.log(`Found ${conditions?.length || 0} conditions`)

    // Add condition pages to XML
    if (conditions) {
      for (const condition of conditions) {
        const conditionUrl = `https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`
        console.log('Adding condition URL:', conditionUrl)
        xml += `
  <url>
    <loc>${conditionUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      }
    }

    // Fetch approved reviews in batches
    console.log('Fetching approved reviews...')
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .limit(1000)
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    console.log(`Found ${reviews?.length || 0} approved reviews`)

    // Add review pages to XML
    if (reviews) {
      for (const review of reviews) {
        if (review.PATOLOGIE?.Patologia) {
          const reviewUrl = `https://stomale.info/recensione/${review.id}/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}`
          console.log('Adding review URL:', reviewUrl)
          xml += `
  <url>
    <loc>${reviewUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
        }
      }
    }

    // Close XML
    xml += '\n</urlset>'

    console.log('Sitemap generation completed successfully')
    
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Fatal error in sitemap generation:', error)
    return new Response(`Error generating sitemap: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    })
  }
})