
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Static sitemap
    xml += '  <sitemap>\n'
    xml += '    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>\n'
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += '  </sitemap>\n'

    // Conditions sitemaps
    const sitemaps = [
      'conditions-a',
      'conditions-b',
      'conditions-c',
      'conditions-d',
      'conditions-e-l',
      'conditions-m-r',
      'conditions-s-z'
    ]

    sitemaps.forEach(sitemap => {
      xml += '  <sitemap>\n'
      xml += `    <loc>https://stomale.info/sitemaps/sitemap-${sitemap}.xml</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += '  </sitemap>\n'
    })

    // Reviews sitemaps
    for (let i = 1; i <= 4; i++) {
      xml += '  <sitemap>\n'
      xml += `    <loc>https://stomale.info/sitemaps/sitemap-reviews-${i}.xml</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += '  </sitemap>\n'
    }

    xml += '</sitemapindex>'

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error generating sitemap index:', error)
    return new Response(`Error generating sitemap index: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    })
  }
})
