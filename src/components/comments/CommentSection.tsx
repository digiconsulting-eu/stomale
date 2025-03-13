
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/hooks/useAuthSession';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  status: string;
  user_id: string;
  users?: {
    username: string;
  };
}

interface CommentSectionProps {
  reviewId: string;
  showBottomButton?: boolean;
}

export const CommentSection = ({ reviewId, showBottomButton = false }: CommentSectionProps) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { data: session } = useAuthSession();

  const { data: commentsData, refetch } = useQuery({
    queryKey: ['comments', reviewId],
    queryFn: async () => {
      console.log('Fetching comments for review:', reviewId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          user_id,
          users (
            username
          )
        `)
        .eq('review_id', parseInt(reviewId))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Fetched comments:', data);
      return (data || []).filter(comment => 
        comment.status === 'approved' || 
        (session?.user.id && comment.user_id === session.user.id)
      ) as Comment[];
    },
    enabled: true,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error('Errore nel caricamento dei commenti');
      }
    }
  });

  const handleOpenCommentBox = () => {
    if (!session) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    setIsCommentBoxOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          review_id: parseInt(reviewId),
          content: comment.trim(),
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting comment:', error);
        throw error;
      }

      console.log('Comment submitted successfully:', data);
      toast.success('Commento inviato con successo! Verrà pubblicato dopo la revisione.');
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

  return (
    <div className="space-y-4">
      {isCommentBoxOpen && (
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

      {commentsData && commentsData.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-semibold mb-4">Commenti</h3>
          {commentsData.map((comment) => (
            <div key={comment.id} className="bg-gradient-to-r from-[#E4F1FF] to-[#F0F8FF] p-4 rounded-lg shadow-sm border border-[#D0E6FF]">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-[#2C3E50]">{comment.users?.username || 'Utente'}</span>
                <span className="text-sm text-[#8E9196]">
                  {new Date(comment.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
              <p className="text-[#2C3E50] whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}

          {/* Bottom comment button is also removed as per user request */}
        </div>
      )}
    </div>
  );
};
