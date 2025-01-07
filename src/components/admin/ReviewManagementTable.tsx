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

export const ReviewManagementTable = () => {
  const { data: reviews = [], error, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      console.log('Fetching all reviews for admin...');
      try {
        const { data, error } = await supabase
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
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log('Fetched reviews for admin:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
    },
    staleTime: 1000, // Consider data fresh for 1 second
    gcTime: 0, // Disable garbage collection to ensure we always get fresh data
  });

  if (error) {
    return <div>Error loading reviews</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
  );
};