import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { ReviewsContent } from "@/components/reviews/ReviewsContent";

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
          throw countError;
        }

        console.log('Total approved reviews count:', totalCount);

        // Calculate the range for pagination
        const from = (currentPage - 1) * REVIEWS_PER_PAGE;
        const to = from + REVIEWS_PER_PAGE - 1;

        // Then get paginated reviews with user data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            users!inner (
              username
            ),
            PATOLOGIE!inner (
              id,
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw reviewsError;
        }

        console.log('Raw reviews data:', reviewsData);
        
        if (!reviewsData) {
          console.log('No reviews data returned');
          return {
            reviews: [],
            totalCount: 0,
            totalPages: 0
          };
        }

        // Transform the data to match the expected format
        const transformedReviews = reviewsData.map(review => {
          console.log('Processing review:', review.id, 'User data:', review.users);
          return {
            ...review,
            username: review.users?.username
          };
        });

        console.log('Transformed reviews:', transformedReviews);

        return {
          reviews: transformedReviews,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / REVIEWS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error("Errore nel caricamento delle recensioni");
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  if (error) {
    console.error('Error loading reviews:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento delle recensioni.
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