import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewContent } from "@/components/review/ReviewContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { condition, title } = useParams();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ["review", condition, title],
    queryFn: async () => {
      try {
        if (!condition || !title) {
          throw new Error('Parametri mancanti');
        }

        console.log('Fetching review with condition:', condition, 'and title:', title);
        
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

        // Create a URL-friendly version of the review title for comparison
        const decodedTitle = decodeURIComponent(title);
        const normalizedSearchTitle = decodedTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Then get the review using the condition ID and normalized title
        const { data: reviewsData, error: reviewError } = await supabase
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
          .eq('condition_id', patologiaData.id);

        if (reviewError) {
          console.error('Error fetching review:', reviewError);
          throw new Error('Errore nel caricamento della recensione');
        }

        // Find the review with matching normalized title
        const matchingReview = reviewsData?.find(review => {
          const reviewTitleSlug = review.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return reviewTitleSlug === normalizedSearchTitle;
        });

        if (!matchingReview) {
          console.error('No review found with title:', title);
          throw new Error('Recensione non trovata');
        }

        console.log('Found review:', matchingReview);
        return matchingReview;
      } catch (error) {
        console.error('Error in review query:', error);
        throw error;
      }
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
            username={review.users?.username}
          />
        </div>
      </div>
    </div>
  );
}