
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
        }
      }
      
      // Check if Supabase is reachable - use GET request instead of HEAD
      // Allow some time before marking as connection issue to handle temporary issues
      setTimeout(async () => {
        const isClientHealthy = await checkClientHealth();
        if (!isClientHealthy) {
          setConnectionIssue(true);
        }
      }, 2000);
    };
    
    checkAndCleanupState();
  }, [setConnectionIssue]);
};
