
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

      // First fetch the actual comment count directly
      const { count: actualCommentsCount, error: countError } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('review_id', reviewId)
        .eq('status', 'approved');
      
      if (countError) {
        console.error('Error fetching comment count:', countError);
      }
      
      console.log(`Found ${actualCommentsCount} approved comments for review ID ${reviewId}`);

      // Then fetch the review data
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

      // Always update the comment count in the returned data
      console.log(`Review ID ${reviewId} has stored comments_count: ${data.comments_count}, actual count: ${actualCommentsCount}`);
      
      // Force the comments_count to match the actual count
      data.comments_count = actualCommentsCount;
      
      // Also ensure likes_count is always a number
      data.likes_count = typeof data.likes_count === 'number' ? data.likes_count : 0;
      
      console.log(`Review has likes_count: ${data.likes_count}`);
      
      // Also update in the database if there's a mismatch
      if (data.comments_count !== actualCommentsCount) {
        console.log(`Updating database comments_count for review ID ${reviewId} from ${data.comments_count} to ${actualCommentsCount}`);
        
        await supabase
          .from('reviews')
          .update({ comments_count: actualCommentsCount })
          .eq('id', reviewId);
      }

      console.log('Returning review with comments_count:', data.comments_count);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    }
  });
};
