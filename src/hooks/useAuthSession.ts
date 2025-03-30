
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { refreshSession } from "@/utils/auth";

export const useAuthSession = () => {
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        // First try to refresh session to ensure we have a valid token
        await refreshSession();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast.error("Errore nel caricamento della sessione");
          throw error;
        }
        
        if (!session) {
          console.log('No active session found');
          return null;
        }
        
        // Check if token is about to expire (within 10 minutes)
        if (session.expires_at) {
          const expirationTime = session.expires_at * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const tenMinutesInMs = 10 * 60 * 1000;
          
          if (expirationTime - currentTime < tenMinutesInMs) {
            console.log('Token expiring soon in useAuthSession, refreshing...');
            await refreshSession();
            // Get the updated session after refresh
            const { data: refreshData } = await supabase.auth.getSession();
            return refreshData.session;
          }
        }
        
        return session;
      } catch (error) {
        console.error('Error in useAuthSession:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
};
