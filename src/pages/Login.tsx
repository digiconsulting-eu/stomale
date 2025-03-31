
import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { ConnectionErrorAlert } from "@/components/auth/ConnectionErrorAlert";
import { LoginTimeoutAlert } from "@/components/auth/LoginTimeoutAlert";
import { LoginProgress } from "@/components/auth/LoginProgress";
import { useLoginState } from "@/hooks/useLoginState";
import { useLoginInitialization } from "@/hooks/useLoginInitialization";

export default function Login() {
  const [connectionIssue, setConnectionIssue] = useState(false);
  
  // Initialize login page and check for issues
  useLoginInitialization(setConnectionIssue);
  
  // Get login state and handlers
  const {
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginState();

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
