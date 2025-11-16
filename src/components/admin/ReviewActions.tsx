import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "../ConfirmDialog";
import { ReviewEditDialog } from "./ReviewEditDialog";
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";

interface ReviewActionsProps {
  reviewId: number;
  status: string;
  title: string;
  symptoms: string;
  experience: string;
  autoOpenEdit?: boolean;
}

export const ReviewActions = ({ reviewId, status, title, symptoms, experience, autoOpenEdit }: ReviewActionsProps) => {
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [actionType, setActionType] = useState<'approved' | 'removed'>('approved');

// Auto open edit dialog when requested via URL param
useEffect(() => {
  if (autoOpenEdit) {
    setIsEditDialogOpen(true);
  }
}, [autoOpenEdit]);
  const handleStatusChange = async (newStatus: 'approved' | 'removed') => {
    try {
      console.log('Attempting to update review status:', { reviewId, newStatus, currentStatus: status });
      
      const { data, error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId)
        .select('status')
        .single();

      if (error) {
        console.error('Error updating review status:', error);
        toast.error("Errore durante l'aggiornamento della recensione");
        return;
      }

      if (!data) {
        console.error('No data returned after update');
        toast.error("Errore: nessun dato restituito dopo l'aggiornamento");
        return;
      }

      console.log('Review status updated successfully:', data);

      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['latestReviews'] })
      ]);

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
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditDialogOpen(true);
          }}
        >
          <Edit className="h-3 w-3 mr-1" />
          Modifica
        </Button>
        {status !== 'approved' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openConfirmDialog('approved');
            }}
          >
            Pubblica
          </Button>
        )}
        {status !== 'removed' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openConfirmDialog('removed');
            }}
          >
            Rimuovi
          </Button>
        )}
      </div>

      <ReviewEditDialog
        reviewId={reviewId}
        currentTitle={title}
        currentSymptoms={symptoms}
        currentExperience={experience}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

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