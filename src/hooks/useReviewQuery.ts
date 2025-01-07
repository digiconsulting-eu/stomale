import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const extractReviewId = (slug: string) => {
  const parts = slug.split('-');
  // Convert the ID part to a number
  return parseInt(parts[0], 10);
};

export const useReviewQuery = (slug: string | undefined, condition: string | undefined) => {
  return useQuery({
    queryKey: ['review', slug, condition],
    queryFn: async () => {
      console.log('Fetching review with slug:', slug);
      console.log('Condition:', condition);
      
      if (!slug || !condition) {
        console.log('Missing slug or condition');
        return null;
      }

      const reviewId = extractReviewId(slug);
      console.log('Extracted review ID:', reviewId);

      if (isNaN(reviewId)) {
        console.log('Invalid review ID');
        return null;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('status', 'approved')
        .eq('PATOLOGIE.Patologia', decodeURIComponent(condition || '').toUpperCase())
        .eq('id', reviewId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching review:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No review found with these parameters');
        return null;
      }

      console.log('Fetched review:', data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    }
  });
};