import { Review } from "@/types/review";
import { getReviewMetaDescription } from "@/utils/pageTitle";
import { slugify } from "./slugify";

export const generateReviewMetaDescription = (review: Review): string => {
  let metaDescription = "";
  const condition = review.PATOLOGIE.Patologia;
  
  // Create a compelling snippet from the user's own words.
  // Prioritize the experience text as it's often more narrative.
  let contentSnippet = "";
  if (review.experience && review.experience.length > 60) {
    contentSnippet = review.experience;
  } else if (review.symptoms && review.symptoms.length > 50) {
    contentSnippet = review.symptoms;
  }

  if (contentSnippet) {
    // Craft a descriptive sentence
    const snippet = contentSnippet.substring(0, 90).trim().replace(/\s+/g, ' ');
    metaDescription = `Esperienza con ${condition}: "${review.title}". Un paziente descrive: "${snippet}...". Leggi la testimonianza completa su StoMale.info.`;
  } else {
    // Fallback to the generic but well-written description if content is too short
    metaDescription = getReviewMetaDescription(condition, review.title);
  }

  // Ensure the meta description is truncated to the optimal length for SEO
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
