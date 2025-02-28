
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Configurazione dirname per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: variabili di ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti');
  process.exit(1);
}

console.log('Inizializzazione client Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Dominio base
const BASE_URL = 'https://stomale.info';
// Numero di URL per file sitemap
const URLS_PER_SITEMAP = 1000; // Aumentato a 1000 URL per file
// Directory per i file sitemap
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEMAPS_DIR = path.join(PUBLIC_DIR, 'sitemaps');

// Funzione principale
async function generateSitemaps() {
  try {
    console.log('Inizio generazione sitemap...');
    
    // Verifica che le directory esistano
    if (!fs.existsSync(PUBLIC_DIR)) {
      console.log('Creazione directory public...');
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(SITEMAPS_DIR)) {
      console.log('Creazione directory sitemaps...');
      fs.mkdirSync(SITEMAPS_DIR, { recursive: true });
    }
    
    // Recupera tutti gli URL dalla tabella review_urls
    console.log('Recupero URL delle recensioni da Supabase...');
    const { data: reviewUrls, error } = await supabase
      .from('review_urls')
      .select('url, review_id, title, condition')
      .order('id');
    
    if (error) {
      throw new Error(`Errore nel recupero degli URL delle recensioni: ${error.message}`);
    }
    
    if (!reviewUrls || reviewUrls.length === 0) {
      console.log('Nessun URL di recensione trovato. Creazione di sitemap vuote...');
      await generateEmptySitemap();
      return;
    }
    
    console.log(`Trovati ${reviewUrls.length} URL di recensioni.`);
    
    // Dividi gli URL in gruppi per ogni file sitemap
    const sitemapGroups = [];
    for (let i = 0; i < reviewUrls.length; i += URLS_PER_SITEMAP) {
      sitemapGroups.push(reviewUrls.slice(i, i + URLS_PER_SITEMAP));
    }
    
    console.log(`Creazione di ${sitemapGroups.length} file sitemap...`);
    
    // Genera ogni file sitemap
    for (let i = 0; i < sitemapGroups.length; i++) {
      const fileNumber = i + 1;
      const urls = sitemapGroups[i];
      const sitemapContent = generateSitemapXml(urls);
      
      const filePath = path.join(SITEMAPS_DIR, `sitemap-reviews-${fileNumber}.xml`);
      fs.writeFileSync(filePath, sitemapContent);
      console.log(`Creato file sitemap-reviews-${fileNumber}.xml con ${urls.length} URL`);
    }
    
    // Pulisci i vecchi file sitemap nella directory public
    console.log('Pulizia dei vecchi file sitemap...');
    const files = fs.readdirSync(PUBLIC_DIR);
    const oldSitemaps = files.filter(file => file.startsWith('sitemap-reviews-') && file.endsWith('.xml'));
    
    for (const file of oldSitemaps) {
      const filePath = path.join(PUBLIC_DIR, file);
      fs.unlinkSync(filePath);
      console.log(`Rimosso vecchio file ${file}`);
    }
    
    // Pulisci anche le vecchie sitemap-reviews nella directory sitemaps che non sono più necessarie
    if (fs.existsSync(SITEMAPS_DIR)) {
      const sitemapsFiles = fs.readdirSync(SITEMAPS_DIR);
      const oldReviewsSitemaps = sitemapsFiles.filter(file => 
        file.startsWith('sitemap-reviews-') && 
        file.endsWith('.xml') && 
        parseInt(file.replace('sitemap-reviews-', '').replace('.xml', '')) > sitemapGroups.length
      );
      
      for (const file of oldReviewsSitemaps) {
        const filePath = path.join(SITEMAPS_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`Rimosso vecchio file sitemaps/${file}`);
      }
    }
    
    // Genera il file sitemap index
    updateSitemapIndex(sitemapGroups.length);
    
    console.log('Generazione sitemap completata con successo!');
  } catch (error) {
    console.error('Errore durante la generazione delle sitemap:', error);
    
    // In caso di errore, genera almeno una sitemap vuota
    console.log('Tentativo di generare sitemap di fallback...');
    await generateEmptySitemap();
  }
}

// Genera il contenuto XML di un singolo file sitemap
function generateSitemapXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    if (url && url.url) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${url.url}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }
  });
  
  xml += '</urlset>\n';
  return xml;
}

// Genera il file sitemap.xml principale che elenca tutti i file sitemap
function updateSitemapIndex(numReviewSitemaps) {
  const today = new Date().toISOString().split('T')[0];
  const indexPath = path.join(PUBLIC_DIR, 'sitemap-index.xml');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Aggiungi le sitemap statiche
  const staticSitemaps = [
    'sitemap-static.xml',
    'sitemap-conditions-a.xml',
    'sitemap-conditions-b.xml',
    'sitemap-conditions-c.xml',
    'sitemap-conditions-d.xml',
    'sitemap-conditions-e-l.xml',
    'sitemap-conditions-m-r.xml',
    'sitemap-conditions-s-z.xml'
  ];
  
  // Aggiungi le sitemap statiche se esistono
  for (const filename of staticSitemaps) {
    const sitemapPath = path.join(SITEMAPS_DIR, filename);
    if (fs.existsSync(sitemapPath)) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${BASE_URL}/sitemaps/${filename}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
  }
  
  // Aggiungi le sitemap delle recensioni
  for (let i = 1; i <= numReviewSitemaps; i++) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-reviews-${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  
  xml += '</sitemapindex>\n';
  
  // Salva il file sitemap-index.xml
  fs.writeFileSync(indexPath, xml);
  console.log('Aggiornato file sitemap-index.xml principale');
}

// Genera una sitemap vuota in caso di errore
async function generateEmptySitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  // Crea una sitemap vuota
  const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;
  
  const emptyIndexSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-reviews-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
  
  // Salva i file
  fs.writeFileSync(path.join(SITEMAPS_DIR, 'sitemap-reviews-1.xml'), emptySitemap);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), emptyIndexSitemap);
  
  console.log('Generate sitemap vuote di fallback');
}

// Esegui la funzione principale
generateSitemaps()
  .then(() => {
    console.log('Processo di generazione sitemap completato');
  })
  .catch(error => {
    console.error('Errore critico non gestito:', error);
    process.exit(1);
  });
