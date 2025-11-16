
export function slugify(text: string): string {
  if (!text) {
    return '';
  }
  
  // Prima normalizza e rimuovi accenti usando NFD
  let slug = text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Rimuove accenti
  
  // Poi sostituisci manualmente caratteri accentati comuni che potrebbero essere rimasti
  const charMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n', 'ç': 'c'
  };
  
  slug = slug.toLowerCase();
  
  // Sostituisci caratteri accentati
  for (const [char, replacement] of Object.entries(charMap)) {
    slug = slug.replace(new RegExp(char, 'g'), replacement);
  }
  
  return slug
    .trim()
    .replace(/\s+/g, '-') // Sostituisce spazi con -
    .replace(/[^\w-]+/g, '') // Rimuove caratteri non validi (mantiene solo lettere, numeri, underscore e trattini)
    .replace(/--+/g, '-') // Sostituisce multipli - con uno solo
    .replace(/^-+|-+$/g, '') // Rimuove trattini all'inizio e alla fine
    .substring(0, 70) // Limita la lunghezza
    .replace(/-+$/, ''); // Rimuove eventuali trattini finali dopo il trim
}
