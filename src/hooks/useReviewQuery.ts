
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const extractReviewId = (slug: string) => {
  const parts = slug.split('-');
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

      // Effettuiamo una query per verificare il conteggio dei commenti attuale
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('review_id', reviewId)
        .eq('status', 'approved');
      
      console.log(`Found ${count} approved comments for review ID ${reviewId}`);

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

      // Verify that the condition matches
      if (data.PATOLOGIE?.Patologia.toLowerCase() !== decodeURIComponent(condition).toLowerCase()) {
        console.log('Condition mismatch');
        return null;
      }

      // Log del conteggio dei commenti nella recensione
      console.log(`Review ID ${reviewId} has comments_count: ${data.comments_count} in the database`);
      
      // Se il conteggio dei commenti nel database è diverso da quelli trovati, aggiorniamo
      if (data.comments_count !== count) {
        console.log(`Updating comments_count for review ID ${reviewId} from ${data.comments_count} to ${count}`);
        
        // Aggiorniamo il conteggio dei commenti nella recensione
        const { error: updateError } = await supabase
          .from('reviews')
          .update({ comments_count: count })
          .eq('id', reviewId);
          
        if (!updateError) {
          data.comments_count = count;
        }
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
