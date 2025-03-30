
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type User = Database["public"]["Tables"]["users"]["Row"];

export const checkUserExists = async (email: string) => {
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
    
    // Then attempt the new login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
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
    if (error.name === 'AbortError' || controller.signal.aborted) {
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
    // Force clear local storage auth data
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    
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
