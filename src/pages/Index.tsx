import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/utils/pageTitle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  useEffect(() => {
    setPageTitle("Stomale.info | Recensioni su malattie, sintomi e patologie");
  }, []);

  const { data: latestReviews = [], isLoading, isError } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch...');
      try {
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
            users (
              username
            ),
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews:', data);
        
        if (!data) {
          console.log('No reviews data returned');
          return [];
        }

        return data.map(review => ({
          ...review,
          username: review.users?.username || 'Anonimo',
          condition: review.PATOLOGIE?.Patologia || 'Patologia non specificata'
        }));
      } catch (error) {
        console.error('Error in query execution:', error);
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error("Errore nel caricamento delle recensioni");
      }
    }
  });

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-primary">
            Recensioni in evidenza
          </h2>
          <Link to="/recensioni">
            <Button variant="outline">
              Mostra tutte le recensioni
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Si è verificato un errore nel caricamento delle recensioni.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestReviews.length > 0 ? (
              latestReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={review.title}
                  condition={review.condition}
                  experience={review.experience}
                  diagnosisDifficulty={review.diagnosis_difficulty}
                  symptomsSeverity={review.symptoms_severity}
                  hasMedication={review.has_medication}
                  medicationEffectiveness={review.medication_effectiveness}
                  healingPossibility={review.healing_possibility}
                  socialDiscomfort={review.social_discomfort}
                  username={review.username}
                />
              ))
            ) : (
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