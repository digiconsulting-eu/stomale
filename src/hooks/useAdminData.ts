import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminData = () => {
  const queryClient = useQueryClient();

  // Fetch reviews that need moderation
  const { data: pendingReviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['admin-pending-reviews'],
    queryFn: async () => {
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch users for management
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch admins list
  const { data: admins, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add new admin mutation
  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('admin')
        .insert([{ email }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
      toast.success("Amministratore aggiunto con successo");
    },
    onError: (error) => {
      console.error('Error adding admin:', error);
      toast.error("Errore durante l'aggiunta dell'amministratore");
    },
  });

  // Update review status mutation
  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: number, status: 'approved' | 'removed' }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-reviews'] });
      toast.success("Stato della recensione aggiornato con successo");
    },
    onError: (error) => {
      console.error('Error updating review status:', error);
      toast.error("Errore durante l'aggiornamento dello stato della recensione");
    },
  });

  return {
    pendingReviews,
    users,
    admins,
    isLoading: isLoadingReviews || isLoadingUsers || isLoadingAdmins,
    addAdmin: addAdminMutation.mutate,
    updateReviewStatus: updateReviewStatusMutation.mutate,
  };
};