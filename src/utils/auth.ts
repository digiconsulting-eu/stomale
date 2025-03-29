
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

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

// Improved login function with better error handling and no timeout
export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
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
      .single();
      
    if (error && error.code !== 'PGRST116') {
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
