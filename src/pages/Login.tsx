
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { ConnectionErrorAlert } from "@/components/auth/ConnectionErrorAlert";
import { LoginTimeoutAlert } from "@/components/auth/LoginTimeoutAlert";
import { LoginProgress } from "@/components/auth/LoginProgress";
import { useLoginState } from "@/hooks/useLoginState";
import { useLoginInitialization } from "@/hooks/useLoginInitialization";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  
  // Clear the wasLoggedIn flag to prevent showing incorrect logout messages
  useEffect(() => {
    localStorage.removeItem('wasLoggedIn');
  }, []);
  
  // Initialize login page and check for issues
  useLoginInitialization(setConnectionIssue);
  
  // Check if already logged in, with better handling to prevent automatic redirects
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setIsChecking(true);
        
        // Get session with a proper timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        // Create a promise that resolves with a properly typed empty session after timeout
        const timeoutPromise = new Promise<{data: {session: null}}>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 2000);
        });
        
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        
        // Only redirect if we have a valid session with a user
        if (data.session && data.session.user && data.session.user.email) {
          console.log("User already has valid session, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Don't redirect on error
      } finally {
        setIsChecking(false);
      }
    };
    
    checkExistingSession();
  }, [navigate]);
  
  // Get login state and handlers
  const {
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginState();

  // Don't render the login form until we've checked for an existing session
  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-2"></div>
          <p className="text-sm text-muted-foreground">Verifica accesso in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Accedi</h1>
          
          {connectionIssue && (
            <ConnectionErrorAlert onReset={handleForceReset} />
          )}
          
          {loginTimedOut ? (
            <LoginTimeoutAlert 
              onReset={handleReset} 
              onForceReset={handleForceReset} 
            />
          ) : (
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}
          
          {isLoading && (
            <LoginProgress value={loginProgress} />
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
