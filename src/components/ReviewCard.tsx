import { Link } from "react-router-dom";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReviewCardProps {
  id: string;
  title?: string;
  condition: string;
  preview: string;
  date: string;
  username?: string;
}

export const ReviewCard = ({ id, title, condition, preview, date }: ReviewCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Recensione eliminata con successo");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error("Errore durante l'eliminazione della recensione");
    }
  };

  const reviewTitle = title || `Esperienza con ${capitalizeFirstLetter(condition)}`;
  const urlTitle = reviewTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

  return (
    <div className="block group">
      <div className="card animate-fade-in group-hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
            {reviewTitle}
          </h3>
          {isAdmin && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <Link to={`/recensione/modifica/${id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {capitalizeFirstLetter(condition)}
          </span>
          <div className="flex items-center text-text-light space-x-1">
            <Calendar size={14} />
            <span className="text-sm">{date}</span>
          </div>
        </div>
        <p className="text-text-light line-clamp-2 leading-relaxed mb-4">{preview}</p>
        <div className="flex justify-end">
          <Button 
            variant="outline"
            asChild
            className="text-primary hover:text-primary-dark"
          >
            <Link to={`/patologia/${condition.toLowerCase()}/esperienza/${urlTitle}`}>
              Leggi Esperienza
            </Link>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Elimina recensione"
        description="Sei sicuro di voler eliminare questa recensione? Questa azione non può essere annullata."
      />
    </div>
  );
};