import { ReviewCard } from "@/components/ReviewCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Review {
  id: number;
  title: string;
  experience: string;
  condition: {
    Patologia: string;
  };
  status: string;
  created_at: string;
  username: string;
}

interface ReviewsListProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
}

export const ReviewsList = ({ reviews, isLoading }: ReviewsListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="text-gray-500">Caricamento recensioni...</p>;
  }

  if (!reviews?.length) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-500">Non hai ancora scritto recensioni.</p>
        <Button 
          onClick={() => navigate('/nuova-recensione')}
          className="text-xl py-6 px-8 text-white"
        >
          Racconta la tua Esperienza
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <div key={review.id} className="relative">
          <ReviewCard
            id={review.id}
            title={review.title}
            condition={review.condition.Patologia}
            date={new Date(review.created_at).toLocaleDateString()}
            preview={review.experience.slice(0, 200) + '...'}
            username={review.username || 'Anonimo'}
          />
          {review.status === 'pending' && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2"
            >
              In attesa di approvazione
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};