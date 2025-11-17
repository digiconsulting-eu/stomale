import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReviewUrl {
  id: number
  url: string
  review_id: number
}

const URLS_PER_SITEMAP = 5

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin', { user_id: user.id })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🚀 Starting sitemap regeneration...')

    // Fetch all URLs from review_urls table
    const { data: reviewUrls, error: fetchError } = await supabaseAdmin
      .from('review_urls')
      .select('id, url, review_id')
      .order('id', { ascending: true })

    if (fetchError) {
      console.error('❌ Error fetching review URLs:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch review URLs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!reviewUrls || reviewUrls.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No review URLs found',
        urlCount: 0,
        fileCount: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📊 Found ${reviewUrls.length} URLs to process`)

    // Split URLs into chunks
    const chunks: ReviewUrl[][] = []
    for (let i = 0; i < reviewUrls.length; i += URLS_PER_SITEMAP) {
      chunks.push(reviewUrls.slice(i, i + URLS_PER_SITEMAP))
    }

    console.log(`📦 Creating ${chunks.length} sitemap files...`)

    // Generate and upload sitemap files
    const uploadedFiles: string[] = []
    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1
      const filename = `sitemap-reviews-${chunkNumber}.xml`
      
      const xmlContent = generateSitemapXML(chunks[i])
      
      // Upload to storage bucket
      const { error: uploadError } = await supabaseAdmin.storage
        .from('sitemaps')
        .upload(filename, new Blob([xmlContent], { type: 'application/xml' }), {
          contentType: 'application/xml',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ Error uploading ${filename}:`, uploadError)
      } else {
        uploadedFiles.push(filename)
        if (chunkNumber % 10 === 0) {
          console.log(`  ✓ Generated ${chunkNumber}/${chunks.length} files...`)
        }
      }
    }

    console.log(`✅ Uploaded ${uploadedFiles.length} sitemap files`)

    // Generate and upload sitemap index
    console.log('📑 Generating sitemap index...')
    const indexContent = generateSitemapIndex(uploadedFiles)
    
    const { error: indexUploadError } = await supabaseAdmin.storage
      .from('sitemaps')
      .upload('sitemap-index.xml', new Blob([indexContent], { type: 'application/xml' }), {
        contentType: 'application/xml',
        upsert: true
      })

    if (indexUploadError) {
      console.error('❌ Error uploading sitemap index:', indexUploadError)
    } else {
      console.log('✅ Sitemap index uploaded')
    }

    console.log('\n🎉 Sitemap regeneration completed successfully!')

    return new Response(JSON.stringify({
      success: true,
      message: 'Sitemaps regenerated successfully',
      urlCount: reviewUrls.length,
      fileCount: uploadedFiles.length,
      files: uploadedFiles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error in regenerate-sitemaps:', errorMessage)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateSitemapXML(urls: ReviewUrl[]): string {
  const lastmod = new Date().toISOString().split('T')[0]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  for (const urlData of urls) {
    xml += `  <url>
    <loc>https://stomale.info${urlData.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
  }

  xml += `</urlset>`
  return xml
}

function generateSitemapIndex(sitemapFiles: string[]): string {
  const lastmod = new Date().toISOString().split('T')[0]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  for (const filename of sitemapFiles) {
    xml += `  <sitemap>
    <loc>https://stomale.info/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`
  }

  xml += `</sitemapindex>`
  return xml
}
