import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filename, content } = await req.json();

    if (!filename || !content) {
      throw new Error('Filename and content are required');
    }

    // Qui potresti implementare la logica per salvare il file su un bucket di storage
    // Per ora, simuliamo solo la risposta
    console.log(`Would save file ${filename} with content length ${content.length}`);

    return new Response(JSON.stringify({
      message: 'File saved successfully',
      filename
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in upload-sitemap:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
