
import { formatCommentDate } from './utils';
import { Comment } from './types';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="bg-gradient-to-r from-[#E4F1FF] to-[#F0F8FF] p-4 rounded-lg shadow-sm border border-[#D0E6FF]">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-[#2C3E50]">
          {comment.users?.username || 'Utente'}
        </span>
        <span className="text-sm text-[#8E9196]">
          {formatCommentDate(comment.created_at)}
        </span>
      </div>
      <p className="text-[#2C3E50] whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};
