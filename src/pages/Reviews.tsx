import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { ReviewsGrid } from "@/components/reviews/ReviewsGrid";
import { ReviewsPagination } from "@/components/reviews/ReviewsPagination";
import { useReviews } from "@/hooks/useReviews";

const REVIEWS_PER_PAGE = 20;

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useReviews(currentPage, REVIEWS_PER_PAGE);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  console.log('Reviews data:', data);
  console.log('Reviews loading:', isLoading);
  console.log('Reviews error:', error);

  if (error) {
    console.error('Error loading reviews:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Si è verificato un errore nel caricamento delle recensioni.</p>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Ultime Recensioni</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : (
          <>
            {reviews.length > 0 ? (
              <ReviewsGrid reviews={reviews} isLoading={isLoading} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Non ci sono ancora recensioni.</p>
              </div>
            )}
          </>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center my-8">
            <ReviewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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
    </div>
  );
};

export default Reviews;