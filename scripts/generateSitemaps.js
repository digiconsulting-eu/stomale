
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
const URLS_PER_SITEMAP = 5; // Ridotto a 5 per test
// Directory per i file sitemap
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Funzione principale
async function generateSitemaps() {
  try {
    console.log('Inizio generazione sitemap...');
    
    // Verifica che la directory public esista
    if (!fs.existsSync(PUBLIC_DIR)) {
      console.log('Creazione directory public...');
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
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
      
      const filePath = path.join(PUBLIC_DIR, `sitemap-reviews-${fileNumber}.xml`);
      fs.writeFileSync(filePath, sitemapContent);
      console.log(`Creato file sitemap-reviews-${fileNumber}.xml con ${urls.length} URL`);
    }
    
    // Genera il file sitemap index
    generateSitemapIndex(sitemapGroups.length);
    
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
function generateSitemapIndex(numSitemaps) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Aggiungi le sitemap esistenti nella directory sitemaps se presenti
  const sitemapsDir = path.join(PUBLIC_DIR, 'sitemaps');
  if (fs.existsSync(sitemapsDir)) {
    // Elenco dei possibili file sitemap nella directory sitemaps
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
    
    // Aggiungi ogni sitemap esistente
    for (const filename of staticSitemaps) {
      const sitemapPath = path.join(sitemapsDir, filename);
      if (fs.existsSync(sitemapPath)) {
        xml += '  <sitemap>\n';
        xml += `    <loc>${BASE_URL}/sitemaps/${filename}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '  </sitemap>\n';
      }
    }
  }
  
  // Aggiungi le sitemap delle recensioni appena generate
  for (let i = 1; i <= numSitemaps; i++) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemap-reviews-${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  
  xml += '</sitemapindex>\n';
  
  // Salva il file sitemap.xml
  const indexPath = path.join(PUBLIC_DIR, 'sitemap-index.xml');
  fs.writeFileSync(indexPath, xml);
  console.log('Creato file sitemap-index.xml principale');
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
    <loc>${BASE_URL}/sitemap-reviews-1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
  
  // Salva i file
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-reviews-1.xml'), emptySitemap);
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
