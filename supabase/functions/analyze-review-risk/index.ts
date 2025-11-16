import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviews } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Analyzing ${reviews.length} reviews with AI`);

    // Analyze reviews in smaller batches
    const batchSize = 5; // Reduce to 5 per batch for faster processing
    const results = [];

    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reviews.length / batchSize)}`);

      const batchPromises = batch.map(async (review: any) => {
        const prompt = `Analizza questa recensione medica e determina se è autentica o generata da AI.

Recensione:
Titolo: ${review.title}
Esperienza: ${review.experience}

Valuta questi aspetti:
1. Tono personale ed emotivo vs. formale/enciclopedico
2. Dettagli specifici (date, farmaci, misure) vs. informazioni generiche
3. Errori di battitura o abbreviazioni informali (nn, xché, x) vs. grammatica perfetta
4. Emotività (punteggiatura espressiva, emoticon) vs. testo asettico
5. Coerenza narrativa personale vs. struttura standard

Rispondi SOLO con un JSON in questo formato (nessun altro testo):
{
  "score": <numero da 0 a 100>,
  "category": "<AUTENTICA|BASSO|MEDIO|ALTO|CRITICO>",
  "reasons": ["motivo1", "motivo2"]
}

Scala:
- 0-14: AUTENTICA (chiaramente scritta da persona reale)
- 15-29: BASSO (probabilmente autentica con qualche dubbio)
- 30-49: MEDIO (segnali misti)
- 50-69: ALTO (probabilmente AI-generated)
- 70-100: CRITICO (quasi certamente AI-generated)`;

        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { 
                  role: 'system', 
                  content: 'Sei un esperto di analisi del testo che identifica contenuti generati da AI. Rispondi SOLO con JSON valido, nessun altro testo.' 
                },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              console.error('Rate limit exceeded');
              throw new Error('Rate limit exceeded');
            }
            if (response.status === 402) {
              console.error('Payment required');
              throw new Error('Payment required - add credits to workspace');
            }
            const errorText = await response.text();
            console.error('AI API error:', response.status, errorText);
            throw new Error(`AI API error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (!content) {
            throw new Error('No content in AI response');
          }

          // Extract JSON from response (handle markdown code blocks)
          let jsonStr = content.trim();
          if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          }

          const analysis = JSON.parse(jsonStr);

          return {
            id: review.id,
            score: analysis.score,
            category: analysis.category,
            reasons: analysis.reasons,
          };
        } catch (error) {
          console.error(`Error analyzing review ${review.id}:`, error);
          // Fallback to heuristic if AI fails
          return {
            id: review.id,
            score: 50,
            category: 'MEDIO',
            reasons: ['Errore durante analisi AI'],
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < reviews.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Analysis complete: ${results.length} reviews processed`);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-review-risk:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
