
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
const URLS_PER_SITEMAP = 50;
// Directory per i file sitemap
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEMAPS_DIR = path.join(PUBLIC_DIR, 'sitemaps');

// Funzione principale
async function generateConditionsSitemaps() {
  try {
    console.log('Inizio generazione sitemap delle patologie...');
    
    // Verifica che le directory esistano
    if (!fs.existsSync(PUBLIC_DIR)) {
      console.log('Creazione directory public...');
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(SITEMAPS_DIR)) {
      console.log('Creazione directory sitemaps...');
      fs.mkdirSync(SITEMAPS_DIR, { recursive: true });
    }
    
    // Recupera tutte le patologie dal database
    console.log('Recupero patologie da Supabase...');
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .order('Patologia');
    
    if (error) {
      throw new Error(`Errore nel recupero delle patologie: ${error.message}`);
    }
    
    if (!conditions || conditions.length === 0) {
      console.log('Nessuna patologia trovata. Creazione di sitemap vuota...');
      generateEmptySitemap();
      return;
    }
    
    console.log(`Trovate ${conditions.length} patologie.`);
    
    // Raggruppa patologie per lettera iniziale
    const conditionsByLetter = {};
    
    conditions.forEach(condition => {
      const firstLetter = condition.Patologia.charAt(0).toUpperCase();
      
      if (!conditionsByLetter[firstLetter]) {
        conditionsByLetter[firstLetter] = [];
      }
      
      conditionsByLetter[firstLetter].push(condition);
    });
    
    const letterGroups = {
      'A': 'a',
      'B': 'b',
      'C': 'c',
      'D': 'd',
      'E-L': 'e-l',
      'M-R': 'm-r',
      'S-Z': 's-z'
    };
    
    // Genera i file sitemap per ogni gruppo di lettere
    for (const [groupName, groupSlug] of Object.entries(letterGroups)) {
      console.log(`Generazione sitemap per patologie ${groupName}...`);
      const groupConditions = [];
      
      if (groupName === 'A') {
        if (conditionsByLetter['A']) groupConditions.push(...conditionsByLetter['A']);
      } else if (groupName === 'B') {
        if (conditionsByLetter['B']) groupConditions.push(...conditionsByLetter['B']);
      } else if (groupName === 'C') {
        if (conditionsByLetter['C']) groupConditions.push(...conditionsByLetter['C']);
      } else if (groupName === 'D') {
        if (conditionsByLetter['D']) groupConditions.push(...conditionsByLetter['D']);
      } else if (groupName === 'E-L') {
        for (let i = 'E'.charCodeAt(0); i <= 'L'.charCodeAt(0); i++) {
          const letter = String.fromCharCode(i);
          if (conditionsByLetter[letter]) groupConditions.push(...conditionsByLetter[letter]);
        }
      } else if (groupName === 'M-R') {
        for (let i = 'M'.charCodeAt(0); i <= 'R'.charCodeAt(0); i++) {
          const letter = String.fromCharCode(i);
          if (conditionsByLetter[letter]) groupConditions.push(...conditionsByLetter[letter]);
        }
      } else if (groupName === 'S-Z') {
        for (let i = 'S'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
          const letter = String.fromCharCode(i);
          if (conditionsByLetter[letter]) groupConditions.push(...conditionsByLetter[letter]);
        }
      }
      
      if (groupConditions.length > 0) {
        const sitemapContent = generateSitemapXml(groupConditions);
        const filePath = path.join(SITEMAPS_DIR, `sitemap-conditions-${groupSlug}.xml`);
        fs.writeFileSync(filePath, sitemapContent);
        console.log(`Creato file sitemap-conditions-${groupSlug}.xml con ${groupConditions.length} URL`);
      }
    }
    
    // Aggiorna il file sitemap-index.xml per includere le nuove sitemap
    updateSitemapIndex();
    
    console.log('Generazione sitemap delle patologie completata con successo!');
  } catch (error) {
    console.error('Errore durante la generazione delle sitemap delle patologie:', error);
    generateEmptySitemap();
  }
}

