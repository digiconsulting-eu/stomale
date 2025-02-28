
import { supabase } from "@/integrations/supabase/client";

/**
 * Genera una sitemap XML per le recensioni specificando un intervallo di indici
 * @param start Indice iniziale per la paginazione
 * @param limit Numero massimo di elementi da recuperare
 * @returns Contenuto XML della sitemap o null in caso di errore
 */
export async function generateReviewsSitemap(start: number, limit: number) {
  try {
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('url')
      .range(start, start + limit - 1)
      .order('id', { ascending: true });

    if (error) {
      console.error('Errore nel recupero degli URL delle recensioni:', error);
      return null;
    }

    if (!reviewUrls || reviewUrls.length === 0) {
      console.warn('Nessun URL di recensione trovato nell\'intervallo specificato');
      return null;
    }

    console.log(`Trovati ${reviewUrls.length} URL di recensioni`);

    // Genera il contenuto XML per la sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    reviewUrls.forEach((reviewUrl) => {
      if (reviewUrl.url) {
        const fullUrl = `https://stomale.info${reviewUrl.url}`;
        xmlContent += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>2024-03-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    });

    xmlContent += `</urlset>`;
    return xmlContent;
  } catch (error) {
    console.error('Errore nella generazione della sitemap:', error);
    return null;
  }
}

/**
 * Funzione per scrivere il contenuto XML in un file
 * Questa funzione è utilizzabile solo lato server o in build scripts
 */
export async function writeSitemapToFile(filePath: string, content: string) {
  if (typeof window === 'undefined') {
    // Questa operazione funziona solo lato server
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(process.cwd(), filePath);
    
    try {
      fs.writeFileSync(fullPath, content);
      console.log(`Sitemap salvata con successo in ${fullPath}`);
      return true;
    } catch (error) {
      console.error(`Errore nella scrittura della sitemap in ${fullPath}:`, error);
      return false;
    }
  }
  return false;
}
