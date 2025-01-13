import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Generating sitemap in XML format...')
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch all conditions
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    if (conditionsError) {
      console.error('Error fetching conditions:', conditionsError)
      throw conditionsError
    }

    // Fetch all approved reviews
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select('id, condition_id, PATOLOGIE(Patologia)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    const baseUrl = 'https://stomale.info'
    const today = new Date().toISOString().split('T')[0]

    // Start building the XML content
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    const staticPages = [
      { url: '', priority: '1.0' },
      { url: 'recensioni', priority: '0.9' },
      { url: 'cerca-patologia', priority: '0.8' },
      { url: 'cerca-sintomi', priority: '0.8' },
      { url: 'login', priority: '0.5' },
      { url: 'registrati', priority: '0.5' },
      { url: 'cookie-policy', priority: '0.3' },
      { url: 'privacy-policy', priority: '0.3' },
      { url: 'terms', priority: '0.3' }
    ]

    // Add static pages to XML
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url ? '/' + page.url : ''}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    })

    // Add condition pages to XML
    conditions?.forEach(condition => {
      const slug = encodeURIComponent(condition.Patologia.toLowerCase())
      xml += `  <url>
    <loc>${baseUrl}/patologia/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    // Add review pages to XML
    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia) {
        const conditionSlug = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())
        xml += `  <url>
    <loc>${baseUrl}/recensione/${review.id}/${conditionSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
    })

    // Close the XML
    xml += '</urlset>'

    console.log('Generated XML sitemap successfully')
    console.log('Number of conditions:', conditions?.length)
    console.log('Number of reviews:', reviews?.length)

    return new Response(xml, {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <error>${error.message}</error>
</urlset>`,
      {
        headers: corsHeaders,
        status: 500
      }
    )
  }
})