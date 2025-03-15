
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthSession = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        console.log('Fetching auth session...');
        // Force refresh the session first
        await supabase.auth.refreshSession();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast.error("Errore nel caricamento della sessione");
          throw error;
        }
        
        console.log('Session fetched:', session ? 'User is logged in' : 'No active session');
        return session;
      } catch (error) {
        console.error('Error in useAuthSession:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    onError: (error) => {
      console.error('Session query error:', error);
      queryClient.setQueryData(['auth-session'], null);
    }
  });
};
