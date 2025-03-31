
import { supabase } from "@/integrations/supabase/client";

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
