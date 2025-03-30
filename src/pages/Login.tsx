
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { loginWithEmailPassword, checkIsAdmin, resetAuthClient } from "@/utils/auth";
import { Progress } from "@/components/ui/progress";

export default function Login() {
  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Login"));
    
    // When the component mounts, check if there was a previous login attempt
    // that might have left the app in a broken state
    const checkPreviousLogin = async () => {
      const lastLoginAttempt = localStorage.getItem('last-login-attempt');
      if (lastLoginAttempt) {
        const lastAttemptTime = parseInt(lastLoginAttempt, 10);
        const now = Date.now();
        
        // If the last attempt was more than 5 minutes ago, clear any stale state
        if (now - lastAttemptTime > 5 * 60 * 1000) {
          console.log('Found stale login attempt, resetting auth state');
          await resetAuthClient();
        }
      }
    };
    
    checkPreviousLogin();
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginTimedOut, setLoginTimedOut] = useState(false);

  // Function to simulate login progress
  const startLoginProgress = () => {
    setLoginProgress(0);
    setLoginTimedOut(false);
    
    // Update progress every 300ms
    const interval = setInterval(() => {
      setLoginProgress(prev => {
        // Slow down progress as it gets higher to simulate waiting for response
        if (prev < 70) {
          return prev + 5;
        } else if (prev < 90) {
          return prev + 1;
        }
        return prev;
      });
    }, 300);
    
    // After 15 seconds, consider it timed out
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      setLoginTimedOut(true);
      setLoginProgress(100);
    }, 15000);
    
    return { interval, timeoutId };
  };

  const handleSubmit = async (data: LoginFormValues) => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    console.log("Starting login process for:", data.email);
    
    // Record the attempt time
    localStorage.setItem('last-login-attempt', Date.now().toString());
    
    // Start the progress indicator
    const { interval, timeoutId } = startLoginProgress();
    
    try {
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
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Credenziali non valide", {
          description: "Email o password non corretti. Verifica le tue credenziali e riprova."
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Email non confermata", {
          description: "Per favore controlla la tua casella email e clicca sul link di conferma"
        });
      } else if (error.message?.includes('timed out') || error.message?.includes('scaduta')) {
        toast.error("Timeout durante il login", {
          description: "La richiesta ha impiegato troppo tempo. Controlla la tua connessione e riprova.",
          action: {
            label: "Riprova",
            onClick: () => resetAuthClient(),
          }
        });
      } else {
        toast.error("Errore durante il login", {
          description: error.message || "Si è verificato un errore imprevisto. Riprova più tardi.",
          action: {
            label: "Riprova",
            onClick: () => resetAuthClient(),
          }
        });
      }
    } finally {
      // Ensure isLoading is always reset to false when done
      setIsLoading(false);
    }
  };

  // If login timed out, show a message and reset button
  const handleReset = async () => {
    await resetAuthClient();
    setLoginTimedOut(false);
    setLoginProgress(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
          
          {loginTimedOut ? (
            <div className="mb-6 text-center">
              <p className="text-red-500 mb-4">
                La richiesta di login ha impiegato troppo tempo. Ci potrebbe essere un problema con la connessione o con il server.
              </p>
              <button 
                onClick={handleReset}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Ripristina e riprova
              </button>
            </div>
          ) : (
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}
          
          {isLoading && (
            <div className="mt-4">
              <Progress value={loginProgress} className="h-2" />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Autenticazione in corso...
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
