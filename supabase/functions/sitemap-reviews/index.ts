import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CHUNK_SIZE = 250; // Numero di URL per ogni file sitemap

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching all reviews from database...');
    
    // Recupera tutte le recensioni approvate
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, title, condition:PATOLOGIE(Patologia)')
      .eq('status', 'approved')
      .order('id');

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    if (!reviews?.length) {
      console.log('No reviews found');
      throw new Error('No reviews found');
    }

    console.log(`Found ${reviews.length} reviews`);

    // Funzione per generare URL SEO-friendly
    const toSEOFriendlyURL = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    // Genera i contenuti dei sitemap
    const sitemapChunks = [];
    for (let i = 0; i < reviews.length; i += CHUNK_SIZE) {
      const chunk = reviews.slice(i, i + CHUNK_SIZE);
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(review => {
  const conditionSlug = toSEOFriendlyURL(review.condition?.Patologia || '');
  const titleSlug = toSEOFriendlyURL(review.title);
  return `  <url>
    <loc>https://stomale.info/patologia/${conditionSlug}/esperienza/${review.id}-${titleSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`;
      
      // Salva il contenuto nel database
      const fileName = `sitemap-reviews-${Math.floor(i / CHUNK_SIZE) + 1}.xml`;
      const { error: saveError } = await supabase
        .from('sitemap_files')
        .upsert({
          filename: fileName,
          url_count: chunk.length,
          last_modified: new Date().toISOString()
        }, {
          onConflict: 'filename'
        });

      if (saveError) {
        console.error(`Error saving sitemap file ${fileName}:`, saveError);
        throw saveError;
      }

      sitemapChunks.push({
        filename: fileName,
        content: sitemapContent,
        url_count: chunk.length
      });
    }

    console.log(`Generated ${sitemapChunks.length} sitemap files`);

    return new Response(JSON.stringify({
      message: 'Sitemaps generated successfully',
      sitemaps: sitemapChunks,
      url_count: reviews.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error generating sitemaps:', error);
    return new Response(JSON.stringify({
      error: 'Error generating sitemaps',
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
