
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginProgress } from "./useLoginProgress";
import { useConnectionCheck } from "./useConnectionCheck";
import { useSessionCheck } from "./useSessionCheck";
import { resetAuthClient } from "@/utils/auth/resetUtils";
import { loginWithEmailPassword } from "@/utils/auth/loginUtils";
import { checkIsAdmin } from "@/utils/auth/adminUtils";
import { resetSupabaseClient } from "@/integrations/supabase/client";
import { LoginFormValues } from "@/components/auth/LoginForm";

export const useLoginHandlers = (noAutoRedirect: boolean = false) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const isProcessing = useRef(false);
  
  const { 
    loginProgress, 
    setLoginProgress, 
    loginTimedOut, 
    setLoginTimedOut,
    startLoginProgress 
  } = useLoginProgress();
  
  const { 
    connectionIssue, 
    setConnectionIssue, 
    checkSupabaseHealth 
  } = useConnectionCheck();
  
  const { checkExistingSession } = useSessionCheck();

  const handleSubmit = async (data: LoginFormValues) => {
    // CRITICAL FIX: Prevent multiple submissions or concurrent login attempts
    if (isLoading || isProcessing.current) {
      console.log("Login already in progress, ignoring request");
      return;
    }
    
    console.log("Login form submitted, handling login process");
    isProcessing.current = true;
    
    // Check if already logged in first - only perform this check on submit
    const hasSession = await checkExistingSession(noAutoRedirect);
    if (hasSession) {
      console.log("User already has a valid session, redirecting to dashboard");
      
      // First check if the user is an admin
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const redirectTarget = isAdmin ? '/admin' : '/dashboard';
      
      // Clear redirect prevention flags before redirecting
      sessionStorage.removeItem('onLoginPage');
      localStorage.removeItem('preventRedirects');
      localStorage.removeItem('loginPageActive');
      
      navigate(redirectTarget, { replace: true });
      isProcessing.current = false;
      return;
    }
    
    // Make sure we don't accidentally show the logout message
    localStorage.removeItem('wasLoggedIn');
    
    // Clear connection issue state when attempting login
    setConnectionIssue(false);
    setIsLoading(true);
    setLoginAttempt(prev => prev + 1);  // Increment retry counter
    console.log("Starting login process for:", data.email, "Attempt:", loginAttempt + 1);
    
    // Record the attempt time
    localStorage.setItem('last-login-attempt', Date.now().toString());
    
    // Ensure redirect prevention flags are set
    sessionStorage.setItem('onLoginPage', 'true');
    localStorage.setItem('preventRedirects', 'true');
    localStorage.setItem('loginPageActive', Date.now().toString());
    
    // Check Supabase health first
    const isHealthy = await checkSupabaseHealth();
    if (!isHealthy) {
      setConnectionIssue(true);
      setIsLoading(false);
      isProcessing.current = false;
      toast.error("Impossibile contattare il server di autenticazione");
      return;
    }
    
    // Start the progress indicator
    const { interval, timeoutId } = startLoginProgress();
    
    try {
      // Try to initialize a fresh client if this is a retry
      if (loginAttempt > 0) {
        await resetSupabaseClient();
        console.log("Using fresh Supabase client for retry attempt");
        // Add a small delay before attempting login again
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Use the improved login function with timeout
      const { data: authData, error: signInError } = await loginWithEmailPassword(data.email, data.password);

      // Clear the progress timers
      clearInterval(interval);
      clearTimeout(timeoutId);
      
      if (signInError) {
        throw signInError;
      }

      if (!authData?.user) {
        throw new Error("Non è stato possibile recuperare i dati utente");
      }

      console.log("User authenticated successfully:", authData.user.email);

      // Complete the progress bar
      setLoginProgress(100);

      // Check if user is admin immediately
      let isAdmin = false;
      try {
        console.log("Checking admin status for:", data.email);
        isAdmin = await checkIsAdmin(data.email);
        console.log("Admin check result:", isAdmin);

        // Store results immediately
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        localStorage.setItem('userEmail', data.email);
      } catch (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
        isAdmin = false;
      }
      
      // Set a flag that user is now logged in (for proper logout message later)
      localStorage.setItem('wasLoggedIn', 'true');
      
      // Clear the last login attempt marker
      localStorage.removeItem('last-login-attempt');
      
      toast.success(
        isAdmin ? "Benvenuto nell'area amministrazione" : "Benvenuto nel tuo account"
      );
      
      // CRITICAL FIX: Add logging to see exactly what's happening
      console.log(`LOGIN SUCCESS - User is admin: ${isAdmin}, redirecting to: ${isAdmin ? '/admin' : '/dashboard'}`);
      
      // CRITICAL FIX: Add a forced approach to redirects
      const redirectTarget = isAdmin ? '/admin' : '/dashboard'; 
      
      // Clear all prevention flags IMMEDIATELY before redirect
      sessionStorage.removeItem('onLoginPage');
      localStorage.removeItem('preventRedirects');
      localStorage.removeItem('loginPageActive');
      
      // Force immediate navigation with direct window.location approach
      console.log(`Forcing immediate redirect to ${redirectTarget}`);
      
      // Use a direct navigation approach with replace
      window.location.href = redirectTarget;

      // Clean up processing flag after navigation
      isProcessing.current = false;
      
    } catch (error: any) {
      console.error('Error during login process:', error);
      
      // Clear the progress timers
      clearInterval(interval);
      clearTimeout(timeoutId);
      
      // Complete the progress to show we're done
      setLoginProgress(100);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Credenziali non valide", {
          description: "Email o password non corretti. Verifica le tue credenziali e riprova."
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Email non confermata", {
          description: "Per favore controlla la tua casella email e clicca sul link di conferma"
        });
      } else if (error.message?.includes('timed out') || error.message?.includes('scaduta') || 
                error.message?.includes('timeout') || error.message?.includes('impiegato troppo tempo')) {
        setLoginTimedOut(true);
        toast.error("Timeout durante il login", {
          description: "Il server non risponde. Prova a ricaricare la pagina e riprova.",
          action: {
            label: "Riprova",
            onClick: () => handleReset(),
          }
        });
      } else if (error.code === 'AUTH_INVALID_SESSION') {
        toast.error("Sessione non valida", {
          description: "La sessione precedente è scaduta o non valida. Effettua nuovamente il login.",
          action: {
            label: "Ripristina",
            onClick: () => resetAuthClient(),
          }
        });
      } else {
        toast.error("Errore durante il login", {
          description: error.message || "Si è verificato un errore imprevisto. Riprova più tardi.",
          action: {
            label: "Ripristina",
            onClick: () => handleReset(),
          }
        });
      }
      
      isProcessing.current = false;
    } finally {
      // Ensure isLoading is always reset to false when done
      setIsLoading(false);
      // If not already cleared by successful flow
      if (isProcessing.current) {
        isProcessing.current = false;
      }
    }
  };

  // Reset handler for when login times out
  const handleReset = async () => {
    // Clear the progress
    setLoginProgress(0);
    setLoginTimedOut(false);
    setConnectionIssue(false);
    
    // Reset the auth client
    await resetAuthClient();
    
    // Reset login attempt counter
    setLoginAttempt(0);
    
    toast.info("Sistema ripristinato, puoi riprovare il login");
  };

  // Complete force reset that clears all localStorage and cookies
  const handleForceReset = async () => {
    // Clear all local storage
    localStorage.clear();
    
    // Clear cookies related to supabase
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Reset auth client
    await resetAuthClient();
    
    // Reload the page
    window.location.reload();
  };

  return {
    isLoading,
    loginProgress,
    loginTimedOut,
    connectionIssue,
    handleSubmit,
    handleReset,
    handleForceReset
  };
};
