
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
      
      try {
        // Ensure we have a fresh session to prevent caching issues
        await supabase.auth.refreshSession();
        
        // Log query parameters for debugging
        console.log('Search term:', searchTerm ? `"${searchTerm}"` : 'empty');
        console.log('Letter filter:', letter ? `"${letter}"` : 'empty');
        
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
          // Use UPPER on both sides to ensure case-insensitive matching
          // This is more compatible across different Postgres setups
          query = query.ilike('Patologia', `${letter}%`);
        }

        const { data, count, error } = await query
          .order('Patologia')
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching conditions:', error);
          toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
          throw error;
        }

        console.log('Fetched conditions count:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('First condition example:', data[0]);
        } else {
          console.log('No conditions found');
        }
        
        console.log('Total count from DB:', count);

        // Ensure we return valid data structures even if response is empty
        return {
          conditions: data || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.error('Error in conditions query:', error);
        toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
        throw error;
      }
    },
    staleTime: 0, // No caching, always fetch fresh data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Cap retry delay at 30 seconds
    refetchOnWindowFocus: true, // Refetch on window focus to ensure up-to-date data
    refetchOnReconnect: true, // Refetch when reconnecting
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
      }
    }
  });
};
