
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { detectAppleDevice } from "@/utils/browserDetection";
import { transformReviewData } from "@/utils/reviewDataUtils";
import { ReviewsLoader } from "./ReviewsLoader";
import { EmptyReviews } from "./EmptyReviews";
import { HomeFeaturedGrid } from "./HomeFeaturedGrid";

export const FeaturedReviews = () => {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [forceRefreshKey, setForceRefreshKey] = useState(0);

  useEffect(() => {
    const isApple = detectAppleDevice();
    console.log('Device detection result:', isApple);
    setIsAppleDevice(isApple);
    
    if (isApple) {
      setForceRefreshKey(prev => prev + 1);
    }
  }, []);

  const { data: latestReviews, isLoading, isError, refetch } = useQuery({
    queryKey: ['latestReviews', forceRefreshKey],
    queryFn: async () => {
      console.log('Starting reviews fetch for homepage...');
      setHasAttemptedFetch(true);
      
      try {
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

        console.log('Fetched reviews count:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.log('No reviews found in database');
          return [];
        }
        
        return transformReviewData(data);
      } catch (error) {
        console.error('Error in homepage reviews fetch:', error);
        toast.error("Errore nel caricamento delle recensioni");
        throw error;
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: isAppleDevice ? 5 : 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  useEffect(() => {
    const loadReviews = async () => {
      try {
        console.log('FeaturedReviews requesting refetch, isAppleDevice:', isAppleDevice);
        await refetch();
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    };

    loadReviews();

    if (isAppleDevice) {
      console.log('Apple device detected - using enhanced compatibility mode');
      
      const timers = [
        setTimeout(() => {
          console.log('First additional fetch attempt for Apple device');
          setForceRefreshKey(prev => prev + 1);
        }, 1000),
        
        setTimeout(() => {
          console.log('Second additional fetch attempt for Apple device');
          setForceRefreshKey(prev => prev + 1);
        }, 3000),
        
        setTimeout(() => {
          console.log('Third additional fetch attempt for Apple device');
          setForceRefreshKey(prev => prev + 1);
        }, 6000)
      ];
      
      return () => timers.forEach(clearTimeout);
    }
  }, [isAppleDevice, refetch]);

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
          <ReviewsLoader />
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            <p>Si è verificato un errore nel caricamento delle recensioni.</p>
            <button 
              onClick={() => setForceRefreshKey(prev => prev + 1)} 
              className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Riprova
            </button>
          </div>
        ) : !latestReviews || latestReviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          <HomeFeaturedGrid reviews={latestReviews} refreshKey={forceRefreshKey} />
        )}
      </div>
    </section>
  );
};
