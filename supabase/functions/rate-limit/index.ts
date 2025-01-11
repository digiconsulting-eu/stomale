import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get IP address from request headers
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    console.log('Client IP:', clientIP);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if IP exists in rate_limits table
    const { data: existingLimit, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('ip_address', clientIP)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching rate limit:', fetchError);
      throw fetchError;
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 60; // Max requests per minute

    if (existingLimit) {
      // Check if window has expired
      if (now - existingLimit.last_request > windowMs) {
        // Reset counter for new window
        const { error: updateError } = await supabaseClient
          .from('rate_limits')
          .update({
            request_count: 1,
            last_request: now,
          })
          .eq('ip_address', clientIP);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ remaining: maxRequests - 1 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if rate limit exceeded
      if (existingLimit.request_count >= maxRequests) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { 
            status: 429,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          }
        );
      }

      // Increment counter
      const { error: updateError } = await supabaseClient
        .from('rate_limits')
        .update({
          request_count: existingLimit.request_count + 1,
          last_request: now,
        })
        .eq('ip_address', clientIP);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ remaining: maxRequests - (existingLimit.request_count + 1) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Create new rate limit entry
      const { error: insertError } = await supabaseClient
        .from('rate_limits')
        .insert({
          ip_address: clientIP,
          request_count: 1,
          last_request: now,
        });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ remaining: maxRequests - 1 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in rate-limit function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});