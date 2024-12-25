import { PendingReview } from "@/hooks/usePendingReviews";
import { PendingReviewActions } from "./PendingReviewActions";

interface PendingReviewCardProps {
  review: PendingReview;
}

export const PendingReviewCard = ({ review }: PendingReviewCardProps) => {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{review.title}</h3>
            <p className="text-sm text-gray-500">
              Patologia: {review.PATOLOGIE?.Patologia}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
          <PendingReviewActions reviewId={review.id} />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Sintomi:</h4>
          <p className="text-sm whitespace-pre-wrap">{review.symptoms}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Esperienza:</h4>
          <p className="text-sm whitespace-pre-wrap">{review.experience}</p>
        </div>
      </div>
    </div>
  );
};