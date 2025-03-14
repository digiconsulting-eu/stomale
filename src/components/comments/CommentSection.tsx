
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { DatabaseComment } from '@/types/comment';

interface CommentSectionProps {
  reviewId: string;
  showBottomButton?: boolean;
}

export const CommentSection = ({ reviewId, showBottomButton = false }: CommentSectionProps) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
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
          review_id,
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
      ) as DatabaseComment[];
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

  const handleCloseCommentBox = () => {
    setIsCommentBoxOpen(false);
  };

  const handleCommentSubmitted = () => {
    setIsCommentBoxOpen(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      {!isCommentBoxOpen && !commentsData?.length && (
        <div className="flex justify-end">
          <Button 
            onClick={handleOpenCommentBox}
            className="bg-primary/10 hover:bg-primary/20 text-primary"
          >
            Commenta
          </Button>
        </div>
      )}

      {isCommentBoxOpen && (
        <CommentForm 
          reviewId={reviewId}
          onCancel={handleCloseCommentBox}
          onCommentSubmitted={handleCommentSubmitted}
          userId={session?.user?.id}
        />
      )}

      {commentsData && commentsData.length > 0 && (
        <CommentList 
          comments={commentsData}
          onOpenCommentForm={handleOpenCommentBox}
          showBottomButton={showBottomButton && !isCommentBoxOpen}
        />
      )}
    </div>
  );
};
