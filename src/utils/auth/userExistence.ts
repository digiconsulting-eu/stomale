
import { supabase } from "@/integrations/supabase/client";

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
