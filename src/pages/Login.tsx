
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

  // Set stronger redirect prevention flags and ensure they persist
  useEffect(() => {
    console.log("Login page mount: Setting redirect prevention flags");
    // Set explicit flags to prevent automatic redirects
    sessionStorage.setItem('onLoginPage', 'true');
    localStorage.setItem('preventRedirects', 'true');
    
    return () => {
      // Only clear these flags if we're not in the middle of a login process
      // The login handlers will manage these flags on successful login
      const isAuthInProgress = localStorage.getItem('last-login-attempt');
      if (!isAuthInProgress) {
        console.log("Login page unmount: Clearing redirect prevention flags");
        sessionStorage.removeItem('onLoginPage');
        localStorage.removeItem('preventRedirects');
      } else {
        console.log("Login page unmount: Keeping redirect prevention flags for login process");
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
