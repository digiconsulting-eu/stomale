import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { CommentSection } from "@/components/CommentSection";
import { ReviewStats } from "@/components/ReviewStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const conditionName = capitalizeFirstLetter(condition || '');

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", condition, title],
    queryFn: async () => {
      try {
        console.log('Fetching review for:', { condition, title });
        
        // First get the pathology ID
        const { data: patologiaData, error: patologiaError } = await supabase
          .from('PATOLOGIE')
          .select('id')
          .eq('Patologia', condition?.toUpperCase())
          .single();

        if (patologiaError) {
          console.error('Error fetching patologia:', patologiaError);
          throw new Error('Patologia non trovata');
        }
        
        if (!patologiaData) {
          console.error('No patologia found for:', condition);
          throw new Error('Patologia non trovata');
        }

        console.log('Found patologia:', patologiaData);

        // Then get the review using the pathology ID
        const { data: reviewData, error: reviewError } = await supabase
          .from('RECENSIONI')
          .select(`
            *,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('Patologia', patologiaData.id)
          .eq('Titolo', decodeURIComponent(title || ''))
          .maybeSingle();

        if (reviewError) {
          console.error('Error fetching review:', reviewError);
          throw new Error('Errore nel caricamento della recensione');
        }

        if (!reviewData) {
          console.error('No review found for:', { patologiaId: patologiaData.id, title });
          throw new Error('Recensione non trovata');
        }

        console.log('Found review:', reviewData);
        return reviewData;
      } catch (error) {
        console.error('Error in review query:', error);
        throw error;
      }
    },
    retry: false
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
          <Link 
            to={`/patologia/${condition}`}
            className="text-primary hover:underline inline-block mt-4"
          >
            ← Torna a {conditionName}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="md:col-span-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Recensione non trovata</h1>
          <p className="text-text-light">
            La recensione che stai cercando non esiste o potrebbe essere stata rimossa.
          </p>
          <Link 
            to={`/patologia/${condition}`}
            className="text-primary hover:underline inline-block mt-4"
          >
            ← Torna a {conditionName}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-6">
        <Link 
          to={`/patologia/${condition}`}
          className="text-primary hover:underline"
        >
          ← Torna a {conditionName}
        </Link>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="sticky top-24 space-y-6">
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

        <div className="md:col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {review.Titolo || `Esperienza con ${conditionName}`}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary" className="px-4 py-1.5">
              <Link 
                to={`/patologia/${condition}`}
                className="hover:underline"
              >
                {conditionName}
              </Link>
            </Badge>
            <div className="flex items-center text-text-light">
              <Calendar size={14} className="mr-1" />
              <span className="text-sm">{review.Data}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
            <p className="whitespace-pre-wrap mb-6">{review.Sintomi}</p>

            <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
            <p className="whitespace-pre-wrap mb-8">{review.Esperienza}</p>
          </div>

          <CommentSection reviewId={review.id} />
        </div>
      </div>
    </div>
  );
}