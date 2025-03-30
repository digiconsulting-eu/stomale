
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase, checkClientHealth, resetSupabaseClient } from "@/integrations/supabase/client";
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { 
  loginWithEmailPassword, 
  checkIsAdmin, 
  resetAuthClient,
  checkForCorruptedState
} from "@/utils/auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
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
      
      // Check if Supabase is reachable
      const isClientHealthy = await checkClientHealth();
      if (!isClientHealthy) {
        setConnectionIssue(true);
      }
    };
    
    checkAndCleanupState();
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginTimedOut, setLoginTimedOut] = useState(false);
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);  // Add a counter to track retries

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
      const { data, error } = await supabase.from('users')
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Supabase health check failed:', error);
      return false;
    }
  };

  const handleSubmit = async (data: LoginFormValues) => {
    // Prevent multiple submissions
    if (isLoading) return;
    
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
        const freshClient = await resetSupabaseClient();
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

      // Check if user is admin
      const isAdmin = await checkIsAdmin(data.email);
      console.log("Admin check result:", { isAdmin });
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
          
          {connectionIssue && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Problema di connessione</AlertTitle>
              <AlertDescription>
                Impossibile contattare il server di autenticazione. Prova a ricaricare la pagina.
              </AlertDescription>
              <Button 
                onClick={handleForceReset}
                variant="outline" 
                size="sm"
                className="mt-2 w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ricarica la pagina
              </Button>
            </Alert>
          )}
          
          {loginTimedOut ? (
            <div className="mb-6 text-center">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Timeout di autenticazione</AlertTitle>
                <AlertDescription>
                  La richiesta di login ha impiegato troppo tempo. Il server potrebbe essere sovraccarico al momento.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ripristina e riprova
                </Button>
                <Button 
                  onClick={handleForceReset}
                  variant="outline" 
                  className="px-4 py-2 rounded-md"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Ripristino forzato
                </Button>
              </div>
            </div>
          ) : (
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}
          
          {isLoading && (
            <div className="mt-4">
              <Progress value={loginProgress} className="h-2" />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Autenticazione in corso... {Math.round(loginProgress)}%
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Oppure continua con
                </span>
              </div>
            </div>

            <div className="mt-6">
              <SocialLoginButtons isLoading={isLoading} />
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-2 text-center text-sm">
            <Link
              to="/recupera-password"
              className="text-primary hover:underline"
            >
              Hai dimenticato la password?
            </Link>

            <p className="text-muted-foreground">
              Non hai un account?{" "}
              <Link
                to="/registrati"
                className="text-primary hover:underline"
              >
                Registrati
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
