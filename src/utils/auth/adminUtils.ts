
import { supabase } from "@/integrations/supabase/client";

export const checkIsAdmin = async (email: string): Promise<boolean> => {
  try {
    console.log('Checking admin status for:', email);

    // Add retries for more reliability
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        const { data, error } = await supabase
          .from('admin')
          .select('email')
          .eq('email', email)
          .single();
          
        if (error) {
          console.error(`Admin check attempt ${attempts} failed:`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200 * attempts));
            continue;
          }
          return false;
        }
        
        const isAdmin = !!data;
        console.log('Admin check successful, user is admin:', isAdmin);
        return isAdmin;
      } catch (error) {
        console.error(`Error in admin check attempt ${attempts}:`, error);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));
          continue;
        }
        return false;
      }
    }
    
    console.error('Admin check failed after all retry attempts');
    return false;
  } catch (error) {
    console.error('Unexpected error in admin check:', error);
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
