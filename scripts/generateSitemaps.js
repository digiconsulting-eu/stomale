
// Script per generare le sitemap delle recensioni
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = "https://hnuhdoycwpjfjhthfqbt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0";
const supabase = createClient(supabaseUrl, supabaseKey);

// Funzione per generare una singola sitemap
async function generateSitemap(fileIndex, startRange, endRange) {
  try {
    console.log(`Generazione sitemap-reviews-${fileIndex}.xml (range ${startRange}-${endRange})...`);
    
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('url')
      .range(startRange, endRange)
      .order('id', { ascending: true });
      
    if (error) {
      throw new Error(`Errore nel recupero degli URL: ${error.message}`);
    }
    
    if (!reviewUrls || reviewUrls.length === 0) {
      console.warn(`Nessun URL trovato per l'intervallo ${startRange}-${endRange}`);
      // Genera comunque un file vuoto
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
      return emptyXml;
    }
    
    // Genera il contenuto XML
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    reviewUrls.forEach(reviewUrl => {
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
    console.error(`Errore nella generazione della sitemap ${fileIndex}:`, error);
    throw error;
  }
}

// Funzione principale
async function main() {
  try {
    // Definiamo i range per ogni file di sitemap (5 file con 5 elementi ciascuno)
    const ranges = [
      { file: 1, start: 0, end: 4 },
      { file: 2, start: 5, end: 9 },
      { file: 3, start: 10, end: 14 },
      { file: 4, start: 15, end: 19 },
      { file: 5, start: 20, end: 24 }
    ];
    
    for (const range of ranges) {
      const xmlContent = await generateSitemap(range.file, range.start, range.end);
      const outputPath = path.resolve(__dirname, `../public/sitemap-reviews-${range.file}.xml`);
      
      fs.writeFileSync(outputPath, xmlContent);
      console.log(`Sitemap salvata con successo in ${outputPath}`);
    }
    
    console.log('Generazione delle sitemap completata con successo!');
  } catch (error) {
    console.error('Errore nella generazione delle sitemap:', error);
    process.exit(1);
  }
}

// Esegui lo script
main();
