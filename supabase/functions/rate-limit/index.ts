import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get IP address from request headers
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    console.log('Processing request from IP:', ip)

    // Get current timestamp
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute window

    try {
      // Clean up old records first
      const { error: cleanupError } = await supabaseClient
        .from('rate_limits')
        .delete()
        .lt('last_request', now - windowMs)

      if (cleanupError) {
        console.error('Error cleaning up old records:', cleanupError)
      }

      // Get current rate limit record
      const { data: records, error: fetchError } = await supabaseClient
        .from('rate_limits')
        .select('*')
        .eq('ip_address', ip)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        console.error('Error fetching rate limit record:', fetchError)
        throw fetchError
      }

      if (!records) {
        // First request from this IP
        const { error: insertError } = await supabaseClient
          .from('rate_limits')
          .insert({
            ip_address: ip,
            request_count: 1,
            last_request: now
          })

        if (insertError) {
          console.error('Error inserting new rate limit record:', insertError)
          throw insertError
        }

        return new Response(
          JSON.stringify({ remaining: 59 }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      // Check if we're still within the window
      if (now - records.last_request > windowMs) {
        // Window expired, reset count
        const { error: updateError } = await supabaseClient
          .from('rate_limits')
          .update({
            request_count: 1,
            last_request: now
          })
          .eq('ip_address', ip)

        if (updateError) {
          console.error('Error resetting rate limit:', updateError)
          throw updateError
        }

        return new Response(
          JSON.stringify({ remaining: 59 }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      // Check if rate limit exceeded
      if (records.request_count >= 60) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        )
      }

      // Increment request count
      const { error: updateError } = await supabaseClient
        .from('rate_limits')
        .update({
          request_count: records.request_count + 1,
          last_request: now
        })
        .eq('ip_address', ip)

      if (updateError) {
        console.error('Error updating rate limit:', updateError)
        throw updateError
      }

      console.log('Rate limit processed successfully for IP:', ip)
      return new Response(
        JSON.stringify({ remaining: 60 - (records.request_count + 1) }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (error) {
      console.error('Database operation failed:', error)
      throw error
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})