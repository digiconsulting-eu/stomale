
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const refreshSession = async () => {
  try {
    const timeout = new Promise<{success: false}>((resolve) => {
      setTimeout(() => {
        resolve({success: false});
      }, 10000);
    });
    
    const refreshPromise = (async () => {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        if (error.message.includes('expired')) {
          toast.error("La tua sessione è scaduta. Effettua nuovamente il login.", {
            duration: 5000,
          });
        }
        return { success: false };
      }
      
      if (data.session) {
        console.log('Session refreshed successfully');
        return { success: true };
      }
      
      return { success: false };
    })();
    
    const result = await Promise.race([refreshPromise, timeout]);
    return result.success;
  } catch (error) {
    console.error('Unexpected error in refreshSession:', error);
    return false;
  }
};

export const checkSessionHealth = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    const expiresAt = data.session.expires_at;
    if (!expiresAt) return false;
    
    const expirationTime = expiresAt * 1000;
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    if (expirationTime - currentTime < fiveMinutesInMs) {
      console.log('Token expiring soon, refreshing session...');
      return await refreshSession();
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkSessionHealth:', error);
    return false;
  }
};
