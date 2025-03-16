
export const getDefaultPageTitle = (page: string) => {
  return `${page} | StoMale.info - Esperienze e Recensioni su Malattie e Patologie`;
};

export const setPageTitle = (title: string) => {
  document.title = title;
};

export const setMetaDescription = (description: string) => {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
};

export const getSearchMetaDescription = () => {
  return "Cerca tra centinaia di patologie e malattie su StoMale.info. Trova informazioni, testimonianze ed esperienze di altri pazienti per la tua condizione.";
};

export const getReviewMetaDescription = (condition: string, title: string) => {
  // Migliorata con CTA, parole chiave rilevanti e lunghezza ottimale
  return `Testimonianza: "${title}" sul vivere con ${condition}. Scopri sintomi reali, difficoltà diagnostiche e trattamenti efficaci raccontati da chi affronta questa condizione ogni giorno. Leggi ora.`;
};

export const getConditionMetaDescription = (condition: string) => {
  return `Scopri esperienze, sintomi e trattamenti per ${condition} su StoMale.info. Leggi recensioni e testimonianze di chi convive con questa patologia.`;
};

