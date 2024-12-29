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