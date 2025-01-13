import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { slugify } from 'https://deno.land/x/slugify@0.3.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting sitemap generation...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Required environment variables are not set')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    console.log('Fetching reviews from database...')

    // Fetch all reviews with their condition names
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        PATOLOGIE (
          Patologia
        )
      `)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    console.log(`Found ${reviews?.length || 0} reviews`)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Generate URLs for each review
    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia) {
        const condition = review.PATOLOGIE.Patologia.toLowerCase()
        const titleSlug = slugify(review.title)
        const url = `https://stomale.info/patologia/${condition}/esperienza/${review.id}-${titleSlug}`
        
        xml += `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
      }
    })

    xml += `
</urlset>`

    console.log('Generated XML sitemap')

    // Update sitemap_files table with new count
    const { error: updateError } = await supabaseClient
      .from('sitemap_files')
      .upsert({
        filename: 'sitemap-reviews.xml',
        last_modified: new Date().toISOString(),
        url_count: reviews?.length || 0
      })

    if (updateError) {
      console.error('Error updating sitemap_files:', updateError)
    }

    // Upload to storage
    const { error: uploadError } = await supabaseClient
      .storage
      .from('sitemaps')
      .upload('sitemap-reviews.xml', xml, {
        contentType: 'application/xml',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading sitemap:', uploadError)
      throw uploadError
    }

    console.log('Sitemap uploaded successfully')

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('sitemaps')
      .getPublicUrl('sitemap-reviews.xml')

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})