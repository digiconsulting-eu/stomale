
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

interface ReviewURL {
  id: number
  condition_slug: string
  title_slug: string
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const page = new URL(req.url).searchParams.get('page') || '1'
    const pageSize = 223
    const offset = (parseInt(page) - 1) * pageSize

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        title,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${reviews.map(review => {
  const condition_slug = review.PATOLOGIE?.Patologia.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''
  const title_slug = review.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `  <url>
    <loc>https://stomale.info/patologia/${condition_slug}/esperienza/${review.id}-${title_slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
}).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400'
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
})
