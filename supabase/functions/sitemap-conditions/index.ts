import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8'
}

Deno.serve(async (req) => {
  const startTime = new Date().toISOString();
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const letter = pathParts[pathParts.length - 1].split('-').pop()?.split('.')[0] || 'a';
  
  console.log(`[${startTime}] Starting conditions sitemap generation for letter ${letter}...`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch conditions that start with the specified letter
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('PATOLOGIE')
      .select('Patologia')
      .ilike('Patologia', `${letter}%`)
      .order('Patologia');

    if (conditionsError) {
      throw conditionsError;
    }

    console.log(`[${startTime}] Found ${conditions?.length || 0} conditions for letter ${letter}`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add all conditions
    conditions?.forEach(condition => {
      const conditionSlug = condition.Patologia.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      xml += `
  <url>
    <loc>https://stomale.info/patologia/${encodeURIComponent(conditionSlug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    // Update the last_modified timestamp for this sitemap
    const { error: updateError } = await supabaseClient
      .from('sitemap_files')
      .update({ 
        last_modified: new Date().toISOString(),
        url_count: conditions?.length || 0
      })
      .eq('filename', `sitemap-conditions-${letter}.xml`);

    if (updateError) {
      console.error(`[${startTime}] Error updating sitemap file record:`, updateError);
    }

    console.log(`[${startTime}] Successfully generated sitemap for letter ${letter}`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`[${startTime}] Error generating conditions sitemap:`, error);
    return new Response(`Error generating conditions sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
})