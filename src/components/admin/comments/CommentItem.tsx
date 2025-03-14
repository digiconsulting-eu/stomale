
import { DatabaseComment } from "@/types/comment";
import { CommentStatusBadge } from "./CommentStatusBadge";
import { CommentActions } from "./CommentActions";
import { CommentDetails } from "./CommentDetails";
import { Link } from "react-router-dom";

interface CommentItemProps {
  comment: DatabaseComment;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading: boolean;
}

export const CommentItem = ({ 
  comment, 
  onApprove, 
  onReject, 
  isLoading 
}: CommentItemProps) => {
  return (
    <div className="p-4 border rounded-lg mb-4">
      <div className="flex justify-between items-start">
        <CommentDetails 
          username={comment.username || "Utente anonimo"} 
          content={comment.content}
          createdAt={comment.created_at}
        />
        <div className="flex items-center space-x-2">
          <CommentStatusBadge status={comment.status} />
          <CommentActions 
            commentId={comment.id} 
            status={comment.status}
            onApprove={onApprove}
            onReject={onReject}
            isLoading={isLoading}
          />
        </div>
      </div>
      {comment.review_id && (
        <div className="mt-3 text-xs">
          <Link
            to={`/admin/reviews/${comment.review_id}`}
            className="text-primary hover:underline"
          >
            Visualizza recensione associata
          </Link>
        </div>
      )}
    </div>
  );
};
