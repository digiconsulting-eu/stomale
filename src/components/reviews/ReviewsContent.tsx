import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsGrid } from "./ReviewsGrid";
import { ReviewsPagination } from "./ReviewsPagination";
import { ReviewsDisclaimer } from "./ReviewsDisclaimer";
import { ReviewsHeader } from "./ReviewsHeader";

interface Review {
  id: number;
  title: string;
  experience: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  username: string;
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
}

interface ReviewsContentProps {
  reviews: Review[];
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
  console.log('Reviews with usernames:', reviews);

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
            reviews={reviews.map(review => ({
              ...review,
              username: review.username || 'Anonimo'
            }))} 
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