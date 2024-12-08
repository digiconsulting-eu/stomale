import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: number;
  title: string;
  experience: string;
  created_at: string;
  condition: string;
}

interface ConditionReviewsProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
  condition: string;
}

export const ConditionReviews = ({ reviews, isLoading, condition }: ConditionReviewsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews?.map((review) => (
        <ReviewCard 
          key={review.id}
          id={review.id.toString()}
          title={review.title}
          date={new Date(review.created_at).toLocaleDateString('it-IT')}
          preview={review.experience}
          condition={condition}
        />
      ))}
    </div>
  );
};