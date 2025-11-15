
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { urlConditionToDbCondition } from "@/utils/urlUtils";

interface RelatedReviewsProps {
  condition: string;
  reviewId: string;
}

export const RelatedReviews = ({ condition, reviewId }: RelatedReviewsProps) => {
  const normalizedCondition = urlConditionToDbCondition(condition);
  
  const { data: otherReviews } = useQuery({
    queryKey: ['condition-reviews', normalizedCondition],
    queryFn: async () => {
      console.log('Fetching other reviews for condition:', normalizedCondition);
      const { data: patologiaData } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .eq('Patologia', normalizedCondition)
        .single();

      if (!patologiaData) {
        throw new Error('Condition not found');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          username,
          created_at
        `)
        .eq('condition_id', patologiaData.id)
        .eq('status', 'approved')
        .neq('id', parseInt(reviewId))
        .limit(5);

      if (error) {
        console.error('Error fetching other reviews:', error);
        throw error;
      }

      console.log('Fetched other reviews:', data);
      return data;
    }
  });

  if (!otherReviews || otherReviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
      <h3 className="text-xl font-semibold mb-4">
        Altre esperienze su {condition.replace(/-/g, ' ').toUpperCase()}
      </h3>
      <div className="space-y-4">
        {otherReviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            title={review.title}
            condition={condition}
            date={new Date(review.created_at).toLocaleDateString()}
            preview={review.experience.slice(0, 150) + '...'}
            username={review.username}
          />
        ))}
      </div>
    </div>
  );
};
