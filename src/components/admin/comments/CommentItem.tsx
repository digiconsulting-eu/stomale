
import { Button } from "@/components/ui/button";
import { DatabaseComment } from "@/types/comment";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { CheckCircle, XCircle } from "lucide-react";

interface CommentItemProps {
  comment: DatabaseComment;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading: boolean;
}

export const CommentItem = ({ comment, onApprove, onReject, isLoading }: CommentItemProps) => {
  const formattedDate = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })
    : "";

  return (
    <div className="flex items-start justify-between p-4 border-b last:border-b-0">
      <div className="flex flex-col">
        <div className="font-medium break-words max-w-[70%]">{comment.users?.username || "Utente anonimo"}</div>
        <div className="mt-1 text-sm text-muted-foreground">{comment.content}</div>
        <div className="mt-1 text-xs text-gray-500">{formattedDate}</div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => onApprove(comment.id)}
          disabled={isLoading}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approva
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onReject(comment.id)}
          disabled={isLoading}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Rifiuta
        </Button>
      </div>
    </div>
  );
};
