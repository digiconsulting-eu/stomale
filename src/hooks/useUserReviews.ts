import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserReviews = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log('Starting to fetch user reviews...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast.error("Errore nel caricamento dei dati utente");
        throw userError;
      }

      if (!userData?.username) {
        console.log('No username found for user');
        return [];
      }

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
          status,
          created_at,
          username,
          condition:PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('username', userData.username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        toast.error("Errore nel caricamento delle recensioni");
        throw error;
      }
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};