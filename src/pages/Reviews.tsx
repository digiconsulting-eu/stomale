import { useEffect } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 20;

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      try {
        console.log('Fetching reviews...');
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
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Raw reviews response:', data);
        console.log('Number of reviews fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast.error("Errore nel caricamento delle recensioni");
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
        <p className="text-red-500">Si è verificato un errore nel caricamento delle recensioni.</p>
      </div>
    );
  }

  const totalPages = Math.ceil((reviews?.length || 0) / reviewsPerPage);
  const getCurrentPageReviews = () => {
    if (!reviews) return [];
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return reviews.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getCurrentPageReviews().map((review) => (
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

        {reviews?.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Non ci sono ancora recensioni.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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
};

export default Reviews;
