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
import { fetchReviews } from "@/queries/reviewQueries";

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 20;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews
  });

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const getCurrentPageReviews = () => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return reviews.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <p>Caricamento recensioni...</p>
        ) : getCurrentPageReviews().map((review) => (
          <ReviewCard 
            key={review.id || `${review.title}-${review.date}`}
            id={review.id || `${review.title}-${review.date}`}
            title={review.title}
            condition={review.condition}
            experience={review.experience}
            date={review.date}
            username={review.username}
          />
        ))}
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