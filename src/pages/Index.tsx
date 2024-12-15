import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setPageTitle, getDefaultTitle } from "@/utils/pageTitle";

export default function Index() {
  useEffect(() => {
    setPageTitle(getDefaultTitle());
  }, []);

  const { data: latestReviews, error } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Index: Starting to fetch latest reviews...');
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
        console.error('Index: Error fetching reviews:', error);
        throw error;
      }

      console.log('Index: Successfully fetched reviews:', data);
      return data;
    }
  });

  if (error) {
    console.error('Index: Error in reviews query:', error);
  }

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
          <div className="flex justify-center gap-4">
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
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p>Si è verificato un errore nel caricamento delle recensioni.</p>
            <p className="text-sm mt-2">Dettagli: {error.message}</p>
          </div>
        ) : !latestReviews || latestReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Non ci sono ancora recensioni.</p>
          </div>
        ) : (
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
        )}
      </section>

      <div className="mt-12 bg-white rounded-lg p-6 text-sm text-text-light">
        <p className="mb-4">
          Su StoMale.info puoi leggere le esperienze di utenti che hanno o hanno avuto a che fare con diverse patologie. 
          Puoi leggere le loro esperienze, commentarle o fare domande e scoprire quali sintomi hanno o come si stanno curando.
        </p>
        <p className="mb-4">
          Gli utenti scrivono recensioni basate sulla propria esperienza personale e sotto diagnosi e consiglio medico, 
          questo sito quindi NON è inteso per consulenza medica, diagnosi o trattamento e NON deve in nessun caso 
          sostituirsi a un consulto medico, una visita specialistica o altro.
        </p>
        <p>
          StoMale.info e DigiConsulting non si assumono responsabilità sulla libera interpretazione del contenuto scritto da altri utenti. 
          E' doveroso contattare il proprio medico e/o specialista per la diagnosi di malattie e per la prescrizione e assunzione di farmaci.
        </p>
      </div>
    </div>
  );
}