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
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      console.log('Fetching all reviews...');
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          status,
          created_at,
          PATOLOGIE (
            Patologia
          ),
          users (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      console.log('Fetched reviews:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Totale recensioni: {reviews?.length || 0}
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Patologia</TableHead>
            <TableHead>Autore</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews?.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.title}</TableCell>
              <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
              <TableCell>{review.users?.username}</TableCell>
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
                    ? 'Pubblicata'
                    : review.status === 'rejected'
                    ? 'Rimossa'
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
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};