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

const ITEMS_PER_PAGE = 50;

export const ReviewManagementTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading } = useQuery({
    queryKey: ['admin-reviews', currentPage],
    queryFn: async () => {
      console.log('Fetching reviews for admin page:', currentPage);
      try {
        // First get total count
        const { count, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Then get paginated data
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data: reviews, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            symptoms,
            experience,
            status,
            created_at,
            username,
            PATOLOGIE (
              Patologia
            )
          `)
          .range(from, to)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          reviews: reviews || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  if (error) {
    return <div>Error loading reviews</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
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
            {data?.reviews.map((review) => (
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

      {data?.totalPages > 1 && (
        <ReviewsPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};