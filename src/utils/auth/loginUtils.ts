
import { supabase, resetSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const loginWithEmailPassword = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 60000); // Increased timeout to 60 seconds for slow server response
  
  try {
    console.log('Starting login process for:', email);
    
    // Reset the client before login to ensure clean state
    await resetSupabaseClient();
    
    // Add a small delay to ensure client is reset
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ensure redirect prevention flags are set
    sessionStorage.setItem('onLoginPage', 'true');
    localStorage.setItem('preventRedirects', 'true');
    localStorage.setItem('loginPageActive', Date.now().toString());
    
    // Clear any previous auth state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    
    // CRITICAL FIX: Generate a unique login attempt ID to track this specific attempt
    const loginAttemptId = `login-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('currentLoginAttempt', loginAttemptId);
    
    // Use straightforward login approach with proper error handling
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    // CRITICAL: Check if this is still the current login attempt
    const currentAttemptId = localStorage.getItem('currentLoginAttempt');
    if (currentAttemptId !== loginAttemptId) {
      console.log('Another login attempt was initiated, discarding results of this one');
      throw new Error('Login superseded by another attempt');
    }
    
    // Add a larger delay after successful login to ensure session is properly set
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // CRITICAL: Verify session was actually created
    const { data: sessionCheck } = await supabase.auth.getSession();
    
    if (!sessionCheck.session) {
      console.error('Session verification failed after login');
      throw new Error('Non è stato possibile creare una sessione valida');
    }
    
    console.log('Login successful:', data?.user?.email);
    
    // Store authentication details IMMEDIATELY after successful login
    localStorage.setItem('isLoggedIn', 'true');
    
    // CRITICAL FIX: Pre-check admin status right after login
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('email')
        .eq('email', email)
        .single();
      
      const isAdmin = !!adminData && !adminError;
      console.log('Pre-checking admin status:', isAdmin);
      
      // Set admin status explicitly to avoid ambiguity
      if (isAdmin) {
        localStorage.setItem('isAdmin', 'true');
        console.log('SET isAdmin = true in localStorage');
      } else {
        localStorage.setItem('isAdmin', 'false');
        console.log('SET isAdmin = false in localStorage');
      }
      
      localStorage.setItem('userEmail', email);
    } catch (adminError) {
      console.error('Error pre-checking admin status:', adminError);
      // Default to non-admin if check fails
      localStorage.setItem('isAdmin', 'false');
      console.log('SET isAdmin = false in localStorage (after error)');
    }
    
    // Clear the login attempt tracker
    localStorage.removeItem('currentLoginAttempt');
    
    return { data, error: null };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Clear login attempt tracker on error too
    localStorage.removeItem('currentLoginAttempt');
    
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
  } finally {
    // Important: Don't remove prevention flags here - let the login handlers manage this
    // based on success/failure
  }
};
