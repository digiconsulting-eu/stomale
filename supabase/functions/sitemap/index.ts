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
    // Initialize Supabase client with service role key for internal access
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

    // Fetch all approved conditions
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    if (conditionsError) throw conditionsError

    // Fetch all approved reviews
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select('id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (reviewsError) throw reviewsError

    const baseUrl = 'https://stomale.info'
    const today = new Date().toISOString().split('T')[0]

    // Start building the XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    const staticPages = [
      { url: '', priority: '1.0' },
      { url: 'recensioni', priority: '0.9' },
      { url: 'cerca', priority: '0.8' },
      { url: 'cerca-sintomi', priority: '0.8' }
    ]

    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url ? '/' + page.url : ''}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`
    })

    // Add condition pages
    conditions?.forEach(condition => {
      const slug = encodeURIComponent(condition.Patologia.toLowerCase())
      xml += `  <url>
    <loc>${baseUrl}/patologia/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`
    })

    // Add review pages
    reviews?.forEach(review => {
      xml += `  <url>
    <loc>${baseUrl}/recensione/${review.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`
    })

    xml += '</urlset>'

    console.log('Generated sitemap successfully')

    return new Response(xml, {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    })
  }
})