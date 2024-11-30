import { Link } from "react-router-dom";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";

interface ReviewCardProps {
  id: string;
  title: string;
  condition: string;
  preview: string;
  date: string;
  username?: string;
}

export const ReviewCard = ({ id, title, condition, preview, date }: ReviewCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  const conditionSlug = condition.toLowerCase().replace(/\s+/g, '-');
  const titleSlug = title.toLowerCase().replace(/\s+/g, '-');

  const handleDelete = async () => {
    try {
      // Here you would make an API call to delete the review
      // For now, we'll just show a success message
      toast.success("Recensione eliminata con successo");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Errore durante l'eliminazione della recensione");
    }
  };

  return (
    <div className="block group">
      <div className="card animate-fade-in group-hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <Link 
            to={`/patologia/${conditionSlug}/esperienza/${titleSlug}`}
            className="flex-1"
          >
            <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
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
        <p className="text-text-light line-clamp-3 leading-relaxed">{preview}</p>
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