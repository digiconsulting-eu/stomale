
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
    
    // Define the condition groups and specific review pages
    const conditionGroups = ['a', 'b', 'c', 'd', 'e-l', 'm-r', 's-z']
    const reviewPages = [1, 3, 67, 68, 73, 74, 77, 79, 81, 82, 86, 89, 90, 91, 150, 151, 178]
    const today = new Date().toISOString().split('T')[0]
    
    // Start XML with XML declaration at the very beginning
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static sitemap entry
    xml += `  <sitemap>\n    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    
    // Add condition sitemap entries
    for (const group of conditionGroups) {
      xml += `  <sitemap>\n    <loc>https://stomale.info/sitemaps/sitemap-conditions-${group}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }
    
    // Add review sitemap entries
    for (const page of reviewPages) {
      xml += `  <sitemap>\n    <loc>https://stomale.info/sitemap-reviews-${page}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }
    
    // Close the sitemapindex tag
    xml += '</sitemapindex>';
    
    // Log the first few characters to verify there's no whitespace before XML declaration
    console.log('First 50 characters of generated XML:');
    console.log(xml.substring(0, 50));
    
    return new Response(xml, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Unexpected error generating sitemap index:', error)
    return new Response(`Internal Server Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
