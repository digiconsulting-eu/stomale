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

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    try {
      console.log('Updating review status:', { reviewId, newStatus });
      
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review status:', error);
        throw error;
      }

      // Invalidate and refetch ALL queries that might contain reviews
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['latestReviews'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] })
      ]);

      toast.success(`Recensione ${newStatus === 'approved' ? 'approvata' : 'rimossa'} con successo`);
    } catch (error) {
      console.error('Error updating review status:', error);
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
          Approva
        </Button>
      )}
      {status !== 'rejected' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleStatusChange('rejected')}
        >
          Rimuovi
        </Button>
      )}
    </div>
  );
};