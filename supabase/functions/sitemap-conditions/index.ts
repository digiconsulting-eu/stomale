
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
    const url = new URL(req.url)
    const letter = url.searchParams.get('letter')?.toUpperCase() || 'A'

    // Initialize the Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let query = supabaseAdmin
      .from('PATOLOGIE')
      .select('Patologia')
      .order('Patologia')

    // Filter by letter range
    if (letter === 'A') {
      query = query.ilike('Patologia', 'a%')
    } else if (letter === 'B') {
      query = query.ilike('Patologia', 'b%')
    } else if (letter === 'C') {
      query = query.ilike('Patologia', 'c%')
    } else if (letter === 'D') {
      query = query.ilike('Patologia', 'd%')
    } else if (letter === 'E-L') {
      query = query.or('Patologia.ilike.e%,Patologia.ilike.f%,Patologia.ilike.g%,Patologia.ilike.h%,Patologia.ilike.i%,Patologia.ilike.j%,Patologia.ilike.k%,Patologia.ilike.l%')
    } else if (letter === 'M-R') {
      query = query.or('Patologia.ilike.m%,Patologia.ilike.n%,Patologia.ilike.o%,Patologia.ilike.p%,Patologia.ilike.q%,Patologia.ilike.r%')
    } else if (letter === 'S-Z') {
      query = query.or('Patologia.ilike.s%,Patologia.ilike.t%,Patologia.ilike.u%,Patologia.ilike.v%,Patologia.ilike.w%,Patologia.ilike.x%,Patologia.ilike.y%,Patologia.ilike.z%')
    }

    const { data: conditions } = await query

    // Generate XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add URLs for each condition
    conditions?.forEach((condition) => {
      const slug = condition.Patologia.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      
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
    console.error('Error generating conditions sitemap:', error)
    return new Response(`Error generating conditions sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    })
  }
})
