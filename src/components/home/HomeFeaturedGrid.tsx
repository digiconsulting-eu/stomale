
import { ReviewCard } from "@/components/ReviewCard";
import { Review } from "@/types/review";

interface HomeFeaturedGridProps {
  reviews: Review[];
  refreshKey: number;
}

export const HomeFeaturedGrid = ({ reviews, refreshKey }: HomeFeaturedGridProps) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    console.log('No reviews available to render in grid');
    return null;
  }

  console.log(`Rendering grid with ${reviews.length} reviews, refreshKey: ${refreshKey}`);
  
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {reviews.map((review, index) => {
        if (!review || typeof review !== 'object') {
          console.error(`Invalid review at index ${index}:`, review);
          return null;
        }
        
        try {
          const reviewId = typeof review.id === 'number' ? review.id : parseInt(String(review.id));
          if (isNaN(reviewId)) {
            console.error(`Invalid review ID at index ${index}:`, review.id);
            return null;
          }
          
          const safePreview = review.experience ? 
            (review.experience.slice(0, 150) + '...') : 
            'Nessun contenuto disponibile';
          
          console.log(`Rendering review ${reviewId} in grid`);
          
          return (
            <ReviewCard
              key={`review-${reviewId}-${index}-${refreshKey}`}
              id={reviewId}
              title={review.title}
              condition={review.condition}
              date={new Date(review.created_at).toLocaleDateString()}
              preview={safePreview}
              username={review.username}
              likesCount={review.likes_count || 0}
              commentsCount={review.comments_count || 0}
            />
          );
        } catch (error) {
          console.error(`Error rendering review at index ${index}:`, error, review);
          return null;
        }
      })}
    </div>
  );
};
