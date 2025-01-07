import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReviewActionsProps {
  reviewId: number;
  status: string;
}

export const ReviewActions = ({ reviewId, status }: ReviewActionsProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: 'approved' | 'removed') => {
    try {
      console.log('Attempting to update review status:', { reviewId, newStatus, currentStatus: status });
      
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review status:', error);
        toast.error("Errore durante l'aggiornamento della recensione");
        return;
      }

      // Invalidate and immediately refetch
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['latestReviews'] });

      toast.success(`Recensione ${newStatus === 'approved' ? 'pubblicata' : 'rimossa dalla pubblicazione'} con successo`);
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error("Errore durante l'aggiornamento della recensione");
    }
  };

  return (
    <div className="flex gap-2">
      {status !== 'approved' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('approved')}
        >
          Pubblica
        </Button>
      )}
      {status !== 'removed' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleStatusChange('removed')}
        >
          Rimuovi
        </Button>
      )}
    </div>
  );
};