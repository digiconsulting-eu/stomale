
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variabili d'ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti");
  process.exit(1);
}

// Inizializza il client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Assicurati che la directory sitemaps esista
const sitemapsDir = path.join(__dirname, '../public');
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

const generateReviewsSitemaps = async () => {
  try {
    console.log('Inizio generazione sitemaps delle recensioni...');
    
    // Ottieni tutti gli URL delle recensioni
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('*')
      .order('review_id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (!reviewUrls.length) {
      console.log('Nessun URL di recensione trovato');
      return;
    }
    
    console.log(`Trovati ${reviewUrls.length} URL di recensioni`);
    
    // Dividi gli URL in gruppi di 100
    const ITEMS_PER_FILE = 100;
    const chunks = [];
    
    for (let i = 0; i < reviewUrls.length; i += ITEMS_PER_FILE) {
      chunks.push(reviewUrls.slice(i, i + ITEMS_PER_FILE));
    }
    
    console.log(`Generazione di ${chunks.length} file sitemap`);
    
    // Genera un file sitemap per ogni chunk
    chunks.forEach((chunk, index) => {
      const fileIndex = index + 1;
      const fileName = `sitemap-reviews-${fileIndex}.xml`;
      const filePath = path.join(sitemapsDir, fileName);
      
      let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
      content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      chunk.forEach((item) => {
        content += '  <url>\n';
        content += `    <loc>https://stomale.info${item.url}</loc>\n`;
        content += '    <changefreq>monthly</changefreq>\n';
        content += '    <priority>0.6</priority>\n';
        content += '  </url>\n';
      });
      
      content += '</urlset>\n';
      
      fs.writeFileSync(filePath, content);
      console.log(`Generato ${fileName} con ${chunk.length} URL`);
    });
    
    // Genera il sitemap index
    let indexContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    indexContent += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (let i = 1; i <= chunks.length; i++) {
      indexContent += '  <sitemap>\n';
      indexContent += `    <loc>https://stomale.info/sitemap-reviews-${i}.xml</loc>\n`;
      indexContent += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
      indexContent += '  </sitemap>\n';
    }
    
    indexContent += '</sitemapindex>\n';
    
    fs.writeFileSync(path.join(sitemapsDir, 'sitemap.xml'), indexContent);
    console.log('Generato sitemap.xml principale');
    
    console.log('Generazione sitemaps completata con successo');
  } catch (error) {
    console.error('Errore durante la generazione dei sitemaps:', error.message);
  }
};

// Esecuzione della funzione principale
generateReviewsSitemaps();
