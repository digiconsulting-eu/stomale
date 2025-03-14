
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface CommentActionsProps {
  commentId: number;
  status: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading: boolean;
}

export const CommentActions = ({ 
  commentId, 
  status, 
  onApprove, 
  onReject, 
  isLoading 
}: CommentActionsProps) => {
  if (status !== "pending") {
    return null;
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 text-green-600"
        onClick={() => onApprove(commentId)}
        disabled={isLoading}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 text-red-600"
        onClick={() => onReject(commentId)}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
