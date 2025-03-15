
import { DatabaseReview } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingCommentsTable } from "./comments/PendingCommentsTable";
import { ReviewsTable } from "./reviews/ReviewsTable";

interface ReviewManagementTableProps {
  reviews: DatabaseReview[];
  isLoading: boolean;
}

export const ReviewManagementTable = ({ reviews, isLoading }: ReviewManagementTableProps) => {
  console.log("Reviews in ReviewManagementTable:", reviews);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Nessuna recensione trovata. Controlla la connessione al database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PendingCommentsTable />
      <ReviewsTable reviews={reviews} />
    </div>
  );
};
