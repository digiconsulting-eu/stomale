
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
import { ArrowRight, CheckCircle, Activity, MessageSquare } from "lucide-react";

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
        return data || [];
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with a gradient background */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg-pills.png')] bg-repeat opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
              Come stai <span className="text-primary">oggi?</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Leggi e condividi esperienze reali su malattie, sintomi e trattamenti
            </p>
            
            <div className="w-full max-w-2xl mx-auto mb-12 relative">
              <SearchBar />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2">Esperienze Verificate</h3>
                  <p className="text-gray-600 text-sm text-center">Recensioni reali da persone che hanno vissuto i sintomi</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col items-center">
                  <Activity className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2">Scopri Trattamenti</h3>
                  <p className="text-gray-600 text-sm text-center">Trova cosa ha funzionato per altre persone</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2">Condividi la Tua Storia</h3>
                  <p className="text-gray-600 text-sm text-center">Aiuta altri pazienti condividendo la tua esperienza</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <Link to="/nuova-recensione">
                <Button size="lg" className="bg-primary text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  Racconta la tua esperienza <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,218.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recensioni recenti</h2>
              <p className="text-gray-600 mt-2">Esperienze condivise da altri pazienti</p>
            </div>
            <Link to="/recensioni" className="group">
              <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                Tutte le recensioni
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[320px]">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestReviews && latestReviews.length > 0 ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
                  Scrivi la prima recensione
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link to="/cerca-patologia" className="inline-block">
              <Button variant="outline" size="lg" className="border-2 border-gray-200 rounded-full px-8">
                Esplora tutte le patologie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Perché Stomale.info?</h2>
            <p className="mt-2 text-blue-100">Una comunità per supportarsi a vicenda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-100">Recensioni condivise</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3200+</div>
              <div className="text-blue-100">Utenti registrati</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">800+</div>
              <div className="text-blue-100">Patologie recensite</div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 py-6 text-lg font-medium shadow-lg">
                Unisciti alla nostra comunità
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
