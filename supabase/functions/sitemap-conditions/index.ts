
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurazione CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

// Funzione slugify robusta
function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Normalizza i caratteri accentati
    .replace(/[\u0300-\u036f]/g, '') // Rimuove gli accenti
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Sostituisce spazi con -
    .replace(/[^\w-]+/g, '') // Rimuove caratteri non validi
    .replace(/--+/g, '-') // Sostituisce multipli - con uno solo
    .substring(0, 70); // Limita la lunghezza per sicurezza
}

Deno.serve(async (req) => {
  // Gestione delle richieste OPTIONS per CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ottieni il parametro della lettera dalla query string
    const url = new URL(req.url);
    const letter = url.searchParams.get('letter');

    if (!letter) {
      return new Response('Parametro letter mancante', { status: 400, headers: corsHeaders });
    }

    // Inizializza il client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variabili ambiente Supabase mancanti');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Costruisci la query in base al parametro letter
    let query = supabase.from('PATOLOGIE').select('id, Patologia').order('Patologia');

    if (letter === 'a') {
      query = query.ilike('Patologia', 'A%');
    } else if (letter === 'b') {
      query = query.ilike('Patologia', 'B%');
    } else if (letter === 'c') {
      query = query.ilike('Patologia', 'C%');
    } else if (letter === 'd') {
      query = query.ilike('Patologia', 'D%');
    } else if (letter === 'e-l') {
      query = query.or('Patologia.ilike.E%,Patologia.ilike.F%,Patologia.ilike.G%,Patologia.ilike.H%,Patologia.ilike.I%,Patologia.ilike.J%,Patologia.ilike.K%,Patologia.ilike.L%');
    } else if (letter === 'm-r') {
      query = query.or('Patologia.ilike.M%,Patologia.ilike.N%,Patologia.ilike.O%,Patologia.ilike.P%,Patologia.ilike.Q%,Patologia.ilike.R%');
    } else if (letter === 's-z') {
      query = query.or('Patologia.ilike.S%,Patologia.ilike.T%,Patologia.ilike.U%,Patologia.ilike.V%,Patologia.ilike.W%,Patologia.ilike.X%,Patologia.ilike.Y%,Patologia.ilike.Z%');
    } else {
      return new Response(`Parametro letter non valido: ${letter}`, { status: 400, headers: corsHeaders });
    }

    // Esegui la query
    const { data: conditions, error } = await query;

    if (error) {
      throw new Error(`Errore nella query: ${error.message}`);
    }

    // Costruisci il contenuto XML della sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    if (conditions && conditions.length > 0) {
      for (const condition of conditions) {
        const conditionSlug = slugify(condition.Patologia);
        
        xml += '  <url>\n';
        xml += `    <loc>https://stomale.info/patologia/${conditionSlug}</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>\n';

    // Restituisci la sitemap
    return new Response(xml, { headers: corsHeaders });
  } catch (error) {
    console.error('Errore:', error.message);
    return new Response(`Errore del server: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
