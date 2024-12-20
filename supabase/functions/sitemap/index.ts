import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

interface Review {
  title: string
  condition_id: number
  updated_at: string
}

interface Condition {
  id: number
  Patologia: string
  updated_at?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch conditions and their latest reviews
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia, created_at')

    if (conditionsError) {
      console.error('Error fetching conditions:', conditionsError)
      throw conditionsError
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('title, condition_id, updated_at')
      .eq('status', 'approved')

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    // Start building the XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://stomale.info/recensioni</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

    // Add condition pages
    conditions.forEach((condition: Condition) => {
      const conditionReviews = reviews.filter(r => r.condition_id === condition.id)
      const lastUpdate = conditionReviews.length > 0 
        ? Math.max(...conditionReviews.map(r => new Date(r.updated_at).getTime()))
        : new Date(condition.created_at).getTime()

      xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}</loc>
    <lastmod>${new Date(lastUpdate).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

      // Add review pages for this condition
      conditionReviews.forEach((review: Review) => {
        xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}/recensione/${encodeURIComponent(review.title.toLowerCase())}</loc>
    <lastmod>${new Date(review.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
      })
    })

    // Add static pages
    xml += `
  <url>
    <loc>https://stomale.info/cerca-patologia</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://stomale.info/nuova-recensione</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://stomale.info/privacy-policy</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://stomale.info/cookie-policy</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://stomale.info/terms</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`

    return new Response(xml, {
      headers: corsHeaders,
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    })
  }
})