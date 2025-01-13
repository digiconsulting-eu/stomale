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
  username: string;
  created_at: string;
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
  console.log('Reviews in grid:', reviews);

  if (reviews.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Non ci sono ancora recensioni approvate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          id={review.id}
          title={review.title}
          condition={review.PATOLOGIE?.Patologia || ''}
          date={new Date(review.created_at).toLocaleDateString()}
          preview={review.experience.slice(0, 200) + '...'}
          username={review.username}
        />
      ))}
    </div>
  );
};