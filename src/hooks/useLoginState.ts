
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase, checkClientHealth, resetSupabaseClient } from "@/integrations/supabase/client";
import { loginWithEmailPassword, checkIsAdmin, resetAuthClient } from "@/utils/auth";
import { LoginFormValues } from "@/components/auth/LoginForm";

export const useLoginState = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginTimedOut, setLoginTimedOut] = useState(false);
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);

  // Function to simulate login progress
  const startLoginProgress = () => {
    setLoginProgress(0);
    setLoginTimedOut(false);
    setConnectionIssue(false);
    
    // Update progress every 200ms (faster updates)
    const interval = setInterval(() => {
      setLoginProgress(prev => {
        // Slow down progress as it gets higher to simulate waiting for response
        if (prev < 60) {
          return prev + 7;
        } else if (prev < 85) {
          return prev + 3;
        } else if (prev < 95) {
          return prev + 0.5;
        } else {
          return 95;  // Cap at 95% until complete
        }
      });
    }, 200);
    
    // After 20 seconds, consider it timed out (increased from 15)
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      setLoginTimedOut(true);
      setLoginProgress(100);
    }, 20000);
    
    return { interval, timeoutId };
  };

  const checkSupabaseHealth = async () => {
    try {
      return await checkClientHealth();
    } catch (error) {
      console.error('Error during Supabase health check:', error);
      return false;
    }
  };

  const handleSubmit = async (data: LoginFormValues) => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    // Clear connection issue state when attempting login
    setConnectionIssue(false);
    setIsLoading(true);
    setLoginAttempt(prev => prev + 1);  // Increment retry counter
    console.log("Starting login process for:", data.email, "Attempt:", loginAttempt + 1);
    
    // Record the attempt time
    localStorage.setItem('last-login-attempt', Date.now().toString());
    
    // Check Supabase health first
    const isHealthy = await checkSupabaseHealth();
    if (!isHealthy) {
      setConnectionIssue(true);
      setIsLoading(false);
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

      // Check if user is admin - with retry for better reliability
      let isAdmin = false;
      try {
        isAdmin = await checkIsAdmin(data.email);
        console.log("Admin check result:", { isAdmin });
      } catch (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
        // Retry once
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          isAdmin = await checkIsAdmin(data.email);
        } catch (retryError) {
          console.error("Retry admin check failed:", retryError);
        }
      }
      
      // Update local storage session info
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
      localStorage.setItem('userEmail', data.email);
      
      // Clear the last login attempt marker
      localStorage.removeItem('last-login-attempt');

      toast.success(
        isAdmin ? "Benvenuto nell'area amministrazione" : "Benvenuto nel tuo account"
      );

      // Short delay to allow the progress bar to complete
      setTimeout(() => {
        // Redirect to dashboard
        navigate('/dashboard');
      }, 500);
      
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
            onClick: () => resetAuthClient(),
          }
        });
      }
    } finally {
      // Ensure isLoading is always reset to false when done
      setIsLoading(false);
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
