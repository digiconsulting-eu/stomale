
import { slugify } from "./slugify";

/**
 * Generates a standardized URL path for a review
 * @param condition The medical condition
 * @param reviewId The unique ID of the review
 * @param title The review title
 * @returns Formatted URL path string
 */
export const generateReviewPath = (condition: string, reviewId: number, title: string): string => {
  // Use URL encoding for spaces instead of slugifying to match the routing pattern
  const conditionParam = encodeURIComponent(condition.toLowerCase());
  const titleSlug = slugify(title);
  
  return `/patologia/${conditionParam}/esperienza/${reviewId}-${titleSlug}`;
};

/**
 * Normalize condition name for URL matching
 * @param condition The condition name from URL or database
 * @returns Normalized condition name
 */
export const normalizeConditionName = (condition: string): string => {
  // Decode URL encoding and normalize to lowercase
  return decodeURIComponent(condition).toLowerCase().trim();
};
