
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurazione
const SITEMAPS_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const BASE_URL = 'https://stomale.info';
const BATCH_SIZE = 50;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica che la directory esista
if (!fs.existsSync(SITEMAPS_DIR)) {
  fs.mkdirSync(SITEMAPS_DIR, { recursive: true });
}

// Connessione a Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Genera i sitemaps per le patologie
async function generateConditionSitemaps() {
  try {
    console.log('Inizio generazione sitemap delle patologie...');
    
    // Fetch delle patologie
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia, slug')
      .order('Patologia');
    
    if (error) {
      throw error;
    }
    
    if (!conditions || !conditions.length) {
      console.log('Nessuna patologia trovata');
      generateEmptySitemap();
      return;
    }
    
    console.log(`Trovate ${conditions.length} patologie`);
    
    // Gruppo le patologie per lettera iniziale
    const groupedByFirstLetter = {};
    
    // Lettera A
    groupedByFirstLetter['a'] = conditions.filter(c => 
      c.Patologia.toLowerCase().startsWith('a'));
    
    // Lettera B
    groupedByFirstLetter['b'] = conditions.filter(c => 
      c.Patologia.toLowerCase().startsWith('b'));
    
    // Lettera C
    groupedByFirstLetter['c'] = conditions.filter(c => 
      c.Patologia.toLowerCase().startsWith('c'));
    
    // Lettera D
    groupedByFirstLetter['d'] = conditions.filter(c => 
      c.Patologia.toLowerCase().startsWith('d'));
    
    // Lettere E-L
    groupedByFirstLetter['e-l'] = conditions.filter(c => {
      const firstChar = c.Patologia.toLowerCase().charAt(0);
      return 'efghijkl'.includes(firstChar);
    });
    
    // Lettere M-R
    groupedByFirstLetter['m-r'] = conditions.filter(c => {
      const firstChar = c.Patologia.toLowerCase().charAt(0);
      return 'mnopqr'.includes(firstChar);
    });
    
    // Lettere S-Z
    groupedByFirstLetter['s-z'] = conditions.filter(c => {
      const firstChar = c.Patologia.toLowerCase().charAt(0);
      return 'stuvwxyz'.includes(firstChar);
    });
    
    // Genera i file sitemap per ogni gruppo
    const generatedFiles = [];
    
    for (const [letter, letterConditions] of Object.entries(groupedByFirstLetter)) {
      if (letterConditions.length > 0) {
        const filename = `sitemap-conditions-${letter}.xml`;
        const filePath = path.join(SITEMAPS_DIR, filename);
        
        // Genera il contenuto del file sitemap
        const sitemapContent = generateSitemapXml(letterConditions);
        fs.writeFileSync(filePath, sitemapContent);
        
        console.log(`Generato ${filename} con ${letterConditions.length} patologie`);
        generatedFiles.push({
          file: filename,
          count: letterConditions.length
        });
      }
    }
    
    // Aggiorna il sitemap index
    updateSitemapIndex(generatedFiles);
    
    console.log('Generazione sitemap patologie completata');
  } catch (error) {
    console.error('Errore durante la generazione dei sitemap:', error.message);
    generateEmptySitemap();
  }
}

// Genera il contenuto XML di un singolo file sitemap
function generateSitemapXml(conditions) {
  // Ensure no leading whitespace before XML declaration
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const condition of conditions) {
    // Usa encodeURIComponent per codificare gli spazi come %20
    const pathologySafeUrl = encodeURIComponent(condition.Patologia.toLowerCase());
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/patologia/${pathologySafeUrl}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}

// Genera una sitemap vuota in caso di errore
function generateEmptySitemap() {
  // Ensure no leading whitespace before XML declaration
  const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  
  const filePath = path.join(SITEMAPS_DIR, 'sitemap-conditions-empty.xml');
  fs.writeFileSync(filePath, emptySitemap);
  console.log('Generato sitemap-conditions-empty.xml (vuoto)');
}

// Aggiorna il sitemap index
function updateSitemapIndex(generatedFiles) {
  const indexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
  const today = new Date().toISOString().split('T')[0];
  
  // Crea un nuovo file se non esiste
  if (!fs.existsSync(indexPath)) {
    console.log('File sitemap-index.xml non trovato. Creazione di un nuovo file...');
    
    // Ensure no leading whitespace before XML declaration
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Sitemaps delle recensioni
    const reviewSitemaps = [];
    for (let i = 1; i <= 200; i++) {
      const reviewSitemapPath = path.join(process.cwd(), 'public', `sitemap-reviews-${i}.xml`);
      if (fs.existsSync(reviewSitemapPath)) {
        reviewSitemaps.push(i);
      }
    }
    
    for (const index of reviewSitemaps) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${BASE_URL}/sitemap-reviews-${index}.xml</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
    
    // Sitemap statico
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-static.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    
    // Sitemaps delle patologie
    for (const { file } of generatedFiles) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${BASE_URL}/sitemaps/${file}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
    
    xml += '</sitemapindex>';
    fs.writeFileSync(indexPath, xml);
    console.log('Creato nuovo file sitemap-index.xml');
  } else {
    console.log('Aggiornamento file sitemap-index.xml esistente...');
    
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Ensure the XML declaration is at the very beginning
    if (indexContent.trim().indexOf('<?xml') !== 0) {
      indexContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + indexContent.substring(indexContent.indexOf('<sitemapindex'));
    }
    
    let updated = false;
    
    const conditionSitemaps = [
      'sitemap-conditions-a.xml',
      'sitemap-conditions-b.xml',
      'sitemap-conditions-c.xml',
      'sitemap-conditions-d.xml',
      'sitemap-conditions-e-l.xml',
      'sitemap-conditions-m-r.xml',
      'sitemap-conditions-s-z.xml'
    ];
    
    // Aggiorna o aggiungi le entry delle patologie
    for (const { file } of generatedFiles) {
      const locPattern = new RegExp(`<loc>${BASE_URL}/sitemaps/${file}</loc>`);
      
      if (locPattern.test(indexContent)) {
        // Se esiste già, aggiorna solo la data
        const lastmodPattern = new RegExp(`(<loc>${BASE_URL}/sitemaps/${file}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`);
        indexContent = indexContent.replace(lastmodPattern, `$1${today}$2`);
      } else {
        // Se non esiste, aggiungila prima della chiusura del tag
        const newEntry = `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${file}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
        indexContent = indexContent.replace('</sitemapindex>', `${newEntry}</sitemapindex>`);
      }
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(indexPath, indexContent);
      console.log('File sitemap-index.xml aggiornato');
    } else {
      console.log('Nessun aggiornamento necessario per sitemap-index.xml');
    }
  }
}

// Esegui il generatore se chiamato direttamente
if (require.main === module) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Errore: Le variabili di ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere definite.');
    process.exit(1);
  }
  
  generateConditionSitemaps().catch(error => {
    console.error('Errore durante l\'esecuzione del generatore:', error);
    process.exit(1);
  });
}

module.exports = generateConditionSitemaps;
