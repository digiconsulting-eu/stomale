
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate conditions sitemap
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    if (conditionsError) throw conditionsError

    const conditionsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${conditions.map(c => `  <url>
    <loc>https://stomale.info/patologia/${c.Patologia.toLowerCase()}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

    // Generate reviews sitemap
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, title, condition_id, PATOLOGIE(Patologia)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (reviewsError) throw reviewsError

    const reviewsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${reviews.map(r => `  <url>
    <loc>https://stomale.info/patologia/${r.PATOLOGIE?.Patologia.toLowerCase()}/esperienza/${r.id}-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

    // Save sitemaps to the database
    const { error: saveConditionsError } = await supabase
      .from('site_content')
      .upsert({
        type: 'sitemap-conditions',
        content: conditionsSitemap,
        updated_at: new Date().toISOString()
      }, { onConflict: 'type' })

    if (saveConditionsError) throw saveConditionsError

    const { error: saveReviewsError } = await supabase
      .from('site_content')
      .upsert({
        type: 'sitemap-reviews',
        content: reviewsSitemap,
        updated_at: new Date().toISOString()
      }, { onConflict: 'type' })

    if (saveReviewsError) throw saveReviewsError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error updating sitemaps:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
