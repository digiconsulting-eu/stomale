
import { ReviewSEO } from "@/components/review/ReviewSEO";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { ReviewError } from "@/components/review/ReviewError";
import { useReviewData } from "@/hooks/useReviewData";
import { Disclaimer } from "@/components/Disclaimer";
import { RelatedReviews } from "@/components/review/RelatedReviews";

const ReviewDetail = () => {
  const { review, isLoading, error, metadata } = useReviewData();

  if (error) {
    console.error('Error loading review:', error);
    return <ReviewError message="Si è verificato un errore nel caricamento della recensione." />;
  }

  if (isLoading) {
    return <ReviewLoader />;
  }

  if (!review || !metadata) {
    return <ReviewError message="La recensione richiesta non è stata trovata." />;
  }

  return (
    <>
      <ReviewSEO 
        review={review}
        metaDescription={metadata.metaDescription}
        canonicalUrl={metadata.canonicalUrl}
        pageTitle={metadata.pageTitle}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ReviewContent
              username={review.username}
              title={review.title}
              condition={review.condition}
              symptoms={review.symptoms || ''}
              experience={review.experience || ''}
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
            
            <div className="max-w-4xl mt-8">
              <Disclaimer condition={review.condition} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <RelatedReviews 
              condition={review.condition}
              reviewId={review.id.toString()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewDetail;
