import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewActionsProps {
  reviewId: number;
  status: string;
}

export const ReviewActions = ({ reviewId, status }: ReviewActionsProps) => {
  const queryClient = useQueryClient();

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Recensione ${newStatus === 'approved' ? 'ripubblicata' : 'rimossa'} con successo`);
      
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(`Errore durante l'aggiornamento dello stato della recensione`);
    }
  };

  if (status === 'approved') {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleUpdateStatus('rejected')}
      >
        <X className="h-4 w-4 mr-1" />
        Rimuovi
      </Button>
    );
  }

  if (status === 'rejected') {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => handleUpdateStatus('approved')}
      >
        <Check className="h-4 w-4 mr-1" />
        Ripubblica
      </Button>
    );
  }

  return null;
};