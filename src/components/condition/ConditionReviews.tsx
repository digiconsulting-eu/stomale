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
}

interface ConditionReviewsProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
  condition: string;
}

export const ConditionReviews = ({ reviews, isLoading, condition }: ConditionReviewsProps) => {
  console.log('Condition reviews with usernames:', reviews);

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
          id={review.id}
          title={review.title}
          experience={review.experience}
          condition={condition}
          diagnosisDifficulty={review.diagnosis_difficulty}
          symptomsSeverity={review.symptoms_severity}
          hasMedication={review.has_medication}
          medicationEffectiveness={review.medication_effectiveness}
          healingPossibility={review.healing_possibility}
          socialDiscomfort={review.social_discomfort}
          username={review.username}
        />
      ))}
    </div>
  );
};