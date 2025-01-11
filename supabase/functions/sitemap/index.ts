import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/xml; charset=UTF-8'
}

const BASE_URL = 'https://stomale.info';

// Utility function to format dates for sitemap
const formatDate = (date: string | Date) => {
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date().toISOString();
  }
}

// Utility function to encode URLs
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

// Define static pages with their priorities and update frequencies
const staticPages = [
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

Deno.serve(async (req) => {
  console.log('[Sitemap Function] Starting request handling...');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[Sitemap Function] Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log('[Sitemap Function] Initializing sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration error: Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Sitemap Function] Supabase client initialized');

    // Fetch conditions
    console.log('[Sitemap Function] Fetching conditions...');
    const { data: conditions, error: conditionsError } = await supabase
      .from('PATOLOGIE')
      .select('Patologia, created_at')
      .order('created_at', { ascending: false });

    if (conditionsError) {
      console.error('[Sitemap Function] Error fetching conditions:', conditionsError);
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
    }

    // Fetch approved reviews
    console.log('[Sitemap Function] Fetching reviews...');
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
      console.error('[Sitemap Function] Error fetching reviews:', reviewsError);
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    console.log('[Sitemap Function] Generating XML content...');
    
    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    staticPages.forEach(page => {
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

    // Add reviews pages with more detailed metadata
    reviews?.forEach(review => {
      if (review.PATOLOGIE?.Patologia && review.title) {
        const encodedCondition = encodeUrl(review.PATOLOGIE.Patologia);
        const reviewSlug = encodeUrl(review.title);
          
        if (encodedCondition && reviewSlug) {
          xml += `  <url>\n`;
          xml += `    <loc>${BASE_URL}/patologia/${encodedCondition}/esperienza/${reviewSlug}</loc>\n`;
          // Use updated_at if available, otherwise fall back to created_at
          xml += `    <lastmod>${formatDate(review.updated_at || review.created_at)}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    });

    xml += '</urlset>';

    console.log('[Sitemap Function] XML sitemap generation completed successfully');

    // Store the sitemap in Supabase Storage for caching
    const timestamp = new Date().toISOString();
    const filename = `sitemap-${timestamp}.xml`;
    
    const { error: storageError } = await supabase
      .storage
      .from('sitemaps')
      .upload(filename, xml, {
        contentType: 'application/xml',
        cacheControl: '3600',
        upsert: true
      });

    if (storageError) {
      console.error('[Sitemap Function] Error storing sitemap:', storageError);
    } else {
      console.log('[Sitemap Function] Sitemap stored successfully');
    }

    return new Response(xml, { headers: corsHeaders });

  } catch (error) {
    console.error('[Sitemap Function] Fatal error:', error);
    
    // Return error in XML format with correct content type
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap: ${error.message} -->
</urlset>`;
    
    return new Response(errorXml, { 
      headers: corsHeaders,
      status: 500
    });
  }
});