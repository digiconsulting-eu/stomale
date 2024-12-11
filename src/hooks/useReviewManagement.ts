import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReviewManagement = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          status,
          created_at,
          user_id,
          PATOLOGIE (
            Patologia
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: number, status: string }) => {
      // First check if the review exists and get its user_id
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', reviewId)
        .single();

      if (reviewError) throw reviewError;

      // If there's no user_id, create a default user
      if (!reviewData.user_id) {
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email: `anonymous${Date.now()}@example.com`,
          password: Math.random().toString(36).slice(-8),
        });

        if (userError) throw userError;

        // Update the review with the new user_id
        const { error: updateUserError } = await supabase
          .from('reviews')
          .update({ user_id: userData.user?.id })
          .eq('id', reviewId);

        if (updateUserError) throw updateUserError;
      }

      // Now update the status
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
    reviews,
    isLoading,
    updateReviewStatus
  };
};