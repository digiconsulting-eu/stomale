
import { DatabaseReview } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingCommentsTable } from "./comments/PendingCommentsTable";
import { ReviewsTable } from "./reviews/ReviewsTable";

interface ReviewManagementTableProps {
  reviews: DatabaseReview[];
  isLoading: boolean;
}

export const ReviewManagementTable = ({ reviews, isLoading }: ReviewManagementTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
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
