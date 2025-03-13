
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseReviewManagementProps {
  page?: number;
  limit?: number;
}

export const useReviewManagement = ({ page = 1, limit = 10 }: UseReviewManagementProps = {}) => {
  const queryClient = useQueryClient();
  const offset = (page - 1) * limit;

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', page, limit],
    queryFn: async () => {
      console.log('Starting to fetch reviews...');
      
      try {
        // First get total count
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        if (countError) {
          console.error('Error getting count:', countError);
          throw countError;
        }

        console.log('Total count of approved reviews:', totalCount);

        // Then get paginated data with all necessary relations
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            experience,
            diagnosis_difficulty,
            symptoms_severity,
            has_medication,
            medication_effectiveness,
            healing_possibility,
            social_discomfort,
            username,
            created_at,
            likes_count,
            comments_count,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Successfully fetched reviews:', data);
        
        // Transform the data to ensure username is properly handled
        const transformedReviews = data?.map(review => ({
          ...review,
          username: review.username || 'Anonimo'
        })) || [];

        console.log('Transformed reviews:', transformedReviews);

        return {
          reviews: transformedReviews,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        };
      } catch (error: any) {
        console.error('Error in review fetch:', error);
        if (error.message?.includes('JWT')) {
          toast.error("Sessione scaduta. Effettua nuovamente l'accesso.");
        } else {
          toast.error("Errore nel caricamento delle recensioni");
        }
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    },
    retry: 1
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
    onError: (error) => {
      console.error('Error updating review status:', error);
      toast.error("Errore durante l'aggiornamento dello stato della recensione");
    },
  });

  return {
    reviews: reviewsData?.reviews || [],
    totalCount: reviewsData?.totalCount || 0,
    totalPages: reviewsData?.totalPages || 0,
    isLoading,
    updateReviewStatus
  };
};
