
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { ReviewsContent } from "@/components/reviews/ReviewsContent";
import { DatabaseReview } from "@/types/review";

const REVIEWS_PER_PAGE = 20;

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', currentPage, REVIEWS_PER_PAGE],
    queryFn: async () => {
      console.log('Starting reviews fetch for page:', currentPage);
      try {
        // First get total count of approved reviews
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        if (countError) {
          console.error('Error getting count:', countError);
          toast.error("Errore nel caricamento delle recensioni. Riprova tra qualche secondo.");
          throw countError;
        }

        // Log total count of approved reviews
        console.log('Numero totale di recensioni approvate:', totalCount);

        if (totalCount === 0) {
          return {
            reviews: [],
            totalCount: 0,
            totalPages: 0
          };
        }

        // Calculate the range for pagination
        const from = (currentPage - 1) * REVIEWS_PER_PAGE;
        const to = from + REVIEWS_PER_PAGE - 1;

        // Then get paginated reviews
        const { data: reviewsData, error: reviewsError } = await supabase
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
            username,
            created_at,
            symptoms,
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
          .range(from, to);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          toast.error("Errore nel caricamento delle recensioni. Riprova tra qualche secondo.");
          throw reviewsError;
        }

        console.log('Raw reviews data:', reviewsData);
        
        if (!reviewsData || reviewsData.length === 0) {
          console.log('No reviews data returned');
          return {
            reviews: [],
            totalCount: 0,
            totalPages: 0
          };
        }

        // Transform the data to ensure username is properly handled
        const transformedReviews = reviewsData.map(review => ({
          ...review,
          username: review.username || 'Anonimo'
        })) as DatabaseReview[];

        console.log('Transformed reviews:', transformedReviews);

        return {
          reviews: transformedReviews,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / REVIEWS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in reviews query:', error);
        toast.error("Errore nel caricamento delle recensioni. Riprova tra qualche secondo.");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Cap retry delay at 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  if (error) {
    console.error('Error loading reviews:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento delle recensioni. Riprova tra qualche secondo.
        </div>
      </div>
    );
  }

  // Add a specific case for when there are no reviews
  if (!isLoading && (!data?.reviews || data.reviews.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          <p className="text-lg mb-4">Non ci sono ancora recensioni disponibili.</p>
          <p>Sii il primo a condividere la tua esperienza!</p>
        </div>
      </div>
    );
  }

  return (
    <ReviewsContent
      reviews={data?.reviews || []}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={data?.totalPages || 0}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default Reviews;
