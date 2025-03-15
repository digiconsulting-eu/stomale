
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { ReviewError } from "@/components/review/ReviewError";
import { useReviewQuery } from "@/hooks/useReviewQuery";
import { setPageTitle, setMetaDescription, getReviewMetaDescription } from "@/utils/pageTitle";

const ReviewDetail = () => {
  const { condition, slug } = useParams();
  
  // Use condition as-is, without replacing hyphens or additional processing
  const decodedCondition = condition || '';
  const reviewId = slug?.split('-')[0];

  const { data: review, isLoading, error } = useReviewQuery(reviewId, decodedCondition);

  useEffect(() => {
    if (review?.title && review?.PATOLOGIE?.Patologia) {
      setPageTitle(`${review.PATOLOGIE.Patologia.toUpperCase()} | ${review.title}`);
      setMetaDescription(getReviewMetaDescription(review.PATOLOGIE.Patologia, review.title));
    }
  }, [review?.title, review?.PATOLOGIE?.Patologia]);

  if (error) {
    console.error('Error loading review:', error);
    return <ReviewError message="Si è verificato un errore nel caricamento della recensione." />;
  }

  if (isLoading) {
    return <ReviewLoader />;
  }

  if (!review) {
    return <ReviewError message="La recensione richiesta non è stata trovata." />;
  }

  return (
    <ReviewContent
      username={review.username}
      title={review.title}
      condition={review.PATOLOGIE?.Patologia?.toLowerCase()}
      symptoms={review.symptoms}
      experience={review.experience}
      diagnosisDifficulty={review.diagnosis_difficulty}
      symptomSeverity={review.symptoms_severity}
      hasMedication={review.has_medication}
      medicationEffectiveness={review.medication_effectiveness}
      healingPossibility={review.healing_possibility}
      socialDiscomfort={review.social_discomfort}
      reviewId={review.id.toString()}
      date={new Date(review.created_at).toLocaleDateString('it-IT')}
      likesCount={review.likes_count || 0}
    />
  );
};

export default ReviewDetail;
