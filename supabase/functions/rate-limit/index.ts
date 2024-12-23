import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RATE_LIMIT = 100 // richieste
const TIME_WINDOW = 60 * 60 // 1 ora in secondi

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestione delle richieste OPTIONS per CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ottieni l'IP del client
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const currentTime = Math.floor(Date.now() / 1000)
    const windowStart = currentTime - TIME_WINDOW

    // Controlla il rate limit nella tabella rate_limits
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('ip_address', clientIP)
      .gte('last_request', windowStart)
      .single()

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Error checking rate limit:', rateLimitError)
      throw rateLimitError
    }

    const currentCount = rateLimitData?.request_count || 0

    if (currentCount >= RATE_LIMIT) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Troppe richieste. Per favore riprova più tardi.'
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (windowStart + TIME_WINDOW).toString()
          }
        }
      )
    }

    // Aggiorna o inserisci il conteggio delle richieste
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        ip_address: clientIP,
        request_count: currentCount + 1,
        last_request: currentTime
      })

    if (upsertError) {
      console.error('Error updating rate limit:', upsertError)
      throw upsertError
    }

    // Procedi con la richiesta originale
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': (RATE_LIMIT - (currentCount + 1)).toString(),
          'X-RateLimit-Reset': (windowStart + TIME_WINDOW).toString()
        }
      }
    )

  } catch (error) {
    console.error('Error in rate limit function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})