
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FeaturedReviews = () => {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const { data: latestReviews, isLoading, isError, refetch } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch for homepage...');
      setHasAttemptedFetch(true);
      
      try {
        // Force a session refresh to clear any cached data
        await supabase.auth.refreshSession();
        
        console.log('Fetching latest approved reviews for homepage...');
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

        console.log('Fetched reviews for homepage:', data?.length || 0, data);
        
        if (!data || data.length === 0) {
          console.log('No reviews found in database');
          return [];
        }
        
        // Process the data to ensure all fields are properly formatted with explicit type checking
        // for better cross-browser compatibility, especially on Safari/macOS
        const safeData = data.map(review => {
          // Log each review to help debug Safari issues
          console.log('Processing review for display:', review?.id);
          
          return {
            id: typeof review.id === 'number' && !isNaN(review.id) ? review.id : 0,
            title: review.title && typeof review.title === 'string' ? review.title : 'Titolo non disponibile',
            experience: review.experience && typeof review.experience === 'string' ? review.experience : 'Contenuto non disponibile',
            username: review.username && typeof review.username === 'string' ? review.username : 'Anonimo',
            created_at: review.created_at && typeof review.created_at === 'string' ? review.created_at : new Date().toISOString(),
            condition_id: typeof review.condition_id === 'number' && !isNaN(review.condition_id) ? review.condition_id : 0,
            comments_count: typeof review.comments_count === 'number' && !isNaN(review.comments_count) ? review.comments_count : 0,
            likes_count: typeof review.likes_count === 'number' && !isNaN(review.likes_count) ? review.likes_count : 0,
            PATOLOGIE: review.PATOLOGIE ? {
              id: typeof review.PATOLOGIE.id === 'number' && !isNaN(review.PATOLOGIE.id) ? review.PATOLOGIE.id : 0,
              Patologia: review.PATOLOGIE.Patologia && typeof review.PATOLOGIE.Patologia === 'string' ? 
                review.PATOLOGIE.Patologia : 'Sconosciuta'
            } : { id: 0, Patologia: 'Sconosciuta' }
          };
        });
        
        console.log('Processed data ready for Safari/macOS:', safeData);
        return safeData;
      } catch (error) {
        console.error('Error in homepage reviews fetch:', error);
        toast.error("Errore nel caricamento delle recensioni");
        throw error;
      }
    },
    staleTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Force a refetch on mount
  useEffect(() => {
    console.log('FeaturedReviews component mounted - forcing refetch');
    
    // Clear any stale query cache that might be causing issues
    const fetchData = async () => {
      try {
        await refetch();
        console.log('Refetch completed');
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    };

    fetchData();

    // Add a redundant fetch after a small delay
    const timer = setTimeout(() => {
      if (!hasAttemptedFetch) {
        console.log('Backup fetch after timeout');
        fetchData();
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Si è verificato un errore nel caricamento delle recensioni.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
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
        ) : latestReviews && Array.isArray(latestReviews) && latestReviews.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latestReviews.map((review) => {
              if (!review || typeof review !== 'object') {
                console.error('Invalid review object:', review);
                return null;
              }
              return (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={review.title}
                  condition={review.PATOLOGIE?.Patologia || 'Patologia non specificata'}
                  date={new Date(review.created_at).toLocaleDateString()}
                  preview={review.experience ? (review.experience.slice(0, 150) + '...') : 'Nessun contenuto disponibile'}
                  username={review.username || 'Anonimo'}
                  likesCount={review.likes_count || 0}
                  commentsCount={review.comments_count || 0}
                />
              );
            })}
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
  );
};
