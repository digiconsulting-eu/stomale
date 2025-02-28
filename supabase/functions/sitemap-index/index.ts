
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating sitemap index')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Count total review URLs to determine number of sitemap files
    const { count, error: countError } = await supabase
      .from('review_urls')
      .select('id', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting review URLs:', countError)
      return new Response(`Error counting review URLs: ${countError.message}`, { 
        status: 500, 
        headers: corsHeaders 
      })
    }
    
    const totalReviews = count || 0
    console.log(`Total review URLs: ${totalReviews}`)
    
    // Calculate total pages needed (100 reviews per page)
    const reviewsPerPage = 100
    const totalReviewPages = Math.ceil(totalReviews / reviewsPerPage)
    
    // Generate XML sitemap index
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-a.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-b.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-c.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-d.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-e-l.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-m-r.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-s-z.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
`
    
    // Add entry for each review sitemap page
    for (let page = 1; page <= totalReviewPages; page++) {
      xml += `  <sitemap>
    <loc>https://stomale.info/sitemap-reviews-${page}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
`
    }
    
    xml += `</sitemapindex>`
    
    return new Response(xml, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Unexpected error generating sitemap index:', error)
    return new Response(`Internal Server Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
