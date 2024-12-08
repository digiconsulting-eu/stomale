import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewStats } from "@/components/ReviewStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const decodedTitle = decodeURIComponent(title || '');
  // Remove leading/trailing hyphens and normalize internal spaces
  const normalizedTitle = decodedTitle
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .replace(/-/g, ' ')       // Replace remaining hyphens with spaces
    .replace(/\s+/g, ' ')     // Normalize multiple spaces to single space
    .trim();                  // Remove leading/trailing spaces
  
  const normalizedCondition = condition?.toUpperCase().replace(/-/g, ' ');

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", normalizedCondition, normalizedTitle],
    queryFn: async () => {
      try {
        const { data: patologiaData, error: patologiaError } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .eq('Patologia', normalizedCondition)
          .single();

        if (patologiaError) throw new Error('Patologia non trovata');
        if (!patologiaData) throw new Error('Patologia non trovata');

        const { data: reviews, error: reviewError } = await supabase
          .from('Reviews')
          .select(`
            *,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('condition_id', patologiaData.id);

        if (reviewError) throw new Error('Errore nel caricamento della recensione');

        const matchingReview = reviews?.find(r => 
          r.title.toLowerCase().trim() === normalizedTitle.toLowerCase().trim()
        );

        if (!matchingReview) throw new Error('Recensione non trovata');

        return matchingReview;
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
          <a 
            href={`/patologia/${condition}`}
            className="text-primary hover:underline inline-block mt-4"
          >
            ← Torna a {condition}
          </a>
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
            condition={condition || ''}
            date={review.created_at}
            symptoms={review.symptoms}
            experience={review.experience}
            diagnosisDifficulty={Number(review["diagnosis_difficulty"])}
            symptomSeverity={Number(review["symptoms_severity"])}
            hasMedication={review["has_medication"]}
            medicationEffectiveness={Number(review["medication_effectiveness"])}
            healingPossibility={Number(review["healing_possibility"])}
            socialDiscomfort={Number(review["social_discomfort"])}
            reviewId={review.id}
          />
        </div>

        <div className="lg:col-span-4 lg:order-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Valutazioni</h2>
              <ReviewStats
                diagnosisDifficulty={Number(review["diagnosis_difficulty"])}
                symptomSeverity={Number(review["symptoms_severity"])}
                hasMedication={review["has_medication"]}
                medicationEffectiveness={Number(review["medication_effectiveness"])}
                healingPossibility={Number(review["healing_possibility"])}
                socialDiscomfort={Number(review["social_discomfort"])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
