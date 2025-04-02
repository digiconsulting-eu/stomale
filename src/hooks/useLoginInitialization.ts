
import { useEffect } from "react";
import { toast } from "sonner";
import { checkClientHealth, resetSupabaseClient } from "@/integrations/supabase/client";
import { checkForCorruptedState, resetAuthClient } from "@/utils/auth";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export const useLoginInitialization = (setConnectionIssue: (value: boolean) => void) => {
  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Login"));
    
    // Create a flag to track if component is still mounted
    let isMounted = true;
    
    // When the component mounts, check for corrupted state but don't check session
    const checkAndCleanupState = async () => {
      console.log('Login initialization: Starting checks...');
      
      try {
        // Mark that we're on the login page to prevent redirects
        sessionStorage.setItem('onLoginPage', 'true');
        
        // Check for corrupted state
        const isCorrupted = await checkForCorruptedState();
        if (isCorrupted && isMounted) {
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
          console.log('Found previous login attempt from', new Date(lastAttemptTime).toLocaleString());
          
          // If the last attempt was more than 3 minutes ago, clear any stale state
          if (now - lastAttemptTime > 3 * 60 * 1000) {
            console.log('Found stale login attempt, resetting auth state');
            localStorage.removeItem('last-login-attempt');
            await resetAuthClient();
          }
        }
        
        if (!isMounted) return;
        
        // Check if Supabase is reachable
        const checkConnection = async () => {
          try {
            console.log('Checking Supabase connection...');
            const isClientHealthy = await checkClientHealth();
            if (!isClientHealthy && isMounted) {
              console.error('Supabase client health check failed');
              setConnectionIssue(true);
            } else if (isMounted) {
              console.log('Supabase client health check passed');
              setConnectionIssue(false);
            }
          } catch (error) {
            console.error('Error checking client health:', error);
            if (isMounted) setConnectionIssue(true);
          }
        };
        
        // First quick check
        await checkConnection();
        
        // If there's an issue and component is still mounted, try resetting the client
        if (isMounted) {
          setTimeout(async () => {
            try {
              if (!isMounted) return;
              
              await resetSupabaseClient();
              await checkConnection();
            } catch (error) {
              console.error('Error in delayed connection check:', error);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error in initialization:', error);
      }
    };
    
    checkAndCleanupState();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      sessionStorage.removeItem('onLoginPage');
    };
  }, [setConnectionIssue]);
};
