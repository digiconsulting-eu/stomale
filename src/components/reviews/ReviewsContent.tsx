
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsGrid } from "./ReviewsGrid";
import { ReviewsPagination } from "./ReviewsPagination";
import { ReviewsDisclaimer } from "./ReviewsDisclaimer";
import { ReviewsHeader } from "./ReviewsHeader";
import { DatabaseReview, Review } from "@/types/review";

interface ReviewsContentProps {
  reviews: DatabaseReview[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const ReviewsContent = ({
  reviews,
  isLoading,
  currentPage,
  totalPages,
  setCurrentPage
}: ReviewsContentProps) => {
  console.log('Reviews in ReviewsContent:', reviews);

  // Transform DatabaseReview[] to Review[] with safety checks
  const transformedReviews: Review[] = reviews.map(review => {
    // Ensure PATOLOGIE is never undefined
    const patologie = review.PATOLOGIE || { id: 0, Patologia: 'Sconosciuta' };
    
    return {
      id: review.id,
      title: review.title,
      condition: patologie.Patologia.toLowerCase() || '',
      experience: review.experience,
      diagnosis_difficulty: review.diagnosis_difficulty,
      symptoms_severity: review.symptoms_severity,
      has_medication: review.has_medication,
      medication_effectiveness: review.medication_effectiveness,
      healing_possibility: review.healing_possibility,
      social_discomfort: review.social_discomfort,
      username: review.username || 'Anonimo',
      created_at: review.created_at,
      PATOLOGIE: patologie,
      likes_count: typeof review.likes_count === 'number' ? review.likes_count : 0,
      comments_count: typeof review.comments_count === 'number' ? review.comments_count : 0
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <ReviewsHeader />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : (
          <ReviewsGrid 
            reviews={transformedReviews}
            isLoading={isLoading} 
          />
        )}

        {totalPages > 1 && (
          <ReviewsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}

        <ReviewsDisclaimer />
      </div>
    </div>
  );
};
