import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Read the sitemap content from the request
    const { filename, content } = await req.json()
    
    console.log(`Uploading sitemap file: ${filename}`)

    // Upload the file to the sitemaps bucket
    const { error: uploadError } = await supabaseClient
      .storage
      .from('sitemaps')
      .upload(filename, content, {
        contentType: 'application/xml',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading sitemap:', uploadError)
      throw uploadError
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('sitemaps')
      .getPublicUrl(filename)

    console.log(`Sitemap uploaded successfully. Public URL: ${publicUrl}`)

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