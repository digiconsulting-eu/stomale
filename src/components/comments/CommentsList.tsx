
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Comment } from './types';

interface CommentsListProps {
  comments: Comment[];
  onAddComment: () => void;
  isCommentBoxOpen: boolean;
  showBottomButton: boolean;
}

export const CommentsList = ({ 
  comments, 
  onAddComment, 
  isCommentBoxOpen,
  showBottomButton 
}: CommentsListProps) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold mb-4">Commenti</h3>
      
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {showBottomButton && !isCommentBoxOpen && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={onAddComment}
            className="bg-primary hover:bg-primary/90"
          >
            Aggiungi un commento
          </Button>
        </div>
      )}
    </div>
  );
};
