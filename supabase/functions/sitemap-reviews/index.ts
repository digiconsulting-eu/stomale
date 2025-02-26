
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const ITEMS_PER_PAGE = 200;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calcola l'offset per la paginazione
    const offset = (page - 1) * ITEMS_PER_PAGE;

    console.log(`Generating sitemap for page ${page}`);

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select('id, title, condition:PATOLOGIE(Patologia)', { count: 'exact' })
      .eq('status', 'approved')
      .order('id')
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    if (!reviews?.length) {
      console.log('No reviews found for this page');
      return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml'
        }
      });
    }

    console.log(`Found ${reviews.length} reviews for page ${page}`);

    // Funzione per generare URL SEO-friendly
    const toSEOFriendlyURL = (text: string): string => {
      if (!text) return '';
      return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    // Genera il contenuto XML della sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${reviews.map(review => {
  const conditionSlug = toSEOFriendlyURL(review.condition?.Patologia || '');
  const titleSlug = toSEOFriendlyURL(review.title);
  return `  <url>
    <loc>https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    // Aggiorna o inserisci il record nella tabella sitemap_files
    const fileName = `sitemap-reviews-${page}.xml`;
    await supabase
      .from('sitemap_files')
      .upsert({
        filename: fileName,
        url_count: reviews.length,
        last_modified: new Date().toISOString()
      }, {
        onConflict: 'filename'
      });

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(JSON.stringify({
      error: 'Error generating sitemap',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
