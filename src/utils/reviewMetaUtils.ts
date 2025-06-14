import { Review } from "@/types/review";
import { getReviewMetaDescription } from "@/utils/pageTitle";
import { slugify } from "./slugify";

export const generateReviewMetaDescription = (review: Review): string => {
  let metaDescription = "";
  
  // Try symptoms first as they're usually more descriptive
  if (review.symptoms && review.symptoms.length > 50) {
    // Use symptoms and truncate to a reasonable length
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${review.symptoms.substring(0, 130).trim()}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // Fall back to experience if symptoms aren't available or too short
  else if (review.experience && review.experience.length > 60) {
    // Use experience and truncate to a reasonable length
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${review.experience.substring(0, 130).trim()}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // If no good content is available, use a combined approach
  else if (review.symptoms && review.experience) {
    // Combine both for a more complete picture
    const combinedText = `${review.symptoms.substring(0, 60).trim()} - ${review.experience.substring(0, 60).trim()}`;
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${combinedText}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // Fallback to generic description if we still don't have something useful
  else {
    metaDescription = getReviewMetaDescription(review.PATOLOGIE.Patologia, review.title);
  }

  // Ensure the meta description is truncated to a reasonable length for SEO
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + "...";
  }
  
  return metaDescription;
};

export const generateCanonicalUrl = (condition: string, reviewId: number, title: string): string => {
  const conditionSlug = slugify(condition);
  const titleSlug = slugify(title);
  return `https://stomale.info/patologia/${conditionSlug}/esperienza/${reviewId}-${titleSlug}`;
};
