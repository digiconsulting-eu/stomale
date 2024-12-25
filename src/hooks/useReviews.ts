import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReviews = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['reviews', page, limit],
    queryFn: async () => {
      console.log('Fetching reviews for page:', page);
      
      const { count, error: countError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (countError) {
        console.error('Error getting reviews count:', countError);
        throw countError;
      }

      const { data: reviews, error } = await supabase
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
          users (
            username
          ),
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      console.log('Fetched reviews:', reviews);
      
      return {
        reviews: reviews || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    meta: {
      onError: () => {
        toast.error("Errore nel caricamento delle recensioni");
      }
    }
  });
};