
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const loginWithEmailPassword = async (email: string, password: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000);
  
  try {
    console.log('Starting login process for:', email);
    
    // Ensure we start with a clean state
    await supabase.auth.signOut({ scope: 'local' });
    
    // Wait a moment for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Apply a timeout with a race condition
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
