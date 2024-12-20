import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { format } from 'https://esm.sh/date-fns@2.30.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: conditions } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia, created_at')

    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select(`
        title,
        updated_at,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')

    const baseUrl = 'https://stomale.info'
    const currentDate = format(new Date(), 'yyyy-MM-dd')

    const staticRoutes = [
      { url: baseUrl, priority: '1.0', changefreq: 'daily' },
      { url: `${baseUrl}/recensioni`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/nuova-recensione`, priority: '0.7', changefreq: 'weekly' },
      { url: `${baseUrl}/cerca-patologia`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/cerca-sintomi`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/inserisci-patologia`, priority: '0.6', changefreq: 'weekly' },
      { url: `${baseUrl}/privacy-policy`, priority: '0.3', changefreq: 'monthly' },
      { url: `${baseUrl}/cookie-policy`, priority: '0.3', changefreq: 'monthly' },
      { url: `${baseUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
    ].map(route => ({
      ...route,
      lastmod: currentDate
    }))

    const conditionUrls = conditions?.map(condition => ({
      url: `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia)}`,
      lastmod: format(new Date(condition.created_at || currentDate), 'yyyy-MM-dd'),
      priority: '0.8',
      changefreq: 'weekly'
    })) || []

    const reviewUrls = reviews?.map(review => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const titleSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        return {
          url: `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia)}/recensione/${titleSlug}`,
          lastmod: format(new Date(review.updated_at || currentDate), 'yyyy-MM-dd'),
          priority: '0.7',
          changefreq: 'monthly'
        }
      }
      return null
    }).filter(Boolean) || []

    const allUrls = [...staticRoutes, ...conditionUrls, ...reviewUrls]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    })
  }
})