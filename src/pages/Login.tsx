
import { useLoginPageState } from "@/hooks/useLoginPageState";
import { LoginForm } from "@/components/auth/LoginForm";
import { ConnectionErrorAlert } from "@/components/auth/ConnectionErrorAlert";
import { LoginTimeoutAlert } from "@/components/auth/LoginTimeoutAlert";
import { LoginProgress } from "@/components/auth/LoginProgress";
import { LoginCard } from "@/components/auth/LoginCard";
import { useEffect } from "react";

export default function Login() {
  const {
    connectionIssue,
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginPageState();

  // Set strong redirect prevention flags that will persist
  // CRITICAL FIX: Make prevention flags stronger and more reliable
  useEffect(() => {
    console.log("Login page mount: Setting redirect prevention flags");
    
    // Set explicit flags to prevent automatic redirects
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
  }, []);

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
