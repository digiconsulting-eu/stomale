import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthSession = () => {
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        toast.error("Errore nel caricamento della sessione");
        throw error;
      }
      return session;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};