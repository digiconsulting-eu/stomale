import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PendingReviewActionsProps {
  reviewId: number;
}

export const PendingReviewActions = ({ reviewId }: PendingReviewActionsProps) => {
  const queryClient = useQueryClient();

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success(`Recensione ${newStatus === 'approved' ? 'approvata' : 'rifiutata'} con successo`);
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(`Errore durante ${newStatus === 'approved' ? "l'approvazione" : 'il rifiuto'} della recensione`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => handleUpdateStatus('approved')}
      >
        <Check className="h-4 w-4 mr-1" />
        Approva
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleUpdateStatus('rejected')}
      >
        <X className="h-4 w-4 mr-1" />
        Rifiuta
      </Button>
    </div>
  );
};