
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseReview, Review } from "@/types/review";

export const useConditionData = () => {
  const { condition } = useParams();

  // Fetch condition data
  const { data: patologiaData } = useQuery({
    queryKey: ["patologia", condition],
    queryFn: async () => {
      if (!condition) return null;
      
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('id, Patologia')
        .eq('Patologia', condition.toUpperCase())
        .single();
      
      if (error) {
        console.error('Error fetching condition data:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!condition
  });

  // Fetch reviews for the condition
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", patologiaData?.id],
    enabled: !!patologiaData?.id,
    queryFn: async () => {
      console.log('Fetching reviews for condition:', patologiaData?.id);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('condition_id', patologiaData.id);
        
        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }
        console.log('Fetched reviews:', data);
        return data as DatabaseReview[];
      } catch (error) {
        console.error('Error in review fetch:', error);
        throw error;
      }
    }
  });

  // Map database reviews to UI-friendly format
  const reviews: Review[] = reviewsData?.map(review => ({
    id: review.id,
    title: review.title,
    condition: condition || '',
    symptoms: review.symptoms || '', // Include symptoms in the mapping
    experience: review.experience,
    diagnosis_difficulty: review.diagnosis_difficulty,
    symptoms_severity: review.symptoms_severity,
    has_medication: review.has_medication,
    medication_effectiveness: review.medication_effectiveness,
    healing_possibility: review.healing_possibility,
    social_discomfort: review.social_discomfort,
    username: review.username || 'Anonimo',
    created_at: review.created_at,
    PATOLOGIE: review.PATOLOGIE,
    likes_count: review.likes_count,
    comments_count: review.comments_count
  })) || [];

  return {
    condition,
    patologiaData,
    reviews,
    isLoading: reviewsLoading
  };
};
