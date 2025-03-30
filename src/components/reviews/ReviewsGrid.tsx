
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

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
  console.log('Reviews in grid:', reviews?.length || 0, reviews);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Caricamento recensioni in corso">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[300px]" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8" role="status" aria-label="Nessuna recensione trovata">
        <p className="text-gray-500">Non ci sono ancora recensioni approvate.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-500 underline flex items-center mx-auto"
          aria-label="Ricarica la pagina"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Ricarica la pagina
        </button>
      </div>
    );
  }

  // Filter out any potentially malformed reviews
  const validReviews = reviews.filter(review => 
    review && 
    review.id && 
    review.title && 
    review.PATOLOGIE?.Patologia
  );
  
  console.log('Valid reviews after filtering:', validReviews.length);
  
  if (validReviews.length === 0) {
    return (
      <div className="text-center py-8" role="status" aria-label="Nessuna recensione valida trovata">
        <p className="text-gray-500">Non ci sono recensioni valide da mostrare.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-500 underline flex items-center mx-auto"
          aria-label="Ricarica la pagina"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Ricarica la pagina
        </button>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible"
      role="feed"
      aria-label={`Lista di ${validReviews.length} recensioni`}
      itemScope
      itemType="https://schema.org/ItemList"
    >
      {validReviews.map((review, index) => {
        console.log(`Rendering review in grid: ID ${review.id}, Title: ${review.title}`);
        return (
          <div 
            key={review.id} 
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <meta itemProp="position" content={String(index + 1)} />
            <div itemProp="item" itemScope itemType="https://schema.org/Review">
              <ReviewCard
                id={review.id}
                title={review.title}
                condition={review.PATOLOGIE?.Patologia || ''}
                date={new Date(review.created_at).toLocaleDateString()}
                preview={review.experience?.slice(0, 200) + '...' || 'Nessuna esperienza descritta'}
                username={review.username || 'Anonimo'}
                likesCount={typeof review.likes_count === 'number' ? review.likes_count : 0}
                commentsCount={typeof review.comments_count === 'number' ? review.comments_count : 0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
