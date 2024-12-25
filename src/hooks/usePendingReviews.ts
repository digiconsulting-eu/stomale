import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PendingReview {
  id: number;
  title: string;
  condition_id: number;
  status: string;
  created_at: string;
  symptoms: string;
  experience: string;
  PATOLOGIE: {
    Patologia: string;
  };
}

export const usePendingReviews = () => {
  return useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      console.log('Fetching pending reviews...');
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          condition_id,
          status,
          created_at,
          symptoms,
          experience,
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending reviews:', error);
        throw error;
      }

      console.log('Fetched pending reviews:', data);
      return data as PendingReview[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};