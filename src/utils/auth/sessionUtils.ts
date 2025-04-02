
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const refreshSession = async () => {
  try {
    console.log('Attempting to refresh session...');
    const startTime = Date.now();
    
    // Create a promise that resolves after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session refresh timed out')), 8000);
    });
    
    // Create the actual refresh promise
    const refreshPromise = supabase.auth.refreshSession();
    
    // Race between the refresh and timeout
    const { data, error } = await Promise.race([
      refreshPromise,
      timeoutPromise.then(() => {
        throw new Error('Session refresh timed out');
      })
    ]) as any;
    
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    
    if (data.session) {
      const elapsedTime = Date.now() - startTime;
      console.log(`Session refreshed successfully in ${elapsedTime}ms`);
      
      // Immediately update localStorage to reflect logged in state
      localStorage.setItem('isLoggedIn', 'true');
      
      // Check if user is admin and update local storage accordingly
      if (data.session.user?.email) {
        try {
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', data.session.user.email);
          
          const isAdmin = Array.isArray(adminData) && adminData.length > 0;
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        } catch (e) {
          console.error('Error checking admin status after refresh:', e);
        }
      }
      
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
    if (!data.session) {
      console.log('No session found during health check');
      return false;
    }
    
    const expiresAt = data.session.expires_at;
    if (!expiresAt) {
      console.log('Session missing expiration time');
      return false;
    }
    
    // If session expires in less than 5 minutes, refresh it
    const expirationTime = expiresAt * 1000;
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeToExpiration = expirationTime - currentTime;
    
    console.log(`Session expires in ${Math.floor(timeToExpiration / 1000)} seconds`);
    
    if (timeToExpiration < fiveMinutesInMs) {
      console.log('Token expiring soon, refreshing session...');
      return await refreshSession();
    }
    
    // Session is healthy and not about to expire
    return true;
  } catch (error) {
    console.error('Error in checkSessionHealth:', error);
    return false;
  }
};

// Add a new function to stabilize session before navigation
export const ensureSessionHealthBeforeNavigation = async () => {
  console.log('Ensuring session health before navigation');
  
  // First check localStorage for faster response
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    console.log('Not logged in according to localStorage, no need to check session');
    return false;
  }
  
  try {
    // Check if we have a session and it's valid
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found despite localStorage indicating logged in');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      toast.error("Sessione scaduta, effettua nuovamente l'accesso");
      return false;
    }
    
    // If session expires in less than 30 seconds, refresh it
    const expiresAt = session.expires_at;
    if (!expiresAt) return false;
    
    const expirationTime = expiresAt * 1000;
    const currentTime = Date.now();
    const timeToExpiration = expirationTime - currentTime;
    
    if (timeToExpiration < 30000) {
      console.log('Session expiring very soon, refreshing before navigation');
      return await refreshSession();
    }
    
    // Session is healthy
    return true;
  } catch (error) {
    console.error('Error checking session before navigation:', error);
    return false;
  }
};
