
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
    console.log('Starting sitemap generation with service role...')
    
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get page parameter from URL
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = 100

    console.log(`Processing page ${page} with ${perPage} items per page`)

    // First get total count with detailed logging
    const { count, error: countError } = await supabaseClient
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (countError) {
      console.error('Error getting review count:', countError)
      throw countError
    }

    console.log(`Found ${count} total approved reviews`)

    if (!count || count === 0) {
      console.log('No approved reviews found')
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      })
    }

    const totalPages = Math.ceil(count / perPage)
    console.log(`Total pages needed: ${totalPages}`)

    if (page > totalPages) {
      console.log(`Requested page ${page} exceeds total pages ${totalPages}`)
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      })
    }

    // Calculate offset
    const offset = (page - 1) * perPage
    console.log(`Using offset: ${offset}`)

    // Fetch reviews with detailed logging
    console.log('Fetching reviews from database...')
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        condition_id,
        created_at,
        PATOLOGIE (
          id,
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

    if (!reviews || reviews.length === 0) {
      console.log('No reviews found for the current page')
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      })
    }

    console.log(`Processing ${reviews.length} reviews`)

    // Generate URLs with detailed logging
    const urls = reviews.map((review: Review) => {
      if (!review.PATOLOGIE?.Patologia) {
        console.warn(`Review ${review.id} has no associated condition (condition_id: ${review.condition_id})`)
        return null
      }

      console.log(`Processing review ${review.id} with condition "${review.PATOLOGIE.Patologia}"`)

      const conditionSlug = review.PATOLOGIE.Patologia.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        
      const titleSlug = review.title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')

      const url = `https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}`
      console.log(`Generated URL: ${url}`)
      return url
    }).filter(url => url !== null)

    console.log(`Generated ${urls.length} valid URLs out of ${reviews.length} reviews`)

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

    console.log('Sitemap generation completed successfully')

    return new Response(xml.trim(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })

  } catch (error) {
    console.error('Fatal error in sitemap generation:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    })
  }
})
