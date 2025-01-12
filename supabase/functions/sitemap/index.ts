import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain; charset=utf-8'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Generating sitemap in text format...')
    
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
      .select('id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    const baseUrl = 'https://stomale.info'

    // Start building the text content
    let text = 'Sitemap URLs:\n\n'

    // Add static pages
    const staticPages = [
      { url: '', priority: '1.0' },
      { url: 'recensioni', priority: '0.9' },
      { url: 'cerca-patologia', priority: '0.8' },
      { url: 'cerca-sintomi', priority: '0.8' }
    ]

    text += '--- Static Pages ---\n'
    staticPages.forEach(page => {
      text += `${baseUrl}${page.url ? '/' + page.url : ''} (Priority: ${page.priority})\n`
    })

    // Add condition pages
    text += '\n--- Condition Pages ---\n'
    conditions?.forEach(condition => {
      const slug = encodeURIComponent(condition.Patologia.toLowerCase())
      text += `${baseUrl}/patologia/${slug} (Priority: 0.9)\n`
    })

    // Add review pages
    text += '\n--- Review Pages ---\n'
    reviews?.forEach(review => {
      text += `${baseUrl}/recensione/${review.id} (Priority: 0.7)\n`
    })

    console.log('Generated text sitemap successfully')
    console.log('Number of conditions:', conditions?.length)
    console.log('Number of reviews:', reviews?.length)

    return new Response(text, {
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