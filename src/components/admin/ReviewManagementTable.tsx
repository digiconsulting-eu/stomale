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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ReviewManagementTable = () => {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      console.log('Fetching all reviews for admin...');
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            status,
            created_at,
            username,
            PATOLOGIE (
              Patologia
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews for admin:', data);
        return data || [];
      } catch (error) {
        console.error('Error in query execution:', error);
        throw error;
      }
    },
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0
  });

  if (error) {
    console.error('Error loading reviews:', error);
    return (
      <div className="text-center text-red-500 p-4">
        Si è verificato un errore nel caricamento delle recensioni.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        Non ci sono recensioni da gestire.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Patologia</TableHead>
            <TableHead>Autore</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{review.title}</TableCell>
              <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
              <TableCell>{review.username}</TableCell>
              <TableCell>
                {new Date(review.created_at).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    review.status === 'approved'
                      ? 'secondary'
                      : review.status === 'removed'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {review.status === 'approved'
                    ? 'Pubblicata'
                    : review.status === 'removed'
                    ? 'Rimossa'
                    : 'In attesa'}
                </Badge>
              </TableCell>
              <TableCell>
                <ReviewActions
                  reviewId={review.id}
                  status={review.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};