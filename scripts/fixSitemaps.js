const fs = require('fs');
const path = require('path');

/**
 * Script per correggere tutte le sitemap rimuovendo la riga vuota iniziale
 * che causa l'errore: "XML declaration allowed only at the start of the document"
 */

const publicDir = path.join(__dirname, '..', 'public');

// Trova tutti i file sitemap-reviews-*.xml
const files = fs.readdirSync(publicDir).filter(file => 
  file.startsWith('sitemap-reviews-') && file.endsWith('.xml')
);

console.log(`Trovati ${files.length} file sitemap da correggere...`);

let correctedCount = 0;
let errorCount = 0;

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  
  try {
    // Leggi il contenuto del file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Se inizia con una riga vuota o spazio, rimuovila
    if (content.startsWith('\n') || content.startsWith('\r\n') || content.startsWith(' ')) {
      content = content.trimStart();
      
      // Scrivi il contenuto corretto
      fs.writeFileSync(filePath, content, 'utf8');
      correctedCount++;
      console.log(`✓ Corretto: ${file}`);
    } else {
      console.log(`- Già corretto: ${file}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Errore con ${file}:`, error.message);
  }
});

console.log(`\n=== Risultati ===`);
console.log(`File corretti: ${correctedCount}`);
console.log(`Errori: ${errorCount}`);
console.log(`Totale file processati: ${files.length}`);
