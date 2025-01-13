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
    console.log('Starting sitemap generation process...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing required environment variables')
      throw new Error('Required environment variables are not set')
    }

    console.log('Initializing Supabase client...')
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    console.log('Starting database query for reviews...')

    // First get total count for logging
    const { count, error: countError } = await supabaseClient
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (countError) {
      console.error('Error getting total count:', countError)
      throw countError
    }

    console.log(`Total approved reviews in database: ${count}`)

    // Then fetch all reviews with their condition names
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        title,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    if (!reviews) {
      console.log('No reviews found in database')
      reviews = []
    }

    console.log(`Successfully fetched ${reviews.length} reviews`)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Generate URLs for each review
    reviews.forEach((review, index) => {
      console.log(`Processing review ${index + 1}/${reviews.length}: ID ${review.id}`)
      
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
      } else {
        console.warn(`Review ${review.id} has no associated condition, skipping...`)
      }
    })

    xml += `
</urlset>`

    console.log('Generated XML sitemap with', reviews.length, 'URLs')

    // Update sitemap_files table with new count
    const { error: updateError } = await supabaseClient
      .from('sitemap_files')
      .upsert({
        filename: 'sitemap-reviews.xml',
        last_modified: new Date().toISOString(),
        url_count: reviews.length
      })

    if (updateError) {
      console.error('Error updating sitemap_files:', updateError)
    } else {
      console.log('Updated sitemap_files table. New count:', reviews.length)
    }

    // Upload to storage
    console.log('Uploading sitemap to storage...')
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

    console.log('Sitemap successfully uploaded to storage')

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('sitemaps')
      .getPublicUrl('sitemap-reviews.xml')

    console.log('Sitemap generation completed successfully')
    console.log('Public URL:', publicUrl)
    console.log('Total reviews included:', reviews.length)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl, 
        reviewCount: reviews.length,
        message: `Successfully generated sitemap with ${reviews.length} reviews` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in sitemap generation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})