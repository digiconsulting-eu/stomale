
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

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
  likes_count?: number;
  comments_count?: number;
}

interface ReviewsGridProps {
  reviews: Review[];
  isLoading: boolean;
}

export const ReviewsGrid = ({ reviews, isLoading }: ReviewsGridProps) => {
  console.log('Reviews in grid:', reviews);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[300px]" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Non ci sono ancora recensioni approvate.</p>
      </div>
    );
  }

  // Filter out any potentially malformed reviews
  const validReviews = reviews.filter(review => 
    review.id && 
    review.title && 
    review.experience && 
    (review.PATOLOGIE?.Patologia)
  );
  
  console.log('Valid reviews after filtering:', validReviews.length);

  if (validReviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Non ci sono recensioni valide da mostrare.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {validReviews.map((review) => (
        <ReviewCard
          key={review.id}
          id={review.id}
          title={review.title}
          condition={review.PATOLOGIE?.Patologia || ''}
          date={new Date(review.created_at).toLocaleDateString()}
          preview={review.experience.slice(0, 200) + '...'}
          username={review.username}
          likesCount={review.likes_count || 0}
          commentsCount={review.comments_count || 0}
        />
      ))}
    </div>
  );
};
