
import { useParams } from "react-router-dom";
import { useReviewQuery } from "@/hooks/useReviewQuery";
import { useEffect } from "react";
import { generateReviewMetaDescription, generateCanonicalUrl } from "@/utils/reviewMetaUtils";

export const useReviewData = () => {
  const { condition, slug } = useParams();
  
  // Use condition as-is, without replacing hyphens or additional processing
  const decodedCondition = condition || '';
  const reviewId = slug?.split('-')[0];

  // Add console log to debug params
  console.log('ReviewDetail rendering with params:', { condition, slug, reviewId, decodedCondition });

  const { data: review, isLoading, error } = useReviewQuery(reviewId, decodedCondition);

  // Add console log to track review data
  console.log('Review data loaded:', review ? 
    { 
      id: review.id, 
      title: review.title, 
      hasSymptoms: !!review.symptoms,
      symptomsLength: review.symptoms?.length,
      experienceLength: review.experience?.length 
    } : 'No review data');

  useEffect(() => {
    if (review?.title && review?.PATOLOGIE?.Patologia) {
      // Update document title for client-side rendering
      const formattedCondition = review.PATOLOGIE.Patologia.toUpperCase();
      document.title = `${formattedCondition}: Recensione ed Esperienza | ${review.title} | StoMale.info`;
    }
  }, [review?.title, review?.PATOLOGIE?.Patologia]);

  // Generate metadata only if review exists
  const metadata = review ? {
    metaDescription: generateReviewMetaDescription(review),
    canonicalUrl: generateCanonicalUrl(
      decodedCondition, 
      review.id, 
      review.title
    ),
    pageTitle: `${review.PATOLOGIE.Patologia.toUpperCase()}: Recensione ed Esperienza | ${review.title} | StoMale.info`
  } : null;

  return {
    review,
    isLoading,
    error,
    decodedCondition,
    metadata
  };
};
