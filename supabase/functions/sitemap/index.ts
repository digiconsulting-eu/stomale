import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating sitemap in XML format...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    if (conditionsError) {
      console.error('Error fetching conditions:', conditionsError)
      throw conditionsError
    }

    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select('id, PATOLOGIE(Patologia)')
      .eq('status', 'approved')

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    const today = new Date().toISOString().split('T')[0]
    const baseUrl = 'https://stomale.info'

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    const staticPages = [
      { url: '', priority: '1.0' },
      { url: 'recensioni', priority: '0.9' },
      { url: 'cerca-patologia', priority: '0.8' },
      { url: 'cerca-sintomi', priority: '0.8' },
      { url: 'nuova-recensione', priority: '0.7' },
      { url: 'inserisci-patologia', priority: '0.7' }
    ]

    staticPages.forEach(page => {
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}${page.url ? '/' + page.url : ''}</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += `    <changefreq>daily</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += `  </url>\n`
    })

    // Add condition pages
    conditions?.forEach(condition => {
      const slug = encodeURIComponent(condition.Patologia.toLowerCase())
      xml += `  <url>\n`
      xml += `    <loc>${baseUrl}/patologia/${slug}</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    })

    // Add review pages
    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia) {
        const conditionSlug = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())
        xml += `  <url>\n`
        xml += `    <loc>${baseUrl}/recensione/${review.id}/${conditionSlug}</loc>\n`
        xml += `    <lastmod>${today}</lastmod>\n`
        xml += `    <changefreq>monthly</changefreq>\n`
        xml += `    <priority>0.6</priority>\n`
        xml += `  </url>\n`
      }
    })

    xml += '</urlset>'

    console.log('Generated sitemap with:')
    console.log('- Static pages:', staticPages.length)
    console.log('- Conditions:', conditions?.length)
    console.log('- Reviews:', reviews?.length)

    return new Response(xml, { headers: corsHeaders })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        headers: corsHeaders,
        status: 500
      }
    )
  }
})