
import { supabase } from "@/integrations/supabase/client";

export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    console.log('Starting login for:', email);
    
    // Clear any previous auth state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    
    // Simple login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    if (!data.session || !data.user) {
      throw new Error('Sessione non valida dopo il login');
    }
    
    console.log('Login successful:', data.user.email);
    
    // Check admin status
    const { data: adminData } = await supabase
      .from('admin')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    const isAdmin = !!adminData;
    console.log('Admin status:', isAdmin);
    
    // Set auth state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', String(isAdmin));
    localStorage.setItem('userEmail', email);
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Login failed:', error);
    
    // Clear auth state on error
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    
    if (error.message?.includes('Invalid login credentials')) {
      throw new Error('Credenziali non valide');
    } else if (error.message?.includes('Email not confirmed')) {
      throw new Error('Email non confermata');
    }
    
    throw error;
  }
};
