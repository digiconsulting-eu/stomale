
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
        // Clear any stale Supabase client state
        await supabase.auth.refreshSession().catch(err => {
          console.log('Session refresh failed, continuing with request', err);
        });
        
        let query = supabase
          .from('PATOLOGIE')
          .select('id, Patologia', { count: 'exact' })
          .headers({
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          });

        // Apply search filter if present
        if (searchTerm && searchTerm.trim() !== '') {
          const normalizedSearchTerm = searchTerm.toLowerCase().trim();
          console.log('Searching for normalized term:', normalizedSearchTerm);
          
          // Simple but effective search
          query = query.ilike('Patologia', `%${normalizedSearchTerm}%`);
        } 
        // Only apply letter filter if no search term and letter is not "TUTTE"
        else if (letter && letter !== "TUTTE") {
          query = query.ilike('Patologia', `${letter}%`);
        }

        const { data, count, error } = await query
          .order('Patologia')
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching conditions:', error);
          throw error;
        }

        console.log('Total conditions count:', count);
        console.log('Fetched conditions:', data?.length || 0);

        return {
          conditions: data || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.error('Error fetching conditions:', error);
        toast.error("Errore nel caricamento delle patologie");
        throw error;
      }
    },
    staleTime: 0, // Disabilitiamo la cache per ottenere sempre dati freschi
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Cap retry delay at 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });
};
