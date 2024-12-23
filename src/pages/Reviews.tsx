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
        console.log('Fetching reviews page:', currentPage);
        
        const { count: totalCount, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        if (countError) throw countError;

        const { data, error } = await supabase
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
            users!reviews_user_id_fkey (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE - 1);

        if (error) throw error;

        return {
          reviews: data || [],
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / REVIEWS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in reviews query:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Ultime Recensioni"));
  }, []);

  if (error) {
    toast.error("Errore nel caricamento delle recensioni");
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
