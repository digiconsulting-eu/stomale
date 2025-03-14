
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
import { ArrowRight } from "lucide-react";

export default function Index() {
  useEffect(() => {
    setPageTitle("Stomale.info | Recensioni su malattie, sintomi e patologie");
  }, []);

  const { data: latestReviews, isLoading, isError, refetch } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch for homepage...');
      
      try {
        // Force a session refresh to clear any cached data
        await supabase.auth.refreshSession();
        
        console.log('Fetching latest approved reviews...');
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            experience,
            username,
            created_at,
            condition_id,
            likes_count,
            comments_count,
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

        console.log('Fetched reviews for homepage:', data?.length || 0);
        console.log('Review data sample:', data?.[0] || 'No reviews found');
        
        if (!data || data.length === 0) {
          console.log('No reviews found in database');
          return [];
        }
        
        // Ensure all data fields are properly formatted
        const processedData = data.map(review => {
          console.log('Processing review:', review.id, 'with condition:', review.PATOLOGIE);
          return {
            ...review,
            username: review.username || 'Anonimo',
            comments_count: typeof review.comments_count === 'number' ? review.comments_count : 0,
            likes_count: typeof review.likes_count === 'number' ? review.likes_count : 0
          };
        });
        
        return processedData;
      } catch (error) {
        console.error('Error in homepage reviews fetch:', error);
        toast.error("Errore nel caricamento delle recensioni");
        throw error;
      }
    },
    staleTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3
  });

  // Force a refetch on mount
  useEffect(() => {
    console.log('Refetching latest reviews on Index component mount');
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    console.error('Error loading reviews');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Si è verificato un errore nel caricamento delle recensioni.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section with gradient */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="absolute inset-0 z-0 opacity-10 bg-repeat">
          <div className="absolute w-full h-full bg-[url('/hero-bg-pills.png')] bg-repeat opacity-50"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fade-in">
              Condividi la tua esperienza
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Aiuta altri pazienti condividendo la tua storia e scopri le esperienze di chi ha vissuto la tua stessa condizione
            </p>
            
            <div className="w-full max-w-xl mx-auto mb-12">
              <SearchBar />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/nuova-recensione">
                <Button className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                  Scrivi una recensione
                </Button>
              </Link>
              <Link to="/cerca-patologia">
                <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 shadow-md hover:shadow-lg transition-all">
                  Esplora patologie
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-20 -mt-1">
          <path 
            fill="#f9fafb" 
            fillOpacity="1" 
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary relative">
              <span className="relative z-10">Recensioni in evidenza</span>
              <span className="absolute -bottom-2 left-0 w-12 h-1.5 bg-blue-200 rounded-full"></span>
            </h2>
            <Link to="/recensioni" className="group">
              <Button variant="outline" className="border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2">
                Tutte le recensioni
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[300px]">
                  <Skeleton className="h-5 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/4 mb-8" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestReviews && latestReviews.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {latestReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={review.title}
                  condition={review.PATOLOGIE?.Patologia || 'Patologia non specificata'}
                  date={new Date(review.created_at).toLocaleDateString()}
                  preview={review.experience.slice(0, 150) + '...'}
                  username={review.username || 'Anonimo'}
                  likesCount={review.likes_count || 0}
                  commentsCount={review.comments_count || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">Non ci sono ancora recensioni approvate.</p>
              <Link to="/nuova-recensione">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Scrivi la prima recensione
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
