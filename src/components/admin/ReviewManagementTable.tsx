import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewActions } from "./ReviewActions";
import { useReviewManagement } from "@/hooks/useReviewManagement";

export const ReviewManagementTable = () => {
  const { reviews, isLoading, updateReviewStatus } = useReviewManagement();

  const handleUpdateStatus = (reviewId: number, status: string) => {
    updateReviewStatus.mutate({ reviewId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Titolo</TableHead>
          <TableHead>Patologia</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews?.map((review) => (
          <TableRow key={review.id}>
            <TableCell>{review.id}</TableCell>
            <TableCell>{review.title}</TableCell>
            <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
            <TableCell>
              <Badge
                variant={
                  review.status === 'approved'
                    ? 'secondary'
                    : review.status === 'rejected'
                    ? 'destructive'
                    : 'default'
                }
              >
                {review.status === 'approved'
                  ? 'Approvata'
                  : review.status === 'rejected'
                  ? 'Rifiutata'
                  : 'In attesa'}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(review.created_at).toLocaleDateString('it-IT')}
            </TableCell>
            <TableCell>
              <ReviewActions
                reviewId={review.id}
                status={review.status}
                onUpdateStatus={handleUpdateStatus}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};