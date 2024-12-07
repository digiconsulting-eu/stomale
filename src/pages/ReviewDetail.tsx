import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewStats } from "@/components/ReviewStats";
import { CommentSection } from "@/components/CommentSection";
import { ReviewContent } from "@/components/review/ReviewContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const decodedTitle = decodeURIComponent(title || '');
  const normalizedTitle = decodedTitle.replace(/^-+|-+$/g, '').replace(/-/g, ' ');

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", condition, normalizedTitle],
    queryFn: async () => {
      try {
        const normalizedCondition = condition?.toUpperCase().replace(/-/g, ' ');
        
        const { data: patologiaData, error: patologiaError } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .eq('Patologia', normalizedCondition)
          .maybeSingle();

        if (patologiaError) throw new Error('Patologia non trovata');
        if (!patologiaData) throw new Error('Patologia non trovata');

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
          .limit(1);

        if (reviewError) throw new Error('Errore nel caricamento della recensione');
        if (!reviewData || reviewData.length === 0) throw new Error('Recensione non trovata');

        return reviewData[0];
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
      <div className="flex justify-between items-start mb-6">
        <a 
          href={`/patologia/${condition}`}
          className="text-primary hover:underline"
        >
          ← Torna a {condition}
        </a>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Content section - appears first on mobile */}
        <div className="lg:col-span-8 lg:order-2">
          <ReviewContent
            title={review.Titolo}
            condition={condition || ''}
            date={review.Data}
            symptoms={review.Sintomi}
            experience={review.Esperienza}
          />
          <CommentSection reviewId={review.id} />
        </div>

        {/* Stats section - appears second on mobile */}
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