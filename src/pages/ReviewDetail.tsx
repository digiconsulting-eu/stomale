import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewContent } from "@/components/review/ReviewContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title: reviewId } = useParams();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", condition, reviewId],
    queryFn: async () => {
      try {
        if (!condition || !reviewId) {
          throw new Error('Parametri mancanti');
        }

        console.log('Fetching review with condition:', condition, 'and ID:', reviewId);
        
        // First get the condition ID
        const { data: patologiaData, error: patologiaError } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .eq('Patologia', condition.toUpperCase())
          .single();

        if (patologiaError) {
          console.error('Error fetching patologia:', patologiaError);
          throw new Error('Patologia non trovata');
        }

        if (!patologiaData) {
          console.error('No patologia found for:', condition);
          throw new Error('Patologia non trovata');
        }

        console.log('Found patologia with ID:', patologiaData.id);

        // Then get the review using the condition ID and review ID
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            *,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('condition_id', patologiaData.id)
          .eq('id', reviewId)
          .maybeSingle();

        if (reviewError) {
          console.error('Error fetching review:', reviewError);
          throw new Error('Errore nel caricamento della recensione');
        }

        if (!reviewData) {
          console.error('No review found with ID:', reviewId);
          throw new Error('Recensione non trovata');
        }

        console.log('Found review:', reviewData);
        return reviewData;
      } catch (error) {
        console.error('Error in review query:', error);
        throw error;
      }
    }
  });

  if (error) {
    toast.error("Recensione non trovata");
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Recensione non trovata</h1>
          <p className="text-text-light">
            La recensione che stai cercando non esiste o potrebbe essere stata rimossa.
          </p>
          {condition && (
            <a 
              href={`/patologia/${condition}`}
              className="text-primary hover:underline inline-block mt-4"
            >
              ← Torna a {condition}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 lg:order-2">
          <ReviewContent
            title={review.title}
            condition={review.PATOLOGIE?.Patologia.toLowerCase() || ''}
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
          />
        </div>
      </div>
    </div>
  );
}