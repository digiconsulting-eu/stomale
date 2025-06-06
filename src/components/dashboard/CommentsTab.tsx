
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  status: string;
  review_id: number;
  reviews: {
    title: string;
    PATOLOGIE: {
      Patologia: string;
    } | null;
  } | null;
}

export const CommentsTab = () => {
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['userComments'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          review_id,
          reviews (
            title,
            PATOLOGIE (
              Patologia
            )
          )
        `)
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      return data as Comment[];
    }
  });

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentToDelete);

    if (error) {
      console.error('Error deleting comment:', error);
      toast.error("Errore durante l'eliminazione del commento");
      return;
    }

    toast.success("Commento eliminato con successo");
    queryClient.invalidateQueries({ queryKey: ['userComments'] });
    setCommentToDelete(null);
  };

  const formatUrlPath = (text: string) => {
    return text.trim().toLowerCase().replace(/\s+/g, '-');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-3 md:p-4">
            <div className="h-16 md:h-20 animate-pulse bg-gray-100 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <Card className="p-6 md:p-8 text-center">
        <MessageCircle className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-3 md:mb-4" />
        <p className="text-gray-500 text-sm md:text-base">Non hai ancora scritto commenti</p>
        <Button asChild variant="link" className="mt-2 text-sm md:text-base">
          <Link to="/recensioni">Leggi le recensioni</Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-3 md:p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 text-sm md:text-base line-clamp-2">
                    {comment.reviews?.title || 'Recensione non disponibile'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs md:text-sm px-2 py-0.5 md:py-1 rounded-full ${
                    comment.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comment.status === 'approved' ? 'Approvato' : 'In attesa'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 md:h-8 md:w-8"
                    onClick={() => setCommentToDelete(comment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm line-clamp-3">{comment.content}</p>
              {comment.reviews?.PATOLOGIE?.Patologia && comment.reviews?.title && (
                <Button asChild variant="link" className="p-0 h-auto text-xs md:text-sm">
                  <Link to={`/patologia/${formatUrlPath(comment.reviews.PATOLOGIE.Patologia)}/esperienza/${comment.review_id}-${formatUrlPath(comment.reviews.title)}`}>
                    Vai alla recensione
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
        title="Elimina commento"
        description="Sei sicuro di voler eliminare questo commento? Questa azione non può essere annullata."
      />
    </>
  );
};
