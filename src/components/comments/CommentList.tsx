
import React from 'react';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';

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

interface CommentListProps {
  comments: Comment[];
  onOpenCommentForm: () => void;
  showBottomButton: boolean;
}

export const CommentList = ({ comments, onOpenCommentForm, showBottomButton }: CommentListProps) => {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold mb-4">Commenti</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gradient-to-r from-[#E4F1FF] to-[#F0F8FF] p-4 rounded-lg shadow-sm border border-[#D0E6FF]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-[#2C3E50] break-words max-w-[70%]">{comment.users?.username || 'Anonimo'}</span>
            <span className="text-sm text-[#8E9196] ml-2 flex-shrink-0">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-[#2C3E50] whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}

      {showBottomButton && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={onOpenCommentForm}
            className="bg-primary hover:bg-primary/90"
          >
            Aggiungi un commento
          </Button>
        </div>
      )}
    </div>
  );
};
