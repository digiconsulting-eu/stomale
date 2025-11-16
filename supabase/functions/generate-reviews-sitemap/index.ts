
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Funzione slugify robusta
function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .substring(0, 70);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the start and end ID from the URL parameters
    const url = new URL(req.url)
    const startId = parseInt(url.searchParams.get('startId') || '103')
    const endId = parseInt(url.searchParams.get('endId') || '203')

    console.log(`Getting reviews with ID from ${startId} to ${endId}`)

    // Query the database for approved reviews
    const { data: reviews, error } = await supabaseClient
      .from('reviews')
      .select(`
        id, 
        title, 
        PATOLOGIE (
          Patologia
        )
      `)
      .gte('id', startId)
      .lte('id', endId)
      .eq('status', 'approved')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching reviews:', error)
      return new Response(
        JSON.stringify({ error: 'Error fetching reviews' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    console.log(`Found ${reviews?.length || 0} reviews`)

    // Generate XML
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    if (reviews && reviews.length > 0) {
      reviews.forEach((review: any) => {
        if (review.PATOLOGIE && !Array.isArray(review.PATOLOGIE) && review.PATOLOGIE.Patologia) {
          const conditionSlug = slugify(review.PATOLOGIE.Patologia);
          const titleSlug = slugify(review.title);
          const url = `https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}`;
          
          xmlContent += `  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }
      });
    }

    xmlContent += `</urlset>`;

    // Return the XML content
    return new Response(
      xmlContent,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