// Genera il contenuto XML di un singolo file sitemap
function generateSitemapXml(conditions) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  conditions.forEach(condition => {
    const conditionUrl = `/patologia/${condition.Patologia.toLowerCase().replace(/ /g, '-')}`;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${conditionUrl}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>\n';
  return xml;
}

// Genera una sitemap vuota in caso di errore
function generateEmptySitemap() {
  const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;
  
  const filePath = path.join(SITEMAPS_DIR, 'sitemap-conditions-empty.xml');
  fs.writeFileSync(filePath, emptySitemap);
  
  console.log('Generata sitemap vuota di fallback');
}

// Aggiorna il file sitemap-index.xml per includere le nuove sitemap
function updateSitemapIndex() {
  const indexPath = path.join(PUBLIC_DIR, 'sitemap-index.xml');
  const today = new Date().toISOString().split('T')[0];
  
  // Se il file sitemap-index.xml non esiste, creane uno nuovo
  if (!fs.existsSync(indexPath)) {
    console.log('File sitemap-index.xml non trovato. Creazione di un nuovo file...');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Aggiungi le sitemap delle patologie
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-a.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-b.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-c.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-d.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-e-l.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-m-r.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemaps/sitemap-conditions-s-z.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
    
    // Leggi la directory per trovare i file sitemap-reviews-*.xml
    const files = fs.readdirSync(PUBLIC_DIR);
    const reviewSitemaps = files.filter(file => file.startsWith('sitemap-reviews-') && file.endsWith('.xml'));
    
    reviewSitemaps.forEach(file => {
      xml += '  <sitemap>\n';
      xml += `    <loc>${BASE_URL}/${file}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += '  </sitemap>\n';
    });
    
    xml += '</sitemapindex>\n';
    
    fs.writeFileSync(indexPath, xml);
    console.log('Creato nuovo file sitemap-index.xml');
  } else {
    // Se il file sitemap-index.xml esiste già, aggiungi le nuove sitemap se non ci sono già
    console.log('Aggiornamento file sitemap-index.xml esistente...');
    
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    let updated = false;
    
    const conditionSitemaps = [
      '/sitemaps/sitemap-conditions-a.xml',
      '/sitemaps/sitemap-conditions-b.xml',
      '/sitemaps/sitemap-conditions-c.xml',
      '/sitemaps/sitemap-conditions-d.xml',
      '/sitemaps/sitemap-conditions-e-l.xml',
      '/sitemaps/sitemap-conditions-m-r.xml',
      '/sitemaps/sitemap-conditions-s-z.xml'
    ];
    
    // Verifica che ogni sitemap delle patologie sia presente nel file sitemap-index.xml
    for (const sitemapPath of conditionSitemaps) {
      if (!indexContent.includes(sitemapPath)) {
        const insertPosition = indexContent.indexOf('</sitemapindex>');
        
        if (insertPosition !== -1) {
          const sitemapEntry = `  <sitemap>\n    <loc>${BASE_URL}${sitemapPath}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
          indexContent = indexContent.slice(0, insertPosition) + sitemapEntry + indexContent.slice(insertPosition);
          updated = true;
        }
      }
    }
    
    if (updated) {
      fs.writeFileSync(indexPath, indexContent);
      console.log('File sitemap-index.xml aggiornato con le sitemap delle patologie');
    } else {
      console.log('Tutte le sitemap delle patologie sono già presenti nel file sitemap-index.xml');
    }
  }
}

// Esegui la funzione principale
generateConditionsSitemaps()
  .then(() => {
    console.log('Processo di generazione sitemap delle patologie completato');
  })
  .catch(error => {
    console.error('Errore critico non gestito:', error);
    process.exit(1);
  });
