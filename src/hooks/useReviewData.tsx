
import { useParams } from "react-router-dom";
import { useReviewQuery } from "@/hooks/useReviewQuery";
import { useEffect } from "react";
import { generateReviewMetaDescription, generateCanonicalUrl } from "@/utils/reviewMetaUtils";
import { Review } from "@/types/review";

export const useReviewData = () => {
  const { condition, slug } = useParams();
  
  // Use condition as-is, without replacing hyphens or additional processing
  const decodedCondition = condition || '';
  const reviewId = slug?.split('-')[0];

  // Add console log to debug params
  console.log('ReviewDetail rendering with params:', { condition, slug, reviewId, decodedCondition });

  const { data: databaseReview, isLoading, error } = useReviewQuery(reviewId, decodedCondition);

  // Transform the database review to match the Review interface
  const review: Review | null = databaseReview ? {
    id: databaseReview.id,
    title: databaseReview.title,
    condition: decodedCondition, // Add the condition from URL params
    symptoms: databaseReview.symptoms || '',
    experience: databaseReview.experience || '',
    diagnosis_difficulty: databaseReview.diagnosis_difficulty,
    symptoms_severity: databaseReview.symptoms_severity,
    has_medication: databaseReview.has_medication,
    medication_effectiveness: databaseReview.medication_effectiveness,
    healing_possibility: databaseReview.healing_possibility,
    social_discomfort: databaseReview.social_discomfort,
    username: databaseReview.username || 'Anonimo',
    created_at: databaseReview.created_at,
    likes_count: databaseReview.likes_count,
    comments_count: databaseReview.comments_count,
    PATOLOGIE: databaseReview.PATOLOGIE,
    // Calculate rating based on conditions (similar to useConditionData)
    rating: databaseReview.diagnosis_difficulty !== undefined && 
            databaseReview.symptoms_severity !== undefined && 
            databaseReview.social_discomfort !== undefined ?
        Math.round((5 - (databaseReview.diagnosis_difficulty || 3) + 
                  5 - (databaseReview.symptoms_severity || 3) + 
                  (databaseReview.has_medication ? (databaseReview.medication_effectiveness || 3) : 3) + 
                  (databaseReview.healing_possibility || 3) + 
                  (5 - (databaseReview.social_discomfort || 3))) / 5) : 3
  } : null;

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
