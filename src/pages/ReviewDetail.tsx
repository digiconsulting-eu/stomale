import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentSection } from "@/components/CommentSection";
import { ReviewContent } from "@/components/review/ReviewContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const decodedTitle = decodeURIComponent(title || '');
  const normalizedTitle = decodedTitle.replace(/^-+|-+$/g, '').replace(/-/g, ' ');
  const normalizedCondition = condition?.toUpperCase().replace(/-/g, ' ');

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", normalizedCondition, normalizedTitle],
    queryFn: async () => {
      try {
        console.log('Searching for condition:', normalizedCondition);
        
        const { data: patologiaData, error: patologiaError } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .eq('Patologia', normalizedCondition)
          .single();

        if (patologiaError) {
          console.error('Patologia error:', patologiaError);
          throw new Error('Patologia non trovata');
        }
        if (!patologiaData) throw new Error('Patologia non trovata');

        console.log('Found patologia:', patologiaData);

        const { data: reviewData, error: reviewError } = await supabase
          .from('RECENSIONI')
          .select(`
            *,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('Patologia', patologiaData.id)
          .ilike('Titolo', normalizedTitle)
          .single();

        if (reviewError) {
          console.error('Review error:', reviewError);
          throw new Error('Errore nel caricamento della recensione');
        }
        if (!reviewData) throw new Error('Recensione non trovata');

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
            title={review.Titolo}
            condition={condition || ''}
            date={review.Data}
            symptoms={review.Sintomi}
            experience={review.Esperienza}
            diagnosisDifficulty={Number(review["Difficoltà diagnosi"])}
            symptomSeverity={Number(review["Fastidio sintomi"])}
            hasMedication={review["Cura Farmacologica"]}
            medicationEffectiveness={Number(review["Efficacia farmaci"])}
            healingPossibility={Number(review["Possibilità guarigione"])}
            socialDiscomfort={Number(review["Disagio sociale"])}
          />
          <CommentSection reviewId={review.id} />
        </div>

        <div className="lg:col-span-4 lg:order-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Valutazioni</h2>
              <ReviewStats
                diagnosisDifficulty={Number(review["Difficoltà diagnosi"])}
                symptomSeverity={Number(review["Fastidio sintomi"])}
                hasMedication={review["Cura Farmacologica"]}
                medicationEffectiveness={Number(review["Efficacia farmaci"])}
                healingPossibility={Number(review["Possibilità guarigione"])}
                socialDiscomfort={Number(review["Disagio sociale"])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}