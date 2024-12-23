import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['conditions', page, limit, searchTerm, letter],
    queryFn: async () => {
      console.log('Fetching conditions with pagination:', { page, limit, offset, searchTerm, letter });
      
      let query = supabase
        .from('PATOLOGIE')
        .select('id, Patologia', { count: 'exact' });

      // Applica i filtri se presenti
      if (searchTerm) {
        query = query.ilike('Patologia', `%${searchTerm}%`);
      }
      
      if (letter && letter !== "TUTTE") {
        query = query.ilike('Patologia', `${letter}%`);
      }

      // Applica paginazione
      const { data, count, error } = await query
        .order('Patologia')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        conditions: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    staleTime: 1000 * 60 * 5, // Cache per 5 minuti
  });

  return {
    conditions: data?.conditions || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error
  };
};