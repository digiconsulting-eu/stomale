
import { useLoginPageState } from "@/hooks/useLoginPageState";
import { LoginForm } from "@/components/auth/LoginForm";
import { ConnectionErrorAlert } from "@/components/auth/ConnectionErrorAlert";
import { LoginTimeoutAlert } from "@/components/auth/LoginTimeoutAlert";
import { LoginProgress } from "@/components/auth/LoginProgress";
import { LoginCard } from "@/components/auth/LoginCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  
  const {
    connectionIssue,
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginPageState();

  // CRITICAL FIX: More aggressive check for existing login state
  useEffect(() => {
    console.log("Login page mount: Setting redirect prevention flags");
    
    // Check if already logged in immediately
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // If already logged in, redirect immediately without setting flags
    if (isLoggedIn) {
      console.log("User already logged in on Login page load, redirecting immediately");
      const redirectTarget = isAdmin ? '/admin' : '/dashboard';
      
      // Clear redirect prevention flags immediately
      sessionStorage.removeItem('onLoginPage');
      localStorage.removeItem('preventRedirects');
      localStorage.removeItem('loginPageActive');
      
      // Use both navigation approaches for maximum reliability
      navigate(redirectTarget, { replace: true });
      window.location.href = redirectTarget;
      return;
    }
    
    // If not already logged in, set prevention flags
    sessionStorage.setItem('onLoginPage', 'true');
    localStorage.setItem('preventRedirects', 'true');
    localStorage.setItem('loginPageActive', Date.now().toString());
    
    return () => {
      // Only clear these flags if we're not in the middle of a login process
      // and if we're actually navigating away from login (not a refresh)
      const isAuthInProgress = localStorage.getItem('last-login-attempt');
      const loginSucceeded = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isAuthInProgress && !loginSucceeded) {
        console.log("Login page unmount: Clearing redirect prevention flags");
        sessionStorage.removeItem('onLoginPage');
        localStorage.removeItem('preventRedirects');
        localStorage.removeItem('loginPageActive');
      } else {
        console.log("Login page unmount: Keeping redirect prevention flags - auth in progress or login succeeded");
      }
    };
  }, [navigate]);
  
  // Redirect robusto: ascolta l'evento SIGNED_IN anche se la submit non completa
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Aggiorna stato locale
          localStorage.setItem('isLoggedIn', 'true');
          const email = session.user.email || '';
          if (email) {
            const { data: adminData } = await supabase
              .from('admin')
              .select('email')
              .eq('email', email)
              .maybeSingle();
            const isAdmin = !!adminData;
            localStorage.setItem('isAdmin', String(isAdmin));
          }
        } catch (e) {
          // ignora
        } finally {
          // Pulisci i flag che bloccano redirect e naviga
          sessionStorage.removeItem('onLoginPage');
          localStorage.removeItem('preventRedirects');
          localStorage.removeItem('loginPageActive');
          const isAdmin = localStorage.getItem('isAdmin') === 'true';
          navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <LoginCard isLoading={isLoading}>
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
        </LoginCard>
      </div>
    </div>
  );
}
