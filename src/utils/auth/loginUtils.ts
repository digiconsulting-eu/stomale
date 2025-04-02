
import { supabase, resetSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const loginWithEmailPassword = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 30000); // Increased timeout to prevent rate limits
  
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
    
    // Add a larger delay after successful login to ensure session is properly set
    // CRITICAL FIX: Longer delay to ensure session establishment
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
  } finally {
    // Important: Don't remove prevention flags here - let the login handlers manage this
    // based on success/failure
  }
};
