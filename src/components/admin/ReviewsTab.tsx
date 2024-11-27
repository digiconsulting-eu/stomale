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

interface Review {
  id: string;
  title: string;
  author: string;
  condition: string;
  status: string;
  date: string;
}

interface ReviewsTabProps {
  reviews: Review[];
  handleReviewAction: (id: string, action: "approve" | "reject") => void;
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
              <TableCell>{review.author}</TableCell>
              <TableCell>{review.condition}</TableCell>
              <TableCell>{review.date}</TableCell>
              <TableCell>
                <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                  {review.status === "approved" ? "Approvata" : "In attesa"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReviewAction(review.id, "approve")}
                    disabled={review.status === "approved"}
                  >
                    Approva
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReviewAction(review.id, "reject")}
                    disabled={review.status === "rejected"}
                  >
                    Rifiuta
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};