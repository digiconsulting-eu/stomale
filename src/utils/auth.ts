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

export const loginWithEmailPassword = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000);
  
  try {
    console.log('Starting login process for:', email);
    
    await supabase.auth.signOut({ scope: 'local' });
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
        }, 18000);
      })
    ]);
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    console.log('Login successful:', data?.user?.email);
    return { data, error: null };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
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

export const resetAuthClient = async () => {
  try {
    console.log('Resetting auth client state...');
    
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('last-login-attempt');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.trim().split("=")[0];
      if (cookieName.includes("sb-") || cookieName.includes("supabase")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    await supabase.auth.signOut({ scope: 'local' });
    
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error in resetAuthClient:', error);
    return false;
  }
};

export const checkForCorruptedState = async (): Promise<boolean> => {
  const sessionResult = await supabase.auth.getSession();
  const localStorageToken = localStorage.getItem('stomale-auth');
  const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (localLoggedIn && !sessionResult.data.session) {
    console.warn('Detected corrupted auth state: localStorage says logged in but no session exists');
    return true;
  }
  
  if (localStorageToken && !sessionResult.data.session) {
    console.warn('Detected potential auth state corruption: token exists but no session');
    return true;
  }
  
  return false;
};
