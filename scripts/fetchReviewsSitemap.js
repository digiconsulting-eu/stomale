
// Script per recuperare e salvare le sitemap delle recensioni
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configurazione
const PROJECT_ID = 'hnuhdoycwpjfjhthfqbt';
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/sitemap-reviews`;
const OUTPUT_DIR = path.resolve(__dirname, '../public');

// Funzione per effettuare una richiesta HTTP GET
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Error: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

// Funzione per salvare una sitemap
function saveSitemap(fileName, content) {
  const filePath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, content);
  console.log(`Sitemap saved to ${filePath}`);
}

// Funzione principale
async function main() {
  try {
    console.log('Fetching sitemaps for reviews...');
    
    // Recupera le prime 5 sitemap
    const maxPages = 5;
    
    for (let page = 1; page <= maxPages; page++) {
      console.log(`Fetching sitemap for page ${page}...`);
      
      try {
        const url = `${BASE_URL}?page=${page}`;
        const xmlContent = await fetchData(url);
        const fileName = `sitemap-reviews-${page}.xml`;
        
        saveSitemap(fileName, xmlContent);
      } catch (error) {
        console.error(`Error fetching sitemap for page ${page}:`, error);
        // If there's an error, create an empty sitemap file
        const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
        saveSitemap(`sitemap-reviews-${page}.xml`, emptyXml);
      }
    }
    
    console.log('All sitemaps generated successfully!');
  } catch (error) {
    console.error('Failed to generate sitemaps:', error);
    process.exit(1);
  }
}

// Esegui lo script
main();
