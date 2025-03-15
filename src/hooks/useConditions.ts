
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

interface UseConditionsProps {
  page?: number;
  limit?: number;
  searchTerm?: string;
  letter?: string;
  forceRefresh?: number;
}

export const useConditions = ({ 
  page = 1, 
  limit = 30,
  searchTerm = "",
  letter = "",
  forceRefresh = 0
}: UseConditionsProps = {}) => {
  const offset = (page - 1) * limit;

  const result = useQuery({
    queryKey: ['conditions', page, limit, searchTerm, letter, forceRefresh],
    queryFn: async () => {
      console.log('Fetching conditions with pagination:', { page, limit, offset, searchTerm, letter, forceRefresh });
      
      try {
        // Ensure we have a fresh session to prevent caching issues
        await supabase.auth.refreshSession();
        
        // Log query parameters for debugging
        console.log('Conditions search term:', searchTerm ? `"${searchTerm}"` : 'empty');
        console.log('Conditions letter filter:', letter ? `"${letter}"` : 'empty');
        
        // Build the query with special care for compatibility
        let query = supabase
          .from('PATOLOGIE')
          .select('id, Patologia', { count: 'exact' });

        // Apply search filter if present - using ilike for case-insensitive matching
        if (searchTerm && searchTerm.trim() !== '') {
          console.log('Applying search filter with term:', searchTerm);
          query = query.ilike('Patologia', `%${searchTerm}%`);
        } 
        // Only apply letter filter if no search term and letter is not "TUTTE"
        else if (letter && letter !== "TUTTE") {
          console.log('Applying letter filter with letter:', letter);
          // Use ilike for better compatibility
          query = query.ilike('Patologia', `${letter}%`);
        }

        // Execute the query with explicit pagination
        const { data, count, error } = await query
          .order('Patologia')
          .range(offset, offset + limit - 1);

        // Log detailed results for debugging
        console.log('Conditions query result:', { dataLength: data?.length, count, error });

        if (error) {
          console.error('Error fetching conditions:', error);
          toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
          throw error;
        }

        // Deep validation of data for better compatibility
        const validatedData = data ? data.map(item => ({
          id: typeof item.id === 'number' ? item.id : 0,
          Patologia: typeof item.Patologia === 'string' ? item.Patologia : 'Sconosciuta'
        })) : [];

        console.log('Fetched and validated conditions count:', validatedData.length);
        if (validatedData.length > 0) {
          console.log('First condition example:', validatedData[0]);
        } else {
          console.log('No conditions found');
        }
        
        // Ensure we return valid data structures even if response is empty
        return {
          conditions: validatedData,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.error('Error in conditions query:', error);
        toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
        throw error;
      }
    },
    staleTime: 0, // No caching for compatibility
    retry: 5, // Increase retries for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Cap retry delay at 10 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  // Listen for auth state changes and refetch when user logs in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in useConditions:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Refreshing conditions after auth change");
        result.refetch();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [result]);

  return result;
};
