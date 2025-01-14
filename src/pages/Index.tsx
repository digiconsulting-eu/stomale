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

  const { data: latestReviews, isLoading, isError } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch...');
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          username,
          created_at,
          condition_id,
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
      return data || [];
    }
  });

  if (isError) {
    console.error('Error loading reviews');
    toast.error("Errore nel caricamento delle recensioni");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento delle recensioni.
        </div>
      </div>
    );
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
        ) : latestReviews && latestReviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                title={review.title}
                condition={review.PATOLOGIE?.Patologia || 'Patologia non specificata'}
                date={new Date(review.created_at).toLocaleDateString()}
                preview={review.experience.slice(0, 200) + '...'}
                username={review.username || 'Anonimo'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Non ci sono ancora recensioni approvate.</p>
          </div>
        )}
      </section>
    </div>
  );
}