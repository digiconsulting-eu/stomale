
import { slugify } from "./slugify";

/**
 * Generates a standardized URL path for a review
 * @param condition The medical condition
 * @param reviewId The unique ID of the review
 * @param title The review title
 * @returns Formatted URL path string
 */
export const generateReviewPath = (condition: string, reviewId: number, title: string): string => {
  const conditionSlug = slugify(condition);
  const titleSlug = slugify(title);
  
  return `/patologia/${conditionSlug}/esperienza/${reviewId}-${titleSlug}`;
};
