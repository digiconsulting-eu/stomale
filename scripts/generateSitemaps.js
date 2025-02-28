
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: variabili di ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti');
  process.exit(1);
}

console.log('Configurazione Supabase completata');
const supabase = createClient(supabaseUrl, supabaseKey);

// Dominio base
const BASE_URL = 'https://stomale.info';

// Funzione principale
async function generateSitemaps() {
  try {
    console.log('Inizia generazione sitemap...');
    
    // Crea una sitemap di esempio
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const sampleContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stomale.info/patologia/allergie/esperienza/1-la-mia-esperienza-con-allergia-ai-pollini</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
    
    const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://stomale.info/sitemap-reviews-1.xml</loc>
    <lastmod>2024-04-01</lastmod>
  </sitemap>
</sitemapindex>`;
    
    fs.writeFileSync(path.join(publicDir, 'sitemap-reviews-1.xml'), sampleContent);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexContent);
    
    console.log('Generazione sitemap di esempio completata');
  } catch (error) {
    console.error('Errore:', error);
    process.exit(1);
  }
}

// Esegui la funzione principale
generateSitemaps().catch(error => {
  console.error('Errore non gestito:', error);
  process.exit(1);
});
