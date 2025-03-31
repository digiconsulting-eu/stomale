
import { supabase } from "@/integrations/supabase/client";

export const resetAuthClient = async () => {
  try {
    console.log('Resetting auth client state...');
    
    localStorage.removeItem('stomale-auth');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('last-login-attempt');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.trim().split("=")[0];
      if (cookieName.includes("sb-") || cookieName.includes("supabase")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    await supabase.auth.signOut({ scope: 'local' });
    
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error in resetAuthClient:', error);
    return false;
  }
};

export const checkForCorruptedState = async (): Promise<boolean> => {
  const sessionResult = await supabase.auth.getSession();
  const localStorageToken = localStorage.getItem('stomale-auth');
  const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (localLoggedIn && !sessionResult.data.session) {
    console.warn('Detected corrupted auth state: localStorage says logged in but no session exists');
    return true;
  }
  
  if (localStorageToken && !sessionResult.data.session) {
    console.warn('Detected potential auth state corruption: token exists but no session');
    return true;
  }
  
  return false;
};
