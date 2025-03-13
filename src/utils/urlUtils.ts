
/**
 * Generates a standardized URL path for a review
 * @param condition The medical condition
 * @param reviewId The unique ID of the review
 * @param title The review title
 * @returns Formatted URL path string
 */
export const generateReviewPath = (condition: string, reviewId: number, title: string): string => {
  const formattedCondition = condition.trim().toLowerCase();
  const formattedTitle = title.trim().toLowerCase().replace(/\s+/g, '-');
  
  return `/patologia/${formattedCondition}/esperienza/${reviewId}-${formattedTitle}`;
};
