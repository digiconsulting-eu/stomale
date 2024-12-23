import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle } from "@/utils/pageTitle";

const ReviewDetail = () => {
  const { condition, title } = useParams();

  useEffect(() => {
    setPageTitle(`${title} | Recensione su ${condition}`);
  }, [title, condition]);

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', condition, title],
    queryFn: async () => {
      console.log('Fetching review for:', { condition, title });
      try {
        const titleSlug = title?.toLowerCase().replace(/-/g, ' ');
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            users (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .eq('title', titleSlug)
          .single();

        if (error) {
          console.error('Error fetching review:', error);
          throw error;
        }

        console.log('Found matching review with full data:', data);
        return data;
      } catch (error) {
        console.error('Error in review query:', error);
        throw error;
      }
    }
  });

  if (error) {
    toast.error("Errore nel caricamento della recensione");
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Si è verificato un errore nel caricamento della recensione.</p>
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
    <div className="container mx-auto px-4 py-8">
      <ReviewContent
        username={review.users?.username}
        title={review.title}
        condition={review.PATOLOGIE?.Patologia?.toLowerCase()}
        symptoms={review.symptoms}
        experience={review.experience}
        diagnosisDifficulty={review.diagnosis_difficulty}
        symptomSeverity={review.symptoms_severity} // Changed from symptomsSeverity to symptomSeverity
        hasMedication={review.has_medication}
        medicationEffectiveness={review.medication_effectiveness}
        healingPossibility={review.healing_possibility}
        socialDiscomfort={review.social_discomfort}
        reviewId={review.id.toString()} // Added reviewId prop
        date={new Date(review.created_at).toLocaleDateString('it-IT')} // Added date prop
      />
    </div>
  );
};

export default ReviewDetail;