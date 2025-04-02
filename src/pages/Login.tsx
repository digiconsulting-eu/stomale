
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

  // Set stronger redirect prevention flags with longer persistence
  useEffect(() => {
    console.log("Login page mount: Setting redirect prevention flags");
    // Set explicit flags to prevent automatic redirects
    sessionStorage.setItem('onLoginPage', 'true');
    localStorage.setItem('preventRedirects', 'true');
    
    return () => {
      // IMPORTANT: Only clear flags if we're not in the process of logging in
      // This is critical to prevent premature flag clearing during login
      if (!isLoading) {
        console.log("Login page unmount (not loading): Clearing redirect prevention flags");
        // We only clear sessionStorage here - localStorage.preventRedirects will be cleared after successful login
        sessionStorage.removeItem('onLoginPage');
      } else {
        console.log("Login page unmount during loading: Keeping redirect prevention flags");
      }
    };
  }, [isLoading]);

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
