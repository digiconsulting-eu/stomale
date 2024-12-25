import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { ReviewsGrid } from "@/components/reviews/ReviewsGrid";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const REVIEWS_PER_PAGE = 20;

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', currentPage, REVIEWS_PER_PAGE],
    queryFn: async () => {
      console.log('Starting reviews fetch for page:', currentPage);
      try {
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
            users (
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
    },
    meta: {
      onError: () => {
        toast.error("Errore nel caricamento delle recensioni");
      }
    }
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  // Function to get visible page numbers
  const getVisiblePages = () => {
    const delta = 1; // Reduced from 2 to 1 to show fewer numbers
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        i >= currentPage - delta && 
        i <= currentPage + delta
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

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
          <ReviewsGrid reviews={reviews} isLoading={isLoading} />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12 mb-16">
            <Pagination>
              <PaginationContent className="gap-1 items-center">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} bg-white hover:bg-gray-50 px-3`}
                  >
                    Precedente
                  </PaginationPrevious>
                </PaginationItem>
                
                {getVisiblePages().map((pageNum, i) => (
                  <PaginationItem key={i}>
                    {pageNum === '...' ? (
                      <span className="px-2 py-2 text-gray-500">...</span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(Number(pageNum))}
                        isActive={currentPage === pageNum}
                        className={`${
                          currentPage === pageNum 
                            ? 'bg-primary text-white hover:bg-primary/90' 
                            : 'bg-white hover:bg-gray-50'
                        } min-w-[40px] h-10 flex items-center justify-center`}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} bg-white hover:bg-gray-50 px-3`}
                  >
                    Successiva
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="mt-16 bg-white rounded-lg p-6 text-sm text-text-light">
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