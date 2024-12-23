import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { ReviewsGrid } from "@/components/reviews/ReviewsGrid";
import { ReviewsPagination } from "@/components/reviews/ReviewsPagination";
import { ReviewsDisclaimer } from "@/components/reviews/ReviewsDisclaimer";

const REVIEWS_PER_PAGE = 20;

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', currentPage, REVIEWS_PER_PAGE],
    queryFn: async () => {
      try {
        console.log('Starting reviews fetch for page:', currentPage);
        
        // First get total count of approved reviews
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        if (countError) {
          console.error('Error getting count:', countError);
          throw countError;
        }

        console.log('Total approved reviews:', totalCount);

        // Calculate pagination range
        const from = (currentPage - 1) * REVIEWS_PER_PAGE;
        const to = from + REVIEWS_PER_PAGE - 1;

        console.log(`Fetching reviews from ${from} to ${to}`);

        // Then get paginated approved reviews
        const { data: reviews, error } = await supabase
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
            created_at,
            status,
            users (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews:', reviews);
        
        if (!reviews || reviews.length === 0) {
          console.log('No reviews found or empty response');
        }

        return {
          reviews: reviews || [],
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / REVIEWS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    },
    retry: 1,
    meta: {
      onError: () => {
        toast.error("Errore nel caricamento delle recensioni");
      }
    }
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  if (error) {
    console.error('Error in reviews query:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
            <p className="text-red-500">Si è verificato un errore nel caricamento delle recensioni.</p>
          </div>
          <div className="col-span-4">
            {/* Space for banners */}
          </div>
        </div>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  console.log('Rendering Reviews component with:', { 
    reviewsCount: reviews.length, 
    totalPages, 
    isLoading 
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
          
          <ReviewsGrid reviews={reviews} isLoading={isLoading} />
          
          <ReviewsPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <ReviewsDisclaimer />
        </div>
        
        <div className="col-span-4">
          {/* Space for banners */}
        </div>
      </div>
    </div>
  );
};

export default Reviews;