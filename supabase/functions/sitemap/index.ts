
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize the Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all conditions ordered by creation date
    const { data: conditions } = await supabaseAdmin
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add URLs for each condition - usando sempre il formato con spazi codificati
    conditions?.forEach((condition) => {
      const slug = condition.Patologia.toLowerCase();
      
      xml += '  <url>\n'
      xml += `    <loc>https://stomale.info/patologia/${slug}</loc>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.8</priority>\n'
      xml += '  </url>\n'
    })

    xml += '</urlset>'

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating sitemap:', errorMessage);
    return new Response(`Error generating sitemap: ${errorMessage}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})
