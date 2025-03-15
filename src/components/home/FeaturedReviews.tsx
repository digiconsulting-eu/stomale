
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
        
        // Enhanced data sanitization for Safari/macOS
        // Convert all data to a serialized then parsed form to eliminate any non-serializable properties
        const jsonString = JSON.stringify(data);
        const parsedData = JSON.parse(jsonString);
        
        // Now sanitize each field individually 
        const safeData = parsedData.map((review) => {
          if (!review || typeof review !== 'object') {
            console.warn('Skipping invalid review object', review);
            return null;
          }
          
          try {
            // Log each review to help debug Safari issues
            console.log('Processing review for Safari compatibility:', review?.id);
            
            const sanitizedReview = {
              id: Number(review.id) || 0,
              title: String(review.title || 'Titolo non disponibile'),
              experience: String(review.experience || 'Contenuto non disponibile'),
              username: String(review.username || 'Anonimo'),
              created_at: String(review.created_at || new Date().toISOString()),
              condition_id: Number(review.condition_id) || 0,
              comments_count: Number(review.comments_count) || 0,
              likes_count: Number(review.likes_count) || 0,
              PATOLOGIE: review.PATOLOGIE ? {
                id: Number(review.PATOLOGIE.id) || 0,
                Patologia: String(review.PATOLOGIE.Patologia || 'Sconosciuta')
              } : { id: 0, Patologia: 'Sconosciuta' }
            };
            
            return sanitizedReview;
          } catch (sanitizeError) {
            console.error('Error sanitizing review data:', sanitizeError, review);
            return null;
          }
        }).filter(Boolean); // Remove any null entries
        
        console.log('Sanitized data ready for Safari/macOS:', safeData);
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

  // Force a refetch on mount with browser detection
  useEffect(() => {
    console.log('FeaturedReviews component mounted - forcing refetch');
    
    // Detect Safari browser (also works for detecting macOS Chrome)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                     (navigator.userAgent.includes('Mac') && navigator.userAgent.includes('Chrome'));
    
    if (isSafari) {
      console.log('Safari/macOS detected - using enhanced compatibility mode');
    }
    
    const fetchData = async () => {
      try {
        await refetch();
        console.log('Refetch completed');
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    };

    fetchData();

    // Add additional fetch attempts for Safari
    const timer = setTimeout(() => {
      if (!hasAttemptedFetch || isSafari) {
        console.log('Backup fetch after timeout, Safari compatibility mode:', isSafari);
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

  // Additional validation before rendering to handle Safari/macOS edge cases
  const hasValidReviews = Array.isArray(latestReviews) && latestReviews.length > 0 && 
    latestReviews.every(review => review && typeof review === 'object' && typeof review.id === 'number');

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
        ) : hasValidReviews ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latestReviews.map((review) => {
              // Extra validation before rendering each card
              if (!review || typeof review !== 'object' || typeof review.id !== 'number') {
                console.error('Invalid review object skipped:', review);
                return null;
              }
              
              // Ensure all required props are valid
              const safeTitle = typeof review.title === 'string' ? review.title : 'Titolo non disponibile';
              const safeExperience = typeof review.experience === 'string' ? review.experience : 'Contenuto non disponibile';
              const safeUsername = typeof review.username === 'string' ? review.username : 'Anonimo';
              const safeDate = typeof review.created_at === 'string' ? review.created_at : new Date().toISOString();
              const safeCondition = review.PATOLOGIE && typeof review.PATOLOGIE.Patologia === 'string' 
                ? review.PATOLOGIE.Patologia 
                : 'Patologia non specificata';
              
              return (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={safeTitle}
                  condition={safeCondition}
                  date={new Date(safeDate).toLocaleDateString()}
                  preview={safeExperience ? (safeExperience.slice(0, 150) + '...') : 'Nessun contenuto disponibile'}
                  username={safeUsername}
                  likesCount={typeof review.likes_count === 'number' ? review.likes_count : 0}
                  commentsCount={typeof review.comments_count === 'number' ? review.comments_count : 0}
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
