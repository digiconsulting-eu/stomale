import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle, getReviewPageTitle } from "@/utils/pageTitle";

export default function ReviewDetail() {
  const { condition, title } = useParams();

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', condition, title],
    queryFn: async () => {
      if (!condition || !title) {
        throw new Error('Missing condition or title');
      }

      console.log('Fetching review with condition:', condition, 'and title:', title);

      // First get the condition ID
      const { data: conditionData, error: conditionError } = await supabase
        .from('PATOLOGIE')
        .select('id, Patologia')
        .ilike('Patologia', condition)
        .single();

      if (conditionError) {
        console.error('Error fetching condition:', conditionError);
        throw conditionError;
      }

      if (!conditionData) {
        throw new Error('Condition not found');
      }

      // Then get the review
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            Patologia
          ),
          users (
            username
          )
        `)
        .eq('condition_id', conditionData.id)
        .eq('status', 'approved')
        .single();

      if (reviewError) {
        console.error('Error fetching review:', reviewError);
        throw reviewError;
      }

      console.log('Found matching review with full data:', reviewData);

      return reviewData;
    }
  });

  useEffect(() => {
    if (review) {
      setPageTitle(getReviewPageTitle(
        review.PATOLOGIE?.Patologia || '',
        review.title
      ));
    }
  }, [review]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-40 mb-8" />
          <Skeleton className="h-20 mb-4" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!review) return null;

  console.log('Review data being passed to ReviewContent:', {
    username: review.users?.username,
    title: review.title,
    condition: review.PATOLOGIE?.Patologia.toLowerCase()
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <ReviewContent
            title={review.title}
            condition={review.PATOLOGIE?.Patologia.toLowerCase()}
            date={new Date(review.created_at).toLocaleDateString('it-IT')}
            symptoms={review.symptoms}
            experience={review.experience}
            diagnosisDifficulty={Number(review.diagnosis_difficulty)}
            symptomSeverity={Number(review.symptoms_severity)}
            hasMedication={review.has_medication}
            medicationEffectiveness={Number(review.medication_effectiveness)}
            healingPossibility={Number(review.healing_possibility)}
            socialDiscomfort={Number(review.social_discomfort)}
            reviewId={review.id.toString()}
            username={review.users?.username}
          />
        </div>
      </div>
    </div>
  );
}