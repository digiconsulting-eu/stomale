
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const generateSitemapXML = (reviews: any[]) => {
  const urlEntries = reviews.map(review => {
    // Genera un titolo URL-friendly
    const slugTitle = review.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Rimuovi caratteri speciali
      .replace(/\s+/g, '-')      // Sostituisci spazi con trattini
      .trim()

    return `  <url>
    <loc>https://stomale.info/patologia/${review.patologia.toLowerCase().replace(/\s+/g, '-')}/esperienza/${review.id}-${slugTitle}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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
    // Ottieni il parametro page dall'URL
    const url = new URL(req.url)
    const page = url.searchParams.get('page') || '1'
    const pageNumber = parseInt(page, 10)
    const pageSize = 100  // Numero di recensioni per pagina
    const offset = (pageNumber - 1) * pageSize

    // Crea il client Supabase con service role key per accesso completo
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Prima query per ottenere i dati di recensioni con join alla tabella patologie
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id, 
        title, 
        patologia: PATOLOGIE!condition_id (Patologia)
      `)
      .eq('status', 'approved')
      .range(offset, offset + pageSize - 1)
      .order('id', { ascending: true })

    if (error) {
      console.error('Errore durante il recupero delle recensioni:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      title: review.title,
      patologia: review.patologia?.Patologia || 'patologia-non-specificata'
    }))

    const xml = generateSitemapXML(formattedReviews)

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
