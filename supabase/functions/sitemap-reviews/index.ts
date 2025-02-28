
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
    const url = new URL(req.url)
    const pageParam = url.searchParams.get('page') || '1'
    const page = parseInt(pageParam, 10)
    
    // Validate page parameter
    if (isNaN(page) || page < 1 || page > 10) {
      return new Response('Invalid page parameter', { status: 400, headers: corsHeaders })
    }
    
    console.log(`Generating sitemap for reviews, page ${page}`)
    
    // Calculate pagination limits - 100 reviews per page
    const limit = 100
    const offset = (page - 1) * limit
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch exact URLs from the review_urls table
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('url')
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching review URLs:', error)
      return new Response(`Error fetching review URLs: ${error.message}`, { 
        status: 500, 
        headers: corsHeaders 
      })
    }
    
    console.log(`Found ${reviewUrls.length} reviews for page ${page}`)
    
    // Generate XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
    
    // Add entry for each review using the exact URL from the database
    for (const reviewUrl of reviewUrls) {
      if (reviewUrl.url) {
        xml += `  <url>
    <loc>https://stomale.info${reviewUrl.url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
    }
    
    xml += `</urlset>`
    
    // Update the sitemap_files table to track this file
    const filename = `sitemap-reviews-${page}.xml`
    const { error: updateError } = await supabase
      .from('sitemap_files')
      .upsert(
        { 
          filename, 
          url_count: reviewUrls.length,
          last_modified: new Date().toISOString() 
        },
        { onConflict: 'filename' }
      )
    
    if (updateError) {
      console.error('Error updating sitemap_files:', updateError)
      // Continue anyway - this is not critical
    }
    
    return new Response(xml, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Unexpected error generating sitemap:', error)
    return new Response(`Internal Server Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
