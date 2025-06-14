
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
    .replace(/'/g, '') // Rimuove gli apostrofi
    .replace(/[^a-z0-9]+/g, '-') // Sostituisce caratteri non alfanumerici con -
    .replace(/--+/g, '-') // Sostituisce multipli - con uno solo
    .replace(/^-+|-+$/g, '') // Rimuove trattini iniziali/finali
    .substring(0, 70); // Limita la lunghezza per sicurezza
}
