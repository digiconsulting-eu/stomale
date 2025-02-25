
export const toSEOFriendlyURL = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ /g, '-') // sostituisce gli spazi con trattini
    .replace(/[^a-z0-9-]/g, '') // rimuove tutti i caratteri speciali eccetto lettere, numeri e trattini
    .replace(/-+/g, '-') // sostituisce trattini multipli con uno singolo
    .replace(/^-|-$/g, ''); // rimuove i trattini all'inizio e alla fine
};

export const generateReviewPath = (condition: string, reviewId: string | number, title: string): string => {
  const seoCondition = toSEOFriendlyURL(condition);
  const seoTitle = toSEOFriendlyURL(title);
  return `/patologia/${seoCondition}/esperienza/${reviewId}-${seoTitle}`;
};
