import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=UTF-8'
}

const BASE_URL = 'https://stomale.info';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/recensioni', priority: '0.9', changefreq: 'daily' },
  { path: '/cerca-patologia', priority: '0.8', changefreq: 'weekly' },
  { path: '/cerca-sintomi', priority: '0.8', changefreq: 'weekly' },
  { path: '/nuova-recensione', priority: '0.7', changefreq: 'monthly' },
  { path: '/inserisci-patologia', priority: '0.6', changefreq: 'monthly' },
  { path: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' }
];

const formatDate = (date: string | Date) => {
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date().toISOString();
  }
}

const encodeUrl = (str: string) => {
  if (!str) {
    console.warn('Empty string passed to encodeUrl');
    return '';
  }
  return str.toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia, created_at')
      .order('created_at', { ascending: false });

    if (conditionsError) {
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        title,
        created_at,
        updated_at,
        PATOLOGIE (
          Patologia
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    // Generate XML sitemap with XML declaration
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    staticRoutes.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
      xml += `    <lastmod>${formatDate(new Date())}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Add conditions pages
    conditions?.forEach(condition => {
      if (condition.Patologia) {
        const encodedCondition = encodeUrl(condition.Patologia);
        if (encodedCondition) {
          xml += `  <url>\n`;
          xml += `    <loc>${BASE_URL}/patologia/${encodedCondition}</loc>\n`;
          xml += `    <lastmod>${formatDate(condition.created_at)}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    });

    // Add reviews pages
    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = encodeUrl(review.title);
          
        if (encodedCondition && reviewSlug) {
          xml += `  <url>\n`;
          xml += `    <loc>${BASE_URL}/patologia/${encodedCondition}/esperienza/${reviewSlug}</loc>\n`;
          xml += `    <lastmod>${formatDate(review.updated_at || review.created_at)}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    });

    xml += '</urlset>';

    // Return the XML with proper headers
    return new Response(xml, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=UTF-8'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap: ${error.message} -->
</urlset>`;
    
    return new Response(errorXml, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      status: 500
    });
  }
});