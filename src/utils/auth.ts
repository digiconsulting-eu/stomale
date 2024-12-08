import { supabase } from "@/integrations/supabase/client";

export const checkUserExists = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });
  
  return !error || error.status === 400;
};