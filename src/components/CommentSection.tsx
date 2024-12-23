import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface CommentSectionProps {
  reviewId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ reviewId }) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const COMMENTS_PER_PAGE = 10;
  const navigate = useNavigate();

  const { data: commentsData, refetch } = useQuery({
    queryKey: ['comments', reviewId, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * COMMENTS_PER_PAGE;
      
      // First get total count
      const { count: totalCount, error: countError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', parseInt(reviewId))
        .eq('status', 'approved');

      if (countError) throw countError;

      // Then get paginated comments
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          users (
            username
          )
        `)
        .eq('review_id', parseInt(reviewId))
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + COMMENTS_PER_PAGE - 1);

      if (error) throw error;

      return {
        comments: comments || [],
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / COMMENTS_PER_PAGE)
      };
    },
    staleTime: 30000
  });

  const handleOpenCommentBox = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    
    setIsCommentBoxOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          review_id: parseInt(reviewId),
          content: comment,
          user_id: (await supabase.auth.getSession()).data.session?.user.id
        });

      if (error) throw error;

      toast.success('Commento inviato con successo');
      setComment('');
      setIsCommentBoxOpen(false);
      refetch();
    } catch (error) {
      console.error('Errore durante l\'invio del commento:', error);
      toast.error('Impossibile inviare il commento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const comments = commentsData?.comments || [];
  const totalPages = commentsData?.totalPages || 0;

  return (
    <div className="space-y-4">
      {!isCommentBoxOpen ? (
        <div className="flex justify-end">
          <Button 
            onClick={handleOpenCommentBox}
            className="bg-primary/10 hover:bg-primary/20 text-primary"
          >
            Commenta
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Scrivi un commento..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsCommentBoxOpen(false);
                setComment('');
              }}
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Commento'}
            </Button>
          </div>
        </form>
      )}

      {comments.length > 0 && (
        <div className="space-y-4 mt-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{comment.users?.username}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Precedente
              </Button>
              <span className="mx-4 py-2">
                Pagina {currentPage} di {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Successiva
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};