
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const generateSitemapXML = (conditions: any[]) => {
  const urlEntries = conditions.map(condition => {
    const slugPatologia = condition.Patologia
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Rimuovi caratteri speciali
      .replace(/\s+/g, '-')      // Sostituisci spazi con trattini
      .trim()

    return `  <url>
    <loc>https://stomale.info/patologia/${slugPatologia}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Ottieni la lettera per filtrare le condizioni
    const url = new URL(req.url)
    const letter = url.searchParams.get('letter') || 'a'

    // Crea il client Supabase con service role key per accesso completo
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Query per ottenere le patologie che iniziano con la lettera specificata
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .ilike('Patologia', `${letter}%`)
      .order('Patologia', { ascending: true })

    if (error) {
      console.error('Errore durante il recupero delle patologie:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const xml = generateSitemapXML(conditions)

    return new Response(xml, {
      headers: corsHeaders,
      status: 200
    })
  } catch (error) {
    console.error('Errore durante la generazione della sitemap:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
