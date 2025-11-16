
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting sitemap validation...');

    // Fetch all review sitemap files
    const { data: sitemapFiles, error: sitemapError } = await supabase
      .from('sitemap_files')
      .select('filename, url_count')
      .like('filename', 'sitemap-reviews%')
      .order('filename', { ascending: true });

    if (sitemapError) {
      throw new Error(`Error fetching sitemap files: ${sitemapError.message}`);
    }

    console.log(`Found ${sitemapFiles.length} sitemap files`);

    // Results will store our validation data
    const results = {
      totalFiles: sitemapFiles.length,
      totalUrls: 0,
      validUrls: 0,
      invalidUrls: 0,
      invalidUrlsList: [] as Array<{ url: string, reason: string, reviewId?: string, condition?: string }>,
      filesSummary: [] as Array<{ filename: string, totalUrls: number, validUrls: number, invalidUrls: number }>
    };

    // Process each sitemap file
    for (const file of sitemapFiles) {
      console.log(`Processing sitemap file: ${file.filename}`);
      
      // Get sitemap content from the storage bucket
      const { data: fileContent, error: fetchError } = await supabase
        .storage
        .from('public')
        .download(`sitemaps/${file.filename}`);

      if (fetchError || !fileContent) {
        console.error(`Error fetching sitemap file ${file.filename}:`, fetchError);
        results.filesSummary.push({
          filename: file.filename,
          totalUrls: 0,
          validUrls: 0,
          invalidUrls: 0
        });
        continue;
      }

      const xmlContent = await fileContent.text();
      
      // Extract URLs from the XML content
      const urlRegex = /<loc>(.*?)<\/loc>/g;
      const matches = [...xmlContent.matchAll(urlRegex)];
      const urls = matches.map(match => match[1]);
      
      console.log(`Found ${urls.length} URLs in ${file.filename}`);
      
      const fileSummary = {
        filename: file.filename,
        totalUrls: urls.length,
        validUrls: 0,
        invalidUrls: 0
      };
      
      results.totalUrls += urls.length;

      // Validate each URL
      for (const url of urls) {
        // Only process review URLs
        if (!url.includes('/patologia/') || !url.includes('/esperienza/')) {
          fileSummary.validUrls++;
          results.validUrls++;
          continue;
        }

        // Parse the URL to extract condition and reviewId
        const urlParts = url.split('/');
        const conditionIndex = urlParts.indexOf('patologia');
        const reviewIndex = urlParts.indexOf('esperienza');
        
        if (conditionIndex === -1 || reviewIndex === -1 || conditionIndex + 1 >= urlParts.length || reviewIndex + 1 >= urlParts.length) {
          fileSummary.invalidUrls++;
          results.invalidUrls++;
          results.invalidUrlsList.push({ url, reason: 'Malformed URL structure' });
          continue;
        }
        
        const condition = urlParts[conditionIndex + 1];
        const reviewIdWithSlug = urlParts[reviewIndex + 1];
        const reviewId = reviewIdWithSlug.split('-')[0];
        
        if (!reviewId || isNaN(Number(reviewId))) {
          fileSummary.invalidUrls++;
          results.invalidUrls++;
          results.invalidUrlsList.push({ 
            url, 
            reason: 'Invalid review ID',
            reviewId,
            condition 
          });
          continue;
        }

        // Check if the review exists in the database
        const { data: review, error: reviewError } = await supabase
          .from('reviews')
          .select('id, PATOLOGIE!inner(id, Patologia)')
          .eq('id', reviewId)
          .single();

        if (reviewError || !review) {
          fileSummary.invalidUrls++;
          results.invalidUrls++;
          results.invalidUrlsList.push({ 
            url, 
            reason: 'Review not found in database',
            reviewId,
            condition 
          });
          continue;
        }

        // Check if the condition in the URL matches the one in the database
        const dbCondition = review.PATOLOGIE?.Patologia?.toLowerCase().replace(/\s+/g, '-') || '';
        
        if (condition !== dbCondition) {
          fileSummary.invalidUrls++;
          results.invalidUrls++;
          results.invalidUrlsList.push({ 
            url, 
            reason: `Condition mismatch. URL: ${condition}, DB: ${dbCondition}`,
            reviewId,
            condition 
          });
          continue;
        }

        // If we made it here, the URL is valid
        fileSummary.validUrls++;
        results.validUrls++;
      }
      
      results.filesSummary.push(fileSummary);
    }

    // Return the validation results
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sitemap validator:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
