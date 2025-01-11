export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')     // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-')              // Replace multiple hyphens with single hyphen
    .trim();                          // Remove whitespace from both ends
};