export const setPageTitle = (title: string) => {
  document.title = title;
};

export const getConditionPageTitle = (condition: string) => {
  return `${condition.toUpperCase()} | Recensioni ed Esperienze`;
};

export const getReviewPageTitle = (condition: string, title: string) => {
  return `${condition.toUpperCase()} | ${title}`;
};

export const getDefaultPageTitle = (page: string) => {
  return `Stomale.info | ${page}`;
};

export const setMetaDescription = (description: string) => {
  // Update existing meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  } else {
    // Create new meta description if it doesn't exist
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description);
    document.head.appendChild(metaDescription);
  }
};

export const getConditionMetaDescription = (condition: string) => {
  return `Scopri esperienze reali e recensioni su ${condition}. Leggi testimonianze di altri pazienti, sintomi comuni e trattamenti su StoMale.info.`;
};

export const getReviewMetaDescription = (condition: string, title: string) => {
  return `Leggi "${title}" - Una recensione su ${condition}. Scopri l'esperienza diretta di chi ha affrontato questa patologia su StoMale.info.`;
};

export const getSearchMetaDescription = () => {
  return `Cerca tra centinaia di patologie e leggi esperienze reali di altri pazienti. Trova informazioni su sintomi, diagnosi e trattamenti su StoMale.info.`;
};