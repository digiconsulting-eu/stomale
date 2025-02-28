
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Dominio base
const BASE_URL = 'https://stomale.info';

// Funzione principale
async function generateSitemaps() {
  try {
    console.log('Inizia generazione sitemap...');
    
    // Ottieni tutti gli URL delle recensioni dal database
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('*')
      .order('id');
    
    if (error) {
      throw new Error(`Errore nel recupero degli URL: ${error.message}`);
    }
    
    console.log(`Trovati ${reviewUrls.length} URL di recensioni`);
    
    // Dividi gli URL in gruppi di 5 per sitemap
    const urlGroups = [];
    const ITEMS_PER_FILE = 5;
    
    for (let i = 0; i < reviewUrls.length; i += ITEMS_PER_FILE) {
      urlGroups.push(reviewUrls.slice(i, i + ITEMS_PER_FILE));
    }
    
    console.log(`Creazione di ${urlGroups.length} file sitemap`);
    
    // Genera i file delle sitemap
    urlGroups.forEach((group, index) => {
      const fileNum = index + 1;
      const sitemapContent = generateSitemapXml(group);
      
      const filePath = path.join(process.cwd(), `public/sitemap-reviews-${fileNum}.xml`);
      fs.writeFileSync(filePath, sitemapContent);
      console.log(`Generato: sitemap-reviews-${fileNum}.xml`);
    });
    
    // Aggiorna il sitemap index se necessario
    updateSitemapIndex(urlGroups.length);
    
    console.log('Generazione sitemap completata con successo!');
  } catch (error) {
    console.error('Errore nella generazione delle sitemap:', error);
    process.exit(1);
  }
}

// Genera il contenuto XML per una singola sitemap
function generateSitemapXml(urlsData) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const urlData of urlsData) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${urlData.url}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}

// Aggiorna il file sitemap.xml principale per includere tutti i file delle sitemap
function updateSitemapIndex(totalSitemaps) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Aggiungi le sitemap statiche
  xml += '  <sitemap>\n';
  xml += `    <loc>${BASE_URL}/sitemaps/sitemap-static.xml</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // Aggiungi tutte le sitemap delle condizioni
  const conditionLetters = ['a', 'b', 'c', 'd', 'e-l', 'm-r', 's-z'];
  for (const letter of conditionLetters) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-${letter}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  
  // Aggiungi tutte le sitemap delle recensioni
  for (let i = 1; i <= totalSitemaps; i++) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemap-reviews-${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  
  xml += '</sitemapindex>';
  
  // Salva il file sitemap.xml
  const filePath = path.join(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(filePath, xml);
  console.log('Aggiornato il file sitemap.xml principale');
}

// Esegui la funzione principale
generateSitemaps();
