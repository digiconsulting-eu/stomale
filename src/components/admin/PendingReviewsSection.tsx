import { Card } from "@/components/ui/card";
import { usePendingReviews } from "@/hooks/usePendingReviews";
import { PendingReviewCard } from "./PendingReviewCard";

export const PendingReviewsSection = () => {
  const { data: pendingReviews } = usePendingReviews();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Nuove recensioni da approvare ({pendingReviews?.length || 0})
      </h2>
      <div className="space-y-4">
        {pendingReviews?.map((review) => (
          <PendingReviewCard key={review.id} review={review} />
        ))}

        {pendingReviews?.length === 0 && (
          <p className="text-gray-500">Non ci sono recensioni in attesa di approvazione.</p>
        )}
      </div>
    </Card>
  );
};