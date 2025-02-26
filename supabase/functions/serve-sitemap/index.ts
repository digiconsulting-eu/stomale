
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8'
      }
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    
    if (!type) throw new Error('Type parameter is required')

    // Get sitemap from database
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('type', `sitemap-${type}`)
      .single()

    if (error) throw error
    if (!data) throw new Error('Sitemap not found')

    return new Response(data.content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error serving sitemap:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
