import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
  });

  if (isError) {
    toast.error("Errore nel caricamento delle recensioni");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div 
          className="relative mb-8 min-h-[300px] flex items-center justify-center rounded-lg shadow-lg"
          style={{
            backgroundImage: 'url("/lovable-uploads/f6c39c72-c0f1-48d1-bd7c-8e14f1185fb6.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Condividi la tua esperienza
            </h1>
            <p className="text-xl mb-8">
              Aiuta altri pazienti condividendo la tua storia
            </p>
            <SearchBar />
            
            <div className="flex justify-center gap-4 mt-8">
              <Link to="/nuova-recensione">
                <Button className="bg-primary hover:bg-primary-hover text-white px-6 py-2">
                  Racconta la tua Esperienza
                </Button>
              </Link>
              <Link to="/cerca-patologia">
                <Button variant="secondary" className="px-6 py-2">
                  Cerca Patologia
                </Button>
              </Link>
            </div>
          </div>
        </div>
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

            {latestReviews.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Non ci sono ancora recensioni.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}