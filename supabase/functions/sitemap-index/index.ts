
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
    
    // Calculate number of review pages needed (500 reviews per page)
    const reviewsPerPage = 500
    const totalReviewPages = Math.ceil(totalReviews / reviewsPerPage)
    console.log(`Total review pages needed: ${totalReviewPages}`)
    
    // Define the condition groups
    const conditionGroups = ['a', 'b', 'c', 'd', 'e-l', 'm-r', 's-z']
    const today = new Date().toISOString().split('T')[0]
    
    // Build the XML string without any leading whitespace
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static sitemap entry
    xml += `  <sitemap>\n    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    
    // Add condition sitemap entries
    for (const group of conditionGroups) {
      xml += `  <sitemap>\n    <loc>https://stomale.info/sitemaps/sitemap-conditions-${group}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }
    
    // Add review sitemap entries - dynamically calculated
    for (let page = 1; page <= totalReviewPages; page++) {
      xml += `  <sitemap>\n    <loc>https://stomale.info/sitemap-reviews-${page}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }
    
    // Close the sitemapindex tag
    xml += '</sitemapindex>';
    
    // Log and validate the generated XML
    console.log('First 50 characters of XML:');
    console.log(xml.substring(0, 50));
    
    // Strip any potential whitespace at the beginning
    if (xml.trimStart() !== xml) {
      console.error('WARNING: Found leading whitespace in XML, stripping it');
      xml = xml.trimStart();
    }
    
    // Ensure the XML starts with the declaration
    if (!xml.startsWith('<?xml')) {
      console.error('CRITICAL ERROR: XML does not start with declaration');
      return new Response('Internal Server Error: Generated invalid XML', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
    
    // Final validation check
    const xmlLines = xml.split('\n');
    if (xmlLines.length > 0 && !xmlLines[0].includes('<?xml')) {
      console.error('CRITICAL ERROR: First line does not contain XML declaration');
      console.error('First line:', xmlLines[0]);
      return new Response('Internal Server Error: XML validation failed', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
    
    // Set Content-Type header to ensure browser interprets as XML
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/xml; charset=utf-8'
    };
    
    return new Response(xml, { headers: responseHeaders })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error generating sitemap index:', errorMessage);
    return new Response(`Internal Server Error: ${errorMessage}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
})
