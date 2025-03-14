
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseConditionsProps {
  page?: number;
  limit?: number;
  searchTerm?: string;
  letter?: string;
}

export const useConditions = ({ 
  page = 1, 
  limit = 30,
  searchTerm = "",
  letter = ""
}: UseConditionsProps = {}) => {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['conditions', page, limit, searchTerm, letter],
    queryFn: async () => {
      console.log('Fetching conditions with pagination:', { page, limit, offset, searchTerm, letter });
      
      // Add a small delay to prevent too many rapid requests when typing
      if (searchTerm) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      let query = supabase
        .from('PATOLOGIE')
        .select('id, Patologia', { count: 'exact' });

      // Apply search filter if present - optimize to use unaccent function
      if (searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        console.log('Searching for normalized term:', normalizedSearchTerm);
        
        // Use a more forgiving search with case insensitivity
        // This version doesn't rely on unaccent and is more permissive with partial matches
        query = query.or(`Patologia.ilike.%${normalizedSearchTerm}%,Patologia.ilike.%${normalizedSearchTerm.replace(/\s+/g, '%')}%`);
      } 
      // Only apply letter filter if no search term and letter is not "TUTTE"
      else if (letter && letter !== "TUTTE") {
        query = query.ilike('Patologia', `${letter}%`);
      }

      try {
        const { data, count, error } = await query
          .order('Patologia')
          .range(offset, offset + limit - 1);

        if (error) {
          // This code handles specific supabase errors
          if (error.code === 'PGRST116') {
            console.warn('Rate limit exceeded when fetching conditions');
            toast.error("Troppe richieste. Riprova tra qualche secondo.", {
              description: "Il server sta ricevendo troppe richieste."
            });
          } else {
            console.error('Error fetching conditions:', error);
            toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
          }
          throw error;
        }

        // Log the first few items for debugging
        if (data && data.length > 0) {
          console.log('First few conditions:', data.slice(0, 3));
        } else if (data && data.length === 0) {
          console.log('No conditions found with the provided filters:', { searchTerm, letter });
          
          // If no exact match is found with the original query, try a more flexible search
          if (searchTerm) {
            console.log('Attempting more flexible search for:', searchTerm);
            const { data: flexData, error: flexError } = await supabase
              .from('PATOLOGIE')
              .select('id, Patologia')
              .or(`Patologia.ilike.${searchTerm}%,Patologia.ilike.%${searchTerm}%`)
              .limit(10);
              
            if (!flexError && flexData && flexData.length > 0) {
              console.log('Found similar conditions with flexible search:', flexData);
            }
          }
        }
        
        console.log('Total conditions count:', count);

        return {
          conditions: data || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.error('Error in fetch conditions function:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Cap retry delay at 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch when reconnecting
    meta: {
      onError: (error: Error) => {
        console.error('Query error in useConditions:', error);
      }
    }
  });
};
