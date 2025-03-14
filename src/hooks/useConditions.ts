
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
      console.log('Fetching conditions with pagination (Safari compatible):', { page, limit, offset, searchTerm, letter });
      
      try {
        // Ensure we have a fresh session to prevent caching issues on Safari
        await supabase.auth.refreshSession();
        
        // Log query parameters for debugging
        console.log('Safari-compatible search:', searchTerm ? `"${searchTerm}"` : 'empty');
        console.log('Safari-compatible letter filter:', letter ? `"${letter}"` : 'empty');
        
        // First, check if the connection is working at all
        const { error: testError } = await supabase.from('PATOLOGIE').select('count', { count: 'exact', head: true });
        
        if (testError) {
          console.error('Error testing connection to Supabase:', testError);
          throw new Error('Connessione al database fallita: ' + testError.message);
        }
        
        // Build the query with special care for Safari compatibility
        let query = supabase
          .from('PATOLOGIE')
          .select('id, Patologia', { count: 'exact' });

        // Apply search filter if present - using ilike for case-insensitive matching
        if (searchTerm && searchTerm.trim() !== '') {
          console.log('Applying search filter for Safari with term:', searchTerm);
          query = query.ilike('Patologia', `%${searchTerm}%`);
        } 
        // Only apply letter filter if no search term and letter is not "TUTTE"
        else if (letter && letter !== "TUTTE") {
          console.log('Applying letter filter for Safari with letter:', letter);
          // Use ilike for better Safari compatibility
          query = query.ilike('Patologia', `${letter}%`);
        }

        // Execute the query with explicit pagination
        const { data, count, error } = await query
          .order('Patologia')
          .range(offset, offset + limit - 1);

        // Log detailed results for debugging
        console.log('Safari-compatible query result:', { dataLength: data?.length, count, error });

        if (error) {
          console.error('Error fetching conditions on Safari:', error);
          toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
          throw error;
        }

        // Deep validation of data for Safari
        const validatedData = data ? data.map(item => ({
          id: typeof item.id === 'number' ? item.id : 0,
          Patologia: typeof item.Patologia === 'string' ? item.Patologia : 'Sconosciuta'
        })) : [];

        console.log('Fetched and validated conditions for Safari count:', validatedData.length);
        if (validatedData.length > 0) {
          console.log('First condition example for Safari:', validatedData[0]);
        } else {
          console.log('No conditions found for Safari');
        }
        
        // Ensure we return valid data structures even if response is empty
        return {
          conditions: validatedData,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.error('Error in conditions query for Safari:', error);
        toast.error("Errore nel caricamento delle patologie. Riprova tra qualche secondo.");
        throw error;
      }
    },
    staleTime: 0, // No caching for Safari compatibility
    retry: 5, // Increase retries for Safari
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Cap retry delay at 10 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
};
