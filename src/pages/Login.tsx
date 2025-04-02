
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
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const navigate = useNavigate();
  
  // Clear the wasLoggedIn flag to prevent showing incorrect logout messages
  useEffect(() => {
    localStorage.removeItem('wasLoggedIn');
  }, []);
  
  // Initialize login page and check for issues
  useLoginInitialization(setConnectionIssue);
  
  // Separate the session check to its own effect to prevent conflicts 
  useEffect(() => {
    // Flag to track if the component is still mounted
    let isMounted = true;
    
    const checkExistingSession = async () => {
      try {
        console.log("Login page: Starting session check...");
        
        // Set states at the beginning
        if (isMounted) {
          setIsChecking(true);
          setHasExistingSession(false);
        }

        // For debugging purposes, check localStorage first
        const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        console.log("LocalStorage isLoggedIn flag:", localLoggedIn);
        
        // Use a more robust session check with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{data: {session: null}}>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 5000); // Increased timeout
        });
        
        // Use Promise.race with more careful error handling
        const result = await Promise.race([sessionPromise, timeoutPromise])
          .catch(error => {
            console.error("Session check failed:", error);
            return { data: { session: null } };
          });
          
        // Extract session data safely
        const session = result?.data?.session || null;
        
        console.log("Login session check result:", 
          session ? `Session found for: ${session.user?.email || 'unknown'}` : "No valid session");
        
        // Only redirect if the component is still mounted AND we have a fully valid session
        // with both an ID and email to prevent partial session issues
        if (isMounted && session && session.user && 
            session.user.id && session.user.email && 
            session.access_token) {
          
          console.log("Valid session found, preparing redirect:", session.user.email);
          
          // Set the flag first
          setHasExistingSession(true);
          
          // Use a delayed redirect to ensure UI updates first and prevent race conditions
          setTimeout(() => {
            if (isMounted) {
              console.log("Redirecting to dashboard with valid session");
              navigate('/dashboard', { replace: true });
            }
          }, 300);
        } 
        else if (isMounted) {
          console.log("No valid session found, showing login form");
          // Explicitly mark that we're done checking and no valid session exists
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error in session check:", error);
        
        // Only update state if still mounted
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    // Execute the session check
    checkExistingSession();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
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
  
  // If we've detected a valid session but haven't redirected yet, show a loading message
  if (hasExistingSession) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-2"></div>
          <p className="text-sm text-muted-foreground">Accesso effettuato. Reindirizzamento in corso...</p>
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
