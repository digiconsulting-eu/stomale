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

const REVIEWS_PER_PAGE = 20;

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', currentPage, REVIEWS_PER_PAGE],
    queryFn: async () => {
      try {
        console.log('Fetching reviews page:', currentPage);
        
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        if (countError) throw countError;

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
            users!reviews_user_id_fkey (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE - 1);

        if (error) throw error;

        return {
          reviews: data || [],
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / REVIEWS_PER_PAGE)
        };
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
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          </div>
          <div className="col-span-4">
            {/* Space for banners */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error("Errore nel caricamento delle recensioni");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
            <p className="text-red-500">Si è verificato un errore nel caricamento delle recensioni.</p>
          </div>
          <div className="col-span-4">
            {/* Space for banners */}
          </div>
        </div>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {reviews.map((review) => (
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
                username={review.users?.username}
              />
            ))}

            {reviews.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">Non ci sono ancora recensioni.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} cursor-pointer`}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer hover:bg-primary/10"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} cursor-pointer`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
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
        
        <div className="col-span-4">
          {/* Space for banners */}
        </div>
      </div>
    </div>
  );
};

export default Reviews;