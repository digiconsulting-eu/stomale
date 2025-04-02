
import { supabase } from "@/integrations/supabase/client";

export const useSessionCheck = () => {
  // Check if user is already logged in before logging in
  // Only used when explicitly called, not automatically
  const checkExistingSession = async (noAutoRedirect: boolean = false) => {
    try {
      // Don't perform automatic session checks if noAutoRedirect is true
      if (noAutoRedirect) {
        console.log("Skipping automatic session check on login page");
        return false;
      }
      
      // Use a more robust session check with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{data: {session: null}}>((resolve) => {
        setTimeout(() => resolve({ data: { session: null } }), 3000);
      });
      
      // Use Promise.race with careful error handling
      const result = await Promise.race([sessionPromise, timeoutPromise])
        .catch(() => ({ data: { session: null } }));
        
      // Extract session data safely
      const session = result?.data?.session;
      
      // Only consider fully valid sessions with both an ID and email
      if (session && session.user && 
          session.user.id && session.user.email && 
          session.access_token) {
        
        console.log("Valid session found:", session.user.email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in session check:", error);
      return false;
    }
  };

  return {
    checkExistingSession
  };
};
