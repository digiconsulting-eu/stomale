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
      
      const { data, error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId)
        .select();

      if (error) {
        console.error('Error updating review status:', error);
        toast.error("Errore durante l'aggiornamento della recensione");
        throw error;
      }

      console.log('Review status updated successfully:', data);

      // Invalidate and refetch ALL queries that might contain reviews
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['pending-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] })
      ]);

      toast.success(`Recensione ${newStatus === 'approved' ? 'approvata' : 'rimossa'} con successo`);
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
          Approva
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