
import { useEffect } from "react";
import { toast } from "sonner";
import { checkClientHealth, resetSupabaseClient } from "@/integrations/supabase/client";
import { checkForCorruptedState, resetAuthClient } from "@/utils/auth";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export const useLoginInitialization = (setConnectionIssue: (value: boolean) => void) => {
  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Login"));
    
    // When the component mounts, check for corrupted state
    const checkAndCleanupState = async () => {
      // Check for corrupted state
      const isCorrupted = await checkForCorruptedState();
      if (isCorrupted) {
        console.log('Detected corrupted auth state, resetting...');
        toast.warning(
          "Rilevato stato di autenticazione non valido, ripristino in corso...",
          { duration: 3000 }
        );
        await resetAuthClient();
        return;
      }
      
      // Check if there was a previous login attempt that might have left 
      // the app in a broken state
      const lastLoginAttempt = localStorage.getItem('last-login-attempt');
      if (lastLoginAttempt) {
        const lastAttemptTime = parseInt(lastLoginAttempt, 10);
        const now = Date.now();
        
        // If the last attempt was more than 3 minutes ago, clear any stale state
        if (now - lastAttemptTime > 3 * 60 * 1000) {
          console.log('Found stale login attempt, resetting auth state');
          localStorage.removeItem('last-login-attempt');
          await resetAuthClient();
        }
      }
      
      // Check if Supabase is reachable - use direct fetch for more reliability
      const checkConnection = async () => {
        try {
          const isClientHealthy = await checkClientHealth();
          if (!isClientHealthy) {
            console.error('Supabase client health check failed');
            setConnectionIssue(true);
          } else {
            console.log('Supabase client health check passed');
            setConnectionIssue(false);
          }
        } catch (error) {
          console.error('Error checking client health:', error);
          setConnectionIssue(true);
        }
      };
      
      // First quick check
      await checkConnection();
      
      // If there's an issue, try resetting the client and check again after a short delay
      if (setConnectionIssue) {
        setTimeout(async () => {
          try {
            await resetSupabaseClient();
            await checkConnection();
          } catch (error) {
            console.error('Error in delayed connection check:', error);
          }
        }, 2000);
      }
    };
    
    checkAndCleanupState();
  }, [setConnectionIssue]);
};
