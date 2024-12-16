import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";

export default function Index() {
  const { data: latestReviews, isLoading, error } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
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

      console.log('Fetched reviews:', data);
      return data;
    },
    meta: {
      errorMessage: "Errore nel caricamento delle recensioni"
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Condividi la tua esperienza con una malattia
          </h1>
          <p className="text-lg text-text-light mb-8">
            Aiuta altre persone a capire meglio la loro condizione condividendo la tua storia.
            Le tue esperienze possono fare la differenza.
          </p>
          <SearchBar />
          <div className="flex justify-center gap-4 mt-8">
            <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-hover">
              <Link to="/nuova-recensione">Condividi la tua Storia</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-hover">
              <Link to="/cerca-patologia">Cerca una Patologia</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Ultime Recensioni</h2>
          <Button asChild variant="outline">
            <Link to="/recensioni">Vedi tutte</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestReviews?.map((review) => (
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
      </section>
    </div>
  );
}