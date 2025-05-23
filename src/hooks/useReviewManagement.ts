
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

  const { data: reviewsData, isLoading, refetch, error } = useQuery({
    queryKey: ['reviews', page, limit],
    queryFn: async () => {
      console.log('Starting to fetch reviews on page', page, 'with limit', limit);
      
      try {
        // First make sure we have a fresh session
        await supabase.auth.refreshSession();
        
        // First get total count
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Error getting count:', countError);
          throw countError;
        }

        console.log('Total count of reviews:', totalCount);

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
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Reviews data fetched:', data?.length || 0);
        
        // Validate that the data structure is as expected
        if (!data || !Array.isArray(data)) {
          console.error('Invalid review data structure:', data);
          throw new Error('Invalid review data structure');
        }
        
        return {
          reviews: data || [],
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        };
      } catch (error: any) {
        console.error('Error in review fetch:', error);
        toast.error("Errore nel caricamento delle recensioni. Riprova tra qualche secondo.");
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Cap retry delay at 30 seconds
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: number, status: string }) => {
      // First refresh the session to ensure we have valid auth
      await supabase.auth.refreshSession();
      
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
    error,
    refetch,
    updateReviewStatus
  };
};
