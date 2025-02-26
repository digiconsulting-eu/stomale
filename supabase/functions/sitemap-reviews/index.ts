
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
    console.log('Starting sitemap generation...')
    
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

    console.log(`Processing page ${page}`)
    console.log(`Using offset: ${offset}`)
    console.log(`Items per page: ${perPage}`)

    // First get total count of approved reviews with detailed error logging
    const { count, error: countError } = await supabaseClient
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (countError) {
      console.error('Error getting count:', countError)
      throw countError
    }

    const totalPages = Math.ceil((count || 0) / perPage)
    
    console.log(`Total approved reviews found: ${count}`)
    console.log(`Total pages needed: ${totalPages}`)

    if (page > totalPages) {
      console.log(`Page ${page} requested but only ${totalPages} pages exist`)
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      })
    }

    // Fetch reviews for the current page with detailed logging
    console.log(`Fetching reviews for page ${page} with offset ${offset}`)
    
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
      .order('id', { ascending: true })
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

    console.log(`Found ${reviews.length} reviews for page ${page}`)
    console.log(`First review ID: ${reviews[0].id}`)
    console.log(`Last review ID: ${reviews[reviews.length - 1].id}`)
    console.log('Review IDs:', reviews.map(r => r.id).join(', '))

    // Generate and log URLs
    const urls = reviews.map((review: Review) => {
      if (!review.PATOLOGIE?.Patologia) {
        console.warn(`Warning: Review ${review.id} has no associated condition`)
        return null
      }

      const conditionSlug = review.PATOLOGIE.Patologia.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        
      const titleSlug = review.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')

      const url = `https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}`
      
      console.log(`Generated URL for review ${review.id}: ${url}`)
      return url
    }).filter(url => url !== null) // Remove any null URLs

    // Generate sitemap XML
    const urlset = urls.map(url => `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}
</urlset>`

    console.log(`Successfully generated sitemap for page ${page} with ${urls.length} URLs`)

    return new Response(xml, {
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
