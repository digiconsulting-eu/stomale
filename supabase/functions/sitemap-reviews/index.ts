
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Review {
  id: number
  title: string
  condition_id: number
  PATOLOGIE?: {
    Patologia: string
  }
  created_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get page parameter from URL
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = 100 // 100 recensioni per file

    // Calculate offset
    const offset = (page - 1) * perPage

    console.log(`Generating sitemap for page ${page} (offset: ${offset}, items per page: ${perPage})`)

    // First get total count of approved reviews
    const { count, error: countError } = await supabaseClient
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (countError) {
      console.error('Error getting count:', countError)
      throw countError
    }

    console.log(`Total approved reviews: ${count}`)
    const totalPages = Math.ceil((count || 0) / perPage)
    console.log(`Total pages needed: ${totalPages}`)

    // Fetch reviews for the current page
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        condition_id,
        created_at,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    if (!reviews?.length) {
      console.log('No reviews found for this page')
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      })
    }

    console.log(`Processing ${reviews.length} reviews for page ${page}`)

    // Generate URLs
    const urls = reviews.map((review: Review) => {
      if (!review.PATOLOGIE?.Patologia) {
        console.warn(`Warning: Review ${review.id} has no associated condition`)
        return null
      }

      const conditionSlug = review.PATOLOGIE.Patologia.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        
      const titleSlug = review.title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')

      return `https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}`
    }).filter(url => url !== null)

    console.log(`Generated ${urls.length} valid URLs`)

    // Generate sitemap XML
    const urlset = urls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}
</urlset>`

    console.log(`Successfully generated sitemap for page ${page}`)

    return new Response(xml.trim(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    })
  }
})
