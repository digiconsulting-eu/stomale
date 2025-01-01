import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle, setMetaDescription, getReviewMetaDescription } from "@/utils/pageTitle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ReviewDetail = () => {
  const { slug, condition } = useParams();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', slug, condition],
    queryFn: async () => {
      console.log('Fetching review with slug:', slug);
      console.log('Condition:', condition);
      
      // Decodifica il titolo dallo slug e ripristina gli apostrofi
      const decodedTitle = decodeURIComponent(slug || '')
        .split('-')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Decoded title:', decodedTitle);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('status', 'approved')
        .eq('PATOLOGIE.Patologia', decodeURIComponent(condition || '').toUpperCase())
        .or(`title.ilike.%${decodedTitle}%,title.ilike.%${decodedTitle.replace(/[']/g, '')}%`)
        .maybeSingle();

      if (error) {
        console.error('Error fetching review:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No review found with these parameters');
        return null;
      }

      console.log('Fetched review:', data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Si è verificato un errore nel caricamento della recensione.
          </AlertDescription>
        </Alert>
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La recensione richiesta non è stata trovata.
          </AlertDescription>
        </Alert>
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