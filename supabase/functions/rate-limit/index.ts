import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface RateLimit {
  ip_address: string;
  request_count: number;
  last_request: number;
}

const WINDOW_SIZE = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per minute

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  // Accept both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    console.log(`[Rate Limit] Processing ${req.method} request`);
    
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    console.log(`[Rate Limit] Checking rate limit for IP: ${ip}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = Date.now();
    const windowStart = now - WINDOW_SIZE;

    // Check existing rate limit
    const { data: limits, error: selectError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Rate Limit] Error checking rate limit:', selectError);
      throw selectError;
    }

    let rateLimit: RateLimit;

    if (!limits) {
      // Create new rate limit entry
      const { data: newLimit, error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          ip_address: ip,
          request_count: 1,
          last_request: now
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Rate Limit] Error creating rate limit:', insertError);
        throw insertError;
      }

      rateLimit = newLimit;
      console.log('[Rate Limit] Created new rate limit entry:', newLimit);
    } else {
      rateLimit = limits;

      // Reset count if window has passed
      if (rateLimit.last_request < windowStart) {
        const { error: updateError } = await supabase
          .from('rate_limits')
          .update({
            request_count: 1,
            last_request: now
          })
          .eq('ip_address', ip);

        if (updateError) {
          console.error('[Rate Limit] Error resetting rate limit:', updateError);
          throw updateError;
        }

        rateLimit.request_count = 1;
        rateLimit.last_request = now;
        console.log('[Rate Limit] Reset rate limit for IP:', ip);
      } else {
        // Increment count if within window
        if (rateLimit.request_count >= MAX_REQUESTS) {
          console.log('[Rate Limit] Rate limit exceeded for IP:', ip);
          return new Response(
            JSON.stringify({
              error: 'Too many requests',
              retryAfter: Math.ceil((rateLimit.last_request + WINDOW_SIZE - now) / 1000)
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((rateLimit.last_request + WINDOW_SIZE - now) / 1000).toString()
              }
            }
          );
        }

        const { error: incrementError } = await supabase
          .from('rate_limits')
          .update({
            request_count: rateLimit.request_count + 1,
            last_request: now
          })
          .eq('ip_address', ip);

        if (incrementError) {
          console.error('[Rate Limit] Error incrementing rate limit:', incrementError);
          throw incrementError;
        }

        rateLimit.request_count++;
        rateLimit.last_request = now;
        console.log('[Rate Limit] Updated rate limit for IP:', ip);
      }
    }

    // Return remaining requests info
    return new Response(
      JSON.stringify({
        remaining: MAX_REQUESTS - rateLimit.request_count,
        reset: Math.ceil((rateLimit.last_request + WINDOW_SIZE - now) / 1000)
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': (MAX_REQUESTS - rateLimit.request_count).toString(),
          'X-RateLimit-Reset': Math.ceil((rateLimit.last_request + WINDOW_SIZE - now) / 1000).toString()
        }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Rate Limit] Fatal error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage
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