
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
  return `Leggi l'esperienza "${title}" sulla patologia ${condition}. Scopri sintomi, diagnosi e trattamenti raccontati da chi ha vissuto questa condizione su StoMale.info`;
};

export const getConditionMetaDescription = (condition: string) => {
  return `Scopri esperienze, sintomi e trattamenti per ${condition} su StoMale.info. Leggi recensioni e testimonianze di chi convive con questa patologia.`;
};
