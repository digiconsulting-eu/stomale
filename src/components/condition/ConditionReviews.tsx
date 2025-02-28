import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: number;
  title: string;
  condition: string;
  experience: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
  username: string;
  created_at: string;
}

interface ConditionReviewsProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
  condition: string;
}

export const ConditionReviews = ({ reviews, isLoading, condition }: ConditionReviewsProps) => {
  console.log('ConditionReviews rendering with:', { reviews, condition, isLoading });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    console.log('No reviews found for condition:', condition);
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Non ci sono ancora recensioni per questa patologia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        console.log('Rendering review:', review);
        return (
          <ReviewCard 
            key={review.id}
            id={review.id}
            title={review.title}
            condition={condition}
            date={new Date(review.created_at).toLocaleDateString()}
            preview={review.experience.slice(0, 200) + '...'}
            username={review.username}
          />
        );
      })}
    </div>
  );
};