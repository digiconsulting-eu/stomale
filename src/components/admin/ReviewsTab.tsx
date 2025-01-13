import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatabaseReview } from "@/types/review";

interface ReviewsTabProps {
  reviews: DatabaseReview[];
  handleReviewAction: (id: number, action: "approve" | "reject") => void;
}

export const ReviewsTab = ({ reviews, handleReviewAction }: ReviewsTabProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Autore</TableHead>
            <TableHead>Patologia</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.title}</TableCell>
              <TableCell>{review.username || 'Anonimo'}</TableCell>
              <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
              <TableCell>
                {new Date(review.created_at).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                  {review.status === "approved" ? "Approvata" : "In attesa"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {review.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewAction(review.id, "approve")}
                    >
                      Approva
                    </Button>
                  )}
                  {review.status !== "removed" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReviewAction(review.id, "reject")}
                    >
                      Rimuovi
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};