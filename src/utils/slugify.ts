
export function slugify(text: string): string {
  if (!text) {
    return '';
  }
  
  return text
    .toString()
    .normalize('NFD') // Normalizza i caratteri accentati
    .replace(/[\u0300-\u036f]/g, '') // Rimuove gli accenti
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Sostituisce spazi con -
    .replace(/[^\w-]+/g, '') // Rimuove caratteri non validi
    .replace(/--+/g, '-') // Sostituisce multipli - con uno solo
    .replace(/^-+|-+$/g, '') // Rimuove trattini all'inizio e alla fine
    .substring(0, 70) // Limita la lunghezza
    .replace(/-+$/, ''); // Rimuove eventuali trattini finali dopo il trim
}
