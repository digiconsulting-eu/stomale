import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ReviewActions } from "./ReviewActions";
import { ReviewsPagination } from "../reviews/ReviewsPagination";
import { useState } from "react";
import { DatabaseReview } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 50;

interface ReviewManagementTableProps {
  reviews: DatabaseReview[];
  isLoading: boolean;
}

export const ReviewManagementTable = ({ reviews, isLoading }: ReviewManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

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
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
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
                <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                    {review.status === "approved" ? "Approvata" : "Rimossa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReviewActions reviewId={review.id} status={review.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {reviews.length > ITEMS_PER_PAGE && (
        <ReviewsPagination
          currentPage={currentPage}
          totalPages={Math.ceil(reviews.length / ITEMS_PER_PAGE)}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};