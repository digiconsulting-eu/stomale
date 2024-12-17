import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: latestReviews = [], isLoading, isError } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      try {
        console.log('Fetching latest reviews...');
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            experience,
            diagnosis_difficulty,
            symptoms_severity,
            has_medication,
            medication_effectiveness,
            healing_possibility,
            social_discomfort,
            created_at,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Successfully fetched reviews:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    gcTime: 1000 * 60 * 30, // 30 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isError) {
    toast.error("Errore nel caricamento delle recensioni");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Condividi la tua esperienza
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Aiuta altri pazienti condividendo la tua storia
        </p>
        <SearchBar />
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-primary mb-8">
          Ultime Recensioni
        </h2>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                title={review.title}
                condition={review.PATOLOGIE?.Patologia || ''}
                experience={review.experience}
                diagnosisDifficulty={review.diagnosis_difficulty}
                symptomsSeverity={review.symptoms_severity}
                hasMedication={review.has_medication}
                medicationEffectiveness={review.medication_effectiveness}
                healingPossibility={review.healing_possibility}
                socialDiscomfort={review.social_discomfort}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}