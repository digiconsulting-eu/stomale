
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList';
import { useComments } from './useComments';
import { CommentSectionProps } from './types';

export const CommentSection = ({ reviewId, showBottomButton = false }: CommentSectionProps) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  
  const { data: commentsData, refetch } = useComments(reviewId, session);

  const handleOpenCommentBox = () => {
    if (!session) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    setIsCommentBoxOpen(true);
  };

  const handleCancelComment = () => {
    setIsCommentBoxOpen(false);
  };

  const handleCommentSuccess = () => {
    setIsCommentBoxOpen(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      {isCommentBoxOpen && (
        <CommentForm 
          reviewId={reviewId} 
          session={session} 
          onCancel={handleCancelComment} 
          onSuccess={handleCommentSuccess} 
        />
      )}

      {commentsData && commentsData.length > 0 && (
        <CommentsList 
          comments={commentsData} 
          onAddComment={handleOpenCommentBox}
          isCommentBoxOpen={isCommentBoxOpen}
          showBottomButton={showBottomButton}
        />
      )}
    </div>
  );
};
