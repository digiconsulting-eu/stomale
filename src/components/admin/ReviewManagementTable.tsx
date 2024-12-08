import { useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseReview {
  id: number;
  title: string;
  status: string;
  created_at: string;
  condition_id: number;
  profiles: {
    username: string;
  } | null;
  PATOLOGIE: {
    Patologia: string;
  } | null;
}

interface Review {
  id: number;
  title: string;
  status: string;
  created_at: string;
  condition_id: number;
  username: string;
  patologia: string;
}

export const ReviewManagementTable = () => {
  const queryClient = useQueryClient();
  
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username),
          PATOLOGIE (Patologia)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Review interface
      const transformedData = (data as unknown as DatabaseReview[]).map(review => ({
        id: review.id,
        title: review.title,
        status: review.status,
        created_at: review.created_at,
        condition_id: review.condition_id,
        username: review.profiles?.username || 'Utente Anonimo',
        patologia: review.PATOLOGIE?.Patologia || 'Sconosciuta'
      }));

      return transformedData;
    },
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: number, status: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Stato della recensione aggiornato con successo");
    },
    onError: () => {
      toast.error("Errore durante l'aggiornamento dello stato della recensione");
    },
  });

  const handleStatusChange = (reviewId: number, status: 'approved' | 'rejected') => {
    updateReviewStatus.mutate({ reviewId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approvata</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rifiutata</Badge>;
      default:
        return <Badge variant="secondary">In Attesa</Badge>;
    }
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

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
          {reviews?.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <Link 
                  to={`/patologia/${review.patologia.toLowerCase()}/esperienza/${review.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-primary hover:underline"
                >
                  {review.title}
                </Link>
              </TableCell>
              <TableCell>{review.username}</TableCell>
              <TableCell>{review.patologia}</TableCell>
              <TableCell>{new Date(review.created_at).toLocaleDateString('it-IT')}</TableCell>
              <TableCell>{getStatusBadge(review.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(review.id, 'approved')}
                    disabled={review.status === 'approved'}
                  >
                    Approva
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusChange(review.id, 'rejected')}
                    disabled={review.status === 'rejected'}
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