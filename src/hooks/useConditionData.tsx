
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseReview, Review } from "@/types/review";
import { useState, useEffect } from "react";

export const useConditionData = () => {
  const { condition } = useParams();
  const [retryCount, setRetryCount] = useState(0);
  
  console.log("useConditionData hook called with condition:", condition);

  // Fetch condition data
  const { data: patologiaData, isLoading: patologiaLoading } = useQuery({
    queryKey: ["patologia", condition, retryCount],
    queryFn: async () => {
      if (!condition) {
        console.error("No condition provided to useConditionData");
        return null;
      }
      
      console.log("Fetching patologia data for:", condition);
      
      // Refresh the session first
      try {
        await supabase.auth.refreshSession();
      } catch (error) {
        console.error("Failed to refresh session:", error);
        // Continue anyway
      }
      
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('id, Patologia')
        .eq('Patologia', condition.toUpperCase())
        .single();
      
      if (error) {
        console.error('Error fetching condition data:', error);
        throw error;
      }
      
      console.log("Patologia data fetched:", data);
      return data;
    },
    enabled: !!condition,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Fetch reviews for the condition
  const { data: reviewsData, isLoading: reviewsLoading, refetch } = useQuery({
    queryKey: ["reviews", patologiaData?.id, retryCount],
    enabled: !!patologiaData?.id,
    queryFn: async () => {
      console.log('Fetching reviews for condition:', patologiaData?.id);
      
      try {
        // Refresh session first
        try {
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error("Failed to refresh session:", error);
          // Continue anyway
        }
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('condition_id', patologiaData.id)
          .eq('status', 'approved');
        
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
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Function to retry fetching data
  const retryFetch = () => {
    console.log("Retrying data fetch...");
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Map database reviews to UI-friendly format
  const reviews: Review[] = reviewsData?.map(review => {
    // Calculate a composite rating for the review based on various metrics
    const rating = review.diagnosis_difficulty !== undefined && 
                  review.symptoms_severity !== undefined && 
                  review.social_discomfort !== undefined ?
      Math.round((5 - (review.diagnosis_difficulty || 3) + 
                 5 - (review.symptoms_severity || 3) + 
                 (review.has_medication ? (review.medication_effectiveness || 3) : 3) + 
                 (review.healing_possibility || 3) + 
                 (5 - (review.social_discomfort || 3))) / 5) : 3;
    
    return {
      id: review.id,
      title: review.title,
      condition: condition || '',
      symptoms: review.symptoms || '',
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
      comments_count: review.comments_count,
      rating // Add calculated rating
    };
  }) || [];

  return {
    condition,
    patologiaData,
    reviews,
    isLoading: patologiaLoading || reviewsLoading,
    retryFetch
  };
};
