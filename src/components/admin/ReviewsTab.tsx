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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Review {
  id: number; // Changed from string to number to match the database type
  title: string;
  author: string;
  condition: string;
  status: string;
  date: string;
}

interface ReviewsTabProps {
  reviews: Review[];
  handleReviewAction: (id: number, action: "approve" | "reject") => void; // Changed parameter type to number
}

export const ReviewsTab = ({ reviews, handleReviewAction }: ReviewsTabProps) => {
  const queryClient = useQueryClient();

  const handleAction = async (reviewId: number, action: "approve" | "reject") => {
    try {
      console.log(`Attempting to ${action} review ${reviewId}`);
      
      const { error } = await supabase
        .from('reviews')
        .update({ status: action === 'approve' ? 'approved' : 'removed' })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review:', error);
        toast.error(`Errore durante l'${action === 'approve' ? 'approvazione' : 'rimozione'} della recensione`);
        return;
      }

      // Invalidate and refetch reviews
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['latestReviews'] });
      
      toast.success(`Recensione ${action === 'approve' ? 'approvata' : 'rimossa'} con successo`);
    } catch (error) {
      console.error('Error in handleAction:', error);
      toast.error("Si è verificato un errore durante l'operazione");
    }
  };

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
                  {review.status === "approved" ? "Approvata" : "Rimossa"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {review.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(review.id, "approve")}
                    >
                      Approva
                    </Button>
                  )}
                  {review.status !== "removed" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(review.id, "reject")}
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