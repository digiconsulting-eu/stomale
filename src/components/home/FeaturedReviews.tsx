
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
            likes_count: typeof review.likes_count === 'number' ? review.likes_count : 0,
            PATOLOGIE: review.PATOLOGIE || { id: 0, Patologia: 'Sconosciuta' }
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
    console.log('Refetching latest reviews on FeaturedReviews component mount');
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return (
      <div className="text-center text-red-500">
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
  );
};
