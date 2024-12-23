import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsGridProps {
  reviews: any[];
  isLoading: boolean;
}

export const ReviewsGrid = ({ reviews, isLoading }: ReviewsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {reviews.map((review) => (
        <ReviewCard 
          key={review.id}
          id={review.id}
          title={review.title}
          condition={review.PATOLOGIE?.Patologia || ''}
          experience={review.experience}
          diagnosisDifficulty={review.diagnosis_difficulty}
          symptomsSeverity={review.symptoms_severity}
          hasMedication={review.has_medication}
          medicationEffectiveness={review.medication_effectiveness}
          healingPossibility={review.healing_possibility}
          socialDiscomfort={review.social_discomfort}
          username={review.users?.username}
        />
      ))}

      {reviews.length === 0 && (
        <div className="col-span-2 text-center py-8">
          <p className="text-gray-500">Non ci sono ancora recensioni.</p>
        </div>
      )}
    </div>
  );
};