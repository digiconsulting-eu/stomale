import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { useEffect } from "react";
import { setPageTitle } from "@/utils/pageTitle";

export default function ReviewDetail() {
  const { id } = useParams();

  const { data: review } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (review) {
      setPageTitle(`${review.title} - StoMale.info`);
    }
  }, [review]);

  return (
    <div className="container mx-auto px-4 py-8">
      {review && (
        <ReviewContent 
          title={review.title}
          condition={review.PATOLOGIE.Patologia}
          date={new Date(review.created_at).toLocaleDateString('it-IT')}
          symptoms={review.symptoms}
          experience={review.experience}
          diagnosisDifficulty={review.diagnosis_difficulty}
          symptomSeverity={review.symptoms_severity}
          hasMedication={review.has_medication}
          medicationEffectiveness={review.medication_effectiveness}
          healingPossibility={review.healing_possibility}
          socialDiscomfort={review.social_discomfort}
          reviewId={review.id.toString()}
          username={review.users?.username}
        />
      )}
    </div>
  );
}