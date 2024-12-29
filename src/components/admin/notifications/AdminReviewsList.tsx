import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Review } from "@/types/review";

interface AdminReviewsListProps {
  reviews: Review[];
}

export const AdminReviewsList = ({ reviews }: AdminReviewsListProps) => {
  const queryClient = useQueryClient();

  const handleRejectReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success("Recensione rimossa con successo");
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error("Errore durante la rimozione della recensione");
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="text-gray-500">Non ci sono nuove recensioni da controllare.</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 rounded-lg border bg-white"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{review.title}</h3>
                <p className="text-sm text-gray-500">
                  Patologia: {review.PATOLOGIE?.Patologia}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(review.created_at || '').toLocaleDateString('it-IT')}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRejectReview(review.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Rimuovi
              </Button>
            </div>

            {review.symptoms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sintomi:</h4>
                <p className="text-sm whitespace-pre-wrap">{review.symptoms}</p>
              </div>
            )}

            {review.experience && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Esperienza:</h4>
                <p className="text-sm whitespace-pre-wrap">{review.experience}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};