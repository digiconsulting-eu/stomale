
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type User = Database["public"]["Tables"]["users"]["Row"];

export const checkUserExists = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user existence:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error in checkUserExists:', error);
    return false;
  }
};

// Improved login function with better error handling, timeout and abort control
export const loginWithEmailPassword = async (email: string, password: string) => {
  // Create an AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000); // 15 second timeout
  
  try {
    console.log('Starting login process for:', email);
    
    // First clear any existing session to prevent conflicts
    await supabase.auth.signOut({ scope: 'local' });
    
    // Then attempt the new login with timeout handling
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({
        email,
        password
      }),
      new Promise<{data: null, error: Error}>((_, reject) => {
        setTimeout(() => {
          reject({
            data: null,
            error: new Error('Login timeout - La richiesta ha impiegato troppo tempo.')
          });
        }, 12000); // Slightly shorter than the controller timeout
      })
    ]);
    
    // Clear the timeout as the request completed
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    console.log('Login successful:', data?.user?.email);
    return { data, error: null };
  } catch (error: any) {
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // If aborted due to timeout
    if (error.name === 'AbortError' || controller.signal.aborted || 
        error.message?.includes('timeout') || error.message?.includes('impiegato troppo tempo')) {
      console.error('Login request timed out');
      return { 
        data: null, 
        error: new Error('La richiesta di login è scaduta. Riprova.') 
      };
    }
    
    console.error('Login error:', error);
    return { data: null, error };
  }
};

// Check if user is admin
export const checkIsAdmin = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('admin')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
};

// Get admin emails list for verification
export const getAdminEmails = async () => {
  try {
    const { data, error } = await supabase
      .from('admin')
      .select('email');
      
    if (error) {
      console.error('Error fetching admin emails:', error);
      return [];
    }
    
    return data?.map(admin => admin.email) || [];
  } catch (error) {
    console.error('Error in admin emails fetch:', error);
    return [];
  }
};

// Refresh session token if needed
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      // If we can't refresh, we should notify the user to login again
      if (error.message.includes('expired')) {
        toast.error("La tua sessione è scaduta. Effettua nuovamente il login.", {
          duration: 5000,
        });
        // Force logout after a delay to allow the toast to be seen
        setTimeout(() => {
          supabase.auth.signOut();
          window.location.href = '/';
        }, 2000);
      }
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

// Check session health and refresh if needed
export const checkSessionHealth = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    // Check if token is about to expire (within 5 minutes)
    const expiresAt = data.session.expires_at;
    if (!expiresAt) return false;
    
    const expirationTime = expiresAt * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    // If token expires in less than 5 minutes, refresh it
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

// Force client reset - use this when the state gets corrupted
export const resetAuthClient = async () => {
  try {
    console.log('Resetting auth client state...');
    
    // Force clear local storage auth data
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('last-login-attempt');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    
    // Clear any session cookies that might exist
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.trim().split("=")[0];
      if (cookieName.includes("sb-") || cookieName.includes("supabase")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Sign out to clear any session state
    await supabase.auth.signOut({ scope: 'local' });
    
    // Force reload the page to get a fresh client
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error in resetAuthClient:', error);
    return false;
  }
};

// Check if the login state is possibly corrupted
export const checkForCorruptedState = async (): Promise<boolean> => {
  const sessionResult = await supabase.auth.getSession();
  const localStorageToken = localStorage.getItem('stomale-auth');
  const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // If localStorage says we're logged in but we have no session, the state is corrupted
  if (localLoggedIn && !sessionResult.data.session) {
    console.warn('Detected corrupted auth state: localStorage says logged in but no session exists');
    return true;
  }
  
  // If we have local storage auth data but no session, the state might be corrupted
  if (localStorageToken && !sessionResult.data.session) {
    console.warn('Detected potential auth state corruption: token exists but no session');
    return true;
  }
  
  return false;
};

