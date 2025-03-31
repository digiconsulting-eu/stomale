import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, resetSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHomeReviews = () => {
  const { data: latestReviews, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch for homepage...');
      
      try {
        // Try to fetch reviews with current client
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

        // If there's an error, try resetting the client and retry once
        if (error) {
          console.error('Initial fetch error, attempting reset:', error);
          await resetSupabaseClient();
          
          // Retry fetch after reset
          const { data: retryData, error: retryError } = await supabase
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
            
          if (retryError) {
            console.error('Retry fetch error:', retryError);
            throw retryError;
          }
          
          return retryData || [];
        }

        console.log('Fetched reviews count:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in homepage reviews fetch:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Force a refetch on mount
  useEffect(() => {
    console.log('Index component mounted, forcing refetch of reviews');
    refetch();
  }, [refetch]);

  // Prepare schema data for SEO (keep this part the same)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StoMale.info",
    "url": "https://stomale.info/",
    "description": "Recensioni e testimonianze su malattie, sintomi e patologie scritte da pazienti per aiutare altri pazienti.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://stomale.info/cerca-patologia?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StoMale.info",
    "url": "https://stomale.info",
    "logo": "https://stomale.info/logo.png",
    "sameAs": [],
    "description": "Piattaforma di condivisione di esperienze e recensioni su patologie e malattie in italiano."
  };

  // Reviews aggregate schema
  const reviewsAggregateSchema = latestReviews && latestReviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": latestReviews.slice(0, 10).map((review, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Review",
        "name": review.title,
        "author": {
          "@type": "Person",
          "name": review.username
        },
        "datePublished": new Date(review.created_at).toISOString(),
        "reviewBody": review.experience?.substring(0, 150) + "...",
        "itemReviewed": {
          "@type": "MedicalCondition",
          "name": review.PATOLOGIE?.Patologia
        }
      }
    }))
  } : null;

  return {
    latestReviews,
    isLoading,
    isError,
    error,
    refetch,
    structuredData,
    organizationSchema,
    reviewsAggregateSchema
  };
};
