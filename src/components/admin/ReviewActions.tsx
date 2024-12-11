import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ReviewActionsProps {
  reviewId: number;
  status: string;
  onUpdateStatus: (reviewId: number, status: string) => void;
}

export const ReviewActions = ({ reviewId, status, onUpdateStatus }: ReviewActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <>
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => onUpdateStatus(reviewId, 'approved')}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onUpdateStatus(reviewId, 'rejected')}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      {status === 'approved' && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onUpdateStatus(reviewId, 'rejected')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {status === 'rejected' && (
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600"
          onClick={() => onUpdateStatus(reviewId, 'approved')}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};