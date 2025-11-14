
import { slugify } from "./slugify";

/**
 * Generates a standardized URL path for a review
 * @param condition The medical condition
 * @param reviewId The unique ID of the review
 * @param title The review title
 * @returns Formatted URL path string
 */
export const generateReviewPath = (condition: string, reviewId: number, title: string): string => {
  // Convert spaces to hyphens for URL consistency
  const conditionParam = condition.toLowerCase().replace(/\s+/g, '-');
  const titleSlug = slugify(title);
  
  return `/patologia/${conditionParam}/esperienza/${reviewId}-${titleSlug}`;
};

/**
 * Normalize condition name for URL matching
 * @param condition The condition name from URL or database
 * @returns Normalized condition name
 */
export const normalizeConditionName = (condition: string): string => {
  // Convert hyphens to spaces and normalize to lowercase
  return condition.replace(/-/g, ' ').toLowerCase().trim();
};

/**
 * Convert condition name from URL format to database format
 * @param urlCondition The condition name from URL (with hyphens)
 * @returns Database condition name (with spaces, uppercase)
 */
export const urlConditionToDbCondition = (urlCondition: string): string => {
  // Handle the special separator '---' (used in URLs to represent ' - ')
  const withMarker = urlCondition.replace(/---/g, '__DASH__');
  // Convert remaining hyphens to spaces (word joiners)
  const hyphensToSpaces = withMarker.replace(/-/g, ' ');
  // Restore the real separator
  const restored = hyphensToSpaces.replace(/__DASH__/g, ' - ');
  return restored.toUpperCase().trim();
};

/**
 * Convert condition name from database format to URL format
 * @param dbCondition The condition name from database (with spaces)
 * @returns URL condition name (with hyphens, lowercase)
 */
export const dbConditionToUrlCondition = (dbCondition: string): string => {
  return dbCondition.toLowerCase().replace(/\s+/g, '-');
};
