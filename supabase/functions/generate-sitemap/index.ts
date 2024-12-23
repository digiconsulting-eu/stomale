import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = 'https://stomale.info';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Generate Sitemap] Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conditions
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia');

    if (conditionsError) {
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        title,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved');

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    // Generate both XML and TXT sitemaps
    const encodeUrl = (str: string) => {
      return str.toLowerCase().split(' ').map(part => encodeURIComponent(part)).join('%20');
    };

    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages = [
      '/',
      '/recensioni',
      '/cerca-patologia',
      '/nuova-recensione',
      '/inserisci-patologia',
      '/cerca-sintomi',
      '/cookie-policy',
      '/privacy-policy',
      '/terms'
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${BASE_URL}${page}</loc>\n  </url>\n`;
    });
    
    // Add conditions
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n  </url>\n`;
      }
    });

    // Add reviews
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        xml += `  <url>\n    <loc>${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}</loc>\n  </url>\n`;
      }
    });

    xml += '</urlset>';

    // Generate TXT sitemap
    let txt = 'SITEMAP STOMALE.INFO\n\n';
    txt += `Homepage:\n${BASE_URL}/\n\n`;
    txt += `Recensioni:\n${BASE_URL}/recensioni\n\n`;

    txt += 'Patologie:\n';
    conditions?.forEach((condition) => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        txt += `${BASE_URL}/patologia/${encodedCondition}\n`;
      }
    });
    txt += '\n';

    txt += 'Recensioni per patologia:\n';
    reviews?.forEach((review) => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = review.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        txt += `${BASE_URL}/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
      }
    });
    txt += '\n';

    txt += 'Altre pagine:\n';
    staticPages.slice(2).forEach(page => {
      txt += `${BASE_URL}${page}\n`;
    });

    // Save both versions to storage
    const timestamp = new Date().toISOString().split('T')[0];
    
    const { error: xmlError } = await supabase.storage
      .from('sitemaps')
      .upload(`sitemap-${timestamp}.xml`, xml, {
        contentType: 'application/xml',
        upsert: true
      });

    if (xmlError) {
      throw new Error(`Failed to upload XML sitemap: ${xmlError.message}`);
    }

    const { error: txtError } = await supabase.storage
      .from('sitemaps')
      .upload(`sitemap-${timestamp}.txt`, txt, {
        contentType: 'text/plain',
        upsert: true
      });

    if (txtError) {
      throw new Error(`Failed to upload TXT sitemap: ${txtError.message}`);
    }

    // Create public URLs for the latest sitemaps
    const { error: xmlCopyError } = await supabase.storage
      .from('sitemaps')
      .copy(`sitemap-${timestamp}.xml`, 'sitemap.xml');

    if (xmlCopyError) {
      throw new Error(`Failed to copy XML sitemap: ${xmlCopyError.message}`);
    }

    const { error: txtCopyError } = await supabase.storage
      .from('sitemaps')
      .copy(`sitemap-${timestamp}.txt`, 'sitemap.txt');

    if (txtCopyError) {
      throw new Error(`Failed to copy TXT sitemap: ${txtCopyError.message}`);
    }

    console.log('[Generate Sitemap] Sitemap generation completed successfully');

    return new Response(
      JSON.stringify({ success: true, timestamp }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('[Generate Sitemap] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate sitemap',
        message: error.message
      }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});