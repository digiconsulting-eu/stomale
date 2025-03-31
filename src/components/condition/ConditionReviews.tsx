
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  likes_count?: number;
  comments_count?: number;
}

interface ConditionReviewsProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
  condition: string;
  onRetry?: () => void;
}

export const ConditionReviews = ({ 
  reviews, 
  isLoading, 
  condition,
  onRetry 
}: ConditionReviewsProps) => {
  console.log('ConditionReviews rendering with:', { 
    reviewsCount: reviews?.length, 
    condition, 
    isLoading 
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  // If we have an error state or corrupt data
  if (!reviews) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore di caricamento</AlertTitle>
          <AlertDescription>
            Non è stato possibile caricare le recensioni per questa patologia.
          </AlertDescription>
        </Alert>
        
        {onRetry && (
          <div className="text-center mt-4">
            <Button onClick={onRetry} variant="outline" className="inline-flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (reviews.length === 0) {
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
        // Ensure commentsCount is a number
        const commentsCount = typeof review.comments_count === 'number' ? review.comments_count : 0;
        
        return (
          <ReviewCard 
            key={review.id}
            id={review.id}
            title={review.title}
            condition={condition}
            date={new Date(review.created_at).toLocaleDateString()}
            preview={review.experience && review.experience.length > 200 
              ? review.experience.slice(0, 200) + '...' 
              : review.experience || ''}
            username={review.username}
            likesCount={review.likes_count || 0}
            commentsCount={commentsCount}
          />
        );
      })}
    </div>
  );
};
