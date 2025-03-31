
import { supabase, resetSupabaseClient } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const loginWithEmailPassword = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);
  
  try {
    console.log('Starting login process for:', email);
    
    // Reset the client before login to ensure clean state
    await resetSupabaseClient();
    
    // Add a small delay to ensure client is reset
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    // Add a small delay after successful login to ensure session is properly set
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
