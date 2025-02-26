
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

const REVIEWS_PER_SITEMAP = 1000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')

    // Initialize the Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch reviews for the current page
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        title,
        created_at,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range((page - 1) * REVIEWS_PER_SITEMAP, page * REVIEWS_PER_SITEMAP - 1)

    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add URLs for each review
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia) {
        const conditionSlug = review.PATOLOGIE.Patologia.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        
        const titleSlug = review.title.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        
        const lastmod = new Date(review.created_at).toISOString().split('T')[0]
        
        xml += '  <url>\n'
        xml += `    <loc>https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}</loc>\n`
        xml += `    <lastmod>${lastmod}</lastmod>\n`
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += '    <priority>0.6</priority>\n'
        xml += '  </url>\n'
      }
    })

    xml += '</urlset>'

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error generating reviews sitemap:', error)
    return new Response(`Error generating reviews sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    })
  }
})
