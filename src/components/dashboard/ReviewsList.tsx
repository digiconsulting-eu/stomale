
import { ReviewCard } from "@/components/ReviewCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  likes_count?: number;
  comments_count?: number;
}

interface ReviewsListProps {
  reviews: Review[] | undefined;
  isLoading: boolean;
}

export const ReviewsList = ({ reviews, isLoading }: ReviewsListProps) => {
  const navigate = useNavigate();
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewToDelete);

    if (error) {
      console.error('Error deleting review:', error);
      toast.error("Errore durante l'eliminazione della recensione");
      return;
    }

    toast.success("Recensione eliminata con successo");
    queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
    setReviewToDelete(null);
  };

  if (isLoading) {
    return <p className="text-gray-500 text-center py-6">Caricamento recensioni...</p>;
  }

  if (!reviews?.length) {
    return (
      <div className="text-center space-y-4 py-6">
        <p className="text-gray-500 text-sm md:text-base">Non hai ancora scritto recensioni.</p>
        <Button 
          onClick={() => navigate('/nuova-recensione')}
          className="text-base md:text-xl py-3 md:py-6 px-6 md:px-8 text-white"
        >
          Racconta la tua Esperienza
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:gap-6 sm:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="relative">
            <ReviewCard
              id={review.id}
              title={review.title}
              condition={review.condition.Patologia}
              date={new Date(review.created_at).toLocaleDateString()}
              preview={review.experience.slice(0, 150) + '...'}
              username={review.username || 'Anonimo'}
              likesCount={review.likes_count || 0}
              commentsCount={review.comments_count || 0}
              onDelete={() => setReviewToDelete(review.id)}
            />
            {review.status === 'pending' && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 text-xs"
              >
                In attesa di approvazione
              </Badge>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteReview}
        title="Elimina recensione"
        description="Sei sicuro di voler eliminare questa recensione? Questa azione non può essere annullata."
      />
    </>
  );
};
