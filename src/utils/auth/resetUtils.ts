
import { supabase } from "@/integrations/supabase/client";

export const resetAuthClient = async () => {
  try {
    console.log('Resetting auth client state...');
    
    // Remove the wasLoggedIn flag to prevent incorrect logout messages
    localStorage.removeItem('wasLoggedIn');
    
    // Clear local storage items
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('last-login-attempt');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginPageActive');
    
    // IMPORTANT: Don't remove redirect prevention flags during reset
    // Let the components that set them handle removal
    
    // Clear Supabase cookies
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.trim().split("=")[0];
      if (cookieName.includes("sb-") || cookieName.includes("supabase")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Sign out but don't refresh the page automatically
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
    }
    
    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('Auth client reset complete');
    
    // Return success
    return true;
  } catch (error) {
    console.error('Error in resetAuthClient:', error);
    // Don't reload automatically, just return the error status
    return false;
  }
};

export const checkForCorruptedState = async (): Promise<boolean> => {
  try {
    const { data: sessionResult, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error);
      return true; // If we can't check the session, consider it corrupted
    }
    
    const localStorageToken = localStorage.getItem('stomale-auth');
    const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';
    
    // Check for state inconsistencies
    if (localLoggedIn && !sessionResult.session) {
      console.warn('Detected corrupted auth state: localStorage says logged in but no session exists', {
        hasSession: !!sessionResult.session,
        localLoggedIn
      });
      return true;
    }
    
    if (localStorageToken && !sessionResult.session) {
      console.warn('Detected potential auth state corruption: token exists but no session');
      return true;
    }
    
    // If wasLoggedIn is true but we don't have a session, this could also indicate corruption
    if (wasLoggedIn && !sessionResult.session) {
      console.warn('Detected potential auth state corruption: wasLoggedIn flag is set but no session exists');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for corrupted state:', error);
    return true; // If there's an error, assume state is corrupted
  }
};
