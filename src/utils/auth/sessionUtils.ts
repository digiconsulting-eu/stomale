
import { supabase } from "@/integrations/supabase/client";

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    
    if (data.session) {
      console.log('Session refreshed successfully');
      return true;
    }
    
    return false;
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
    
    // If session expires in less than 5 minutes, refresh it
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
