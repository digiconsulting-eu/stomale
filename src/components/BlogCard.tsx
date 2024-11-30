import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";

interface BlogCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  isFeature?: boolean;
}

export const BlogCard = ({ id, title, imageUrl, category, isFeature = false }: BlogCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleDelete = async () => {
    try {
      // Here you would make an API call to delete the article
      // For now, we'll just show a success message
      toast.success("Articolo eliminato con successo");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Errore durante l'eliminazione dell'articolo");
    }
  };

  return (
    <div className={`group relative ${isFeature ? 'row-span-3' : ''}`}>
      <Link to={`/blog/articolo/${id}`} className="block">
        <div className="relative h-full overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
          <div className="absolute bottom-0 p-4 w-full">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-2">{category}</p>
                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                  {title}
                </h3>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    asChild
                    onClick={(e) => e.preventDefault()}
                  >
                    <Link to={`/blog/modifica/${id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Elimina articolo"
        description="Sei sicuro di voler eliminare questo articolo? Questa azione non può essere annullata."
      />
    </div>
  );
};