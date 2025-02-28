
import { Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Review } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";

interface ConditionReviewsProps {
  reviews: Review[];
  isLoading: boolean;
  condition: string;
}

export const ConditionReviews = ({ reviews, isLoading, condition }: ConditionReviewsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-5 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg p-6">
        <p className="text-gray-500">Non ci sono ancora recensioni per questa patologia.</p>
        <p className="text-gray-500 mt-2">Puoi essere il primo a condividere la tua esperienza!</p>
      </div>
    );
  }

  const formatReviewUrl = (review: Review) => {
    const encodedCondition = encodeURIComponent(condition.toLowerCase());
    const titleSlug = review.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return `/patologia/${encodedCondition}/esperienza/${review.id}-${titleSlug}`;
  };

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <Link to={formatReviewUrl(review)} className="block">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{review.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span>{review.username}</span>
              <span className="mx-2">•</span>
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gravità Sintomi</p>
                  <StarRating value={review.symptoms_severity} readOnly />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difficoltà Diagnosi</p>
                  <StarRating value={review.diagnosis_difficulty} readOnly />
                </div>
              </div>
            </div>
            <p className="text-gray-700 line-clamp-3">{review.experience.substring(0, 200)}...</p>
            <p className="text-[#0EA5E9] mt-2 font-medium">Leggi tutto</p>
          </Link>
        </div>
      ))}
    </div>
  );
};
