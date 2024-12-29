import { ReviewCard } from "@/components/ReviewCard";

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
  users?: {
    username: string;
  };
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
}

interface ReviewsGridProps {
  reviews: Review[];
  isLoading: boolean;
}

export const ReviewsGrid = ({ reviews, isLoading }: ReviewsGridProps) => {
  console.log('Reviews in ReviewsGrid:', reviews); // Debug log

  if (reviews.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Non ci sono ancora recensioni approvate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => {
        console.log('Review username:', review.users?.username); // Debug log
        return (
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
        );
      })}
    </div>
  );
};