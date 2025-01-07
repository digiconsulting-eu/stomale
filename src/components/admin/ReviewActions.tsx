import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "../ConfirmDialog";
import { useState } from "react";

interface ReviewActionsProps {
  reviewId: number;
  status: string;
}

export const ReviewActions = ({ reviewId, status }: ReviewActionsProps) => {
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'removed'>('approved');

  const handleStatusChange = async (newStatus: 'approved' | 'removed') => {
    try {
      console.log('Attempting to update review status:', { reviewId, newStatus, currentStatus: status });
      
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error updating review status:', error);
        toast.error("Errore durante l'aggiornamento della recensione");
        return;
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['latestReviews'] });

      // Force an immediate refetch
      await queryClient.refetchQueries({ 
        queryKey: ['admin-reviews'],
        exact: true,
        type: 'active'
      });

      toast.success(`Recensione ${newStatus === 'approved' ? 'pubblicata' : 'rimossa dalla pubblicazione'} con successo`);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error("Errore durante l'aggiornamento della recensione");
    }
  };

  const openConfirmDialog = (type: 'approved' | 'removed') => {
    setActionType(type);
    setIsConfirmDialogOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        {status !== 'approved' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openConfirmDialog('approved')}
          >
            Pubblica
          </Button>
        )}
        {status !== 'removed' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openConfirmDialog('removed')}
          >
            Rimuovi
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => handleStatusChange(actionType)}
        title={actionType === 'approved' ? 'Conferma pubblicazione' : 'Conferma rimozione'}
        description={
          actionType === 'approved'
            ? 'Sei sicuro di voler pubblicare questa recensione?'
            : 'Sei sicuro di voler rimuovere questa recensione dalla pubblicazione?'
        }
      />
    </>
  );
};