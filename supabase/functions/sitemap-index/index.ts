
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get total count of approved reviews
    const { count: reviewCount, error: countError } = await supabaseClient
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (countError) throw countError

    // Calculate number of sitemap files needed (200 URLs per file)
    const reviewsPerFile = 200
    const totalReviewSitemaps = Math.ceil((reviewCount || 0) / reviewsPerFile)

    // Create sitemap entries
    const today = new Date().toISOString().split('T')[0]
    
    // Static sitemap
    let sitemaps = `
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`

    // Conditions sitemaps
    const letters = ['a', 'b', 'c', 'd', 'e-l', 'm-r', 's-z']
    for (const letter of letters) {
      sitemaps += `
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-${letter}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    }

    // Reviews sitemaps
    for (let i = 1; i <= totalReviewSitemaps; i++) {
      sitemaps += `
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-reviews-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}
</sitemapindex>`

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
