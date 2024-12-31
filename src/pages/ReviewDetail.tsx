import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle, setMetaDescription, getReviewMetaDescription } from "@/utils/pageTitle";

const ReviewDetail = () => {
  const { id } = useParams();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      console.log('Fetching review with ID:', id);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          username,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching review:', error);
        throw error;
      }
      
      console.log('Fetched review:', data);
      return data;
    }
  });

  useEffect(() => {
    if (review?.title) {
      setPageTitle(`${review.title} | Recensione`);
      setMetaDescription(getReviewMetaDescription(review.PATOLOGIE?.Patologia, review.title));
    }
  }, [review?.title, review?.PATOLOGIE?.Patologia]);

  if (error) {
    console.error('Error loading review:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento della recensione.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">Recensione non trovata.</p>
      </div>
    );
  }

  return (
    <ReviewContent
      username={review.username}
      title={review.title}
      condition={review.PATOLOGIE?.Patologia?.toLowerCase()}
      symptoms={review.symptoms}
      experience={review.experience}
      diagnosisDifficulty={review.diagnosis_difficulty}
      symptomSeverity={review.symptoms_severity}
      hasMedication={review.has_medication}
      medicationEffectiveness={review.medication_effectiveness}
      healingPossibility={review.healing_possibility}
      socialDiscomfort={review.social_discomfort}
      reviewId={review.id.toString()}
      date={new Date(review.created_at).toLocaleDateString('it-IT')}
    />
  );
};

export default ReviewDetail;