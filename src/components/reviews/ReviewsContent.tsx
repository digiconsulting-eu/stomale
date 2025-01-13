import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsGrid } from "./ReviewsGrid";
import { ReviewsPagination } from "./ReviewsPagination";
import { ReviewsDisclaimer } from "./ReviewsDisclaimer";
import { ReviewsHeader } from "./ReviewsHeader";
import { DatabaseReview } from "@/types/review";

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
            reviews={reviews} 
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