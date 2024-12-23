import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/utils/pageTitle";

export default function Reviews() {
  useEffect(() => {
    setPageTitle("Recensioni | Stomale.info");
  }, []);

  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      console.log('Fetching reviews...');
      try {
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
            users!reviews_user_id_fkey (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews:', data);
        return data || [];
      } catch (error) {
        console.error('Error in query execution:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isError) {
    toast.error("Errore nel caricamento delle recensioni");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Recensioni
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Esperienze condivise dalla nostra community
        </p>
        <SearchBar />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[300px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={review.title}
                  condition={review.PATOLOGIE?.Patologia || ''}
                  experience={review.experience}
                  diagnosisDifficulty={review.diagnosis_difficulty}
                  symptomsSeverity={review.symptoms_severity}
                  hasMedication={review.has_medication}
                  medicationEffectiveness={review.medication_effectiveness}
                  healingPossibility={review.healing_possibility}
                  socialDiscomfort={review.social_discomfort}
                  username={review.users?.username}
                />
              ))}

              {reviews.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Non ci sono ancora recensioni.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="col-span-4">
          {/* Space reserved for banners */}
        </div>
      </div>
    </div>
  );
}