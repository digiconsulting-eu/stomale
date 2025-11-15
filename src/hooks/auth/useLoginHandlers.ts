
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginProgress } from "./useLoginProgress";
import { useConnectionCheck } from "./useConnectionCheck";
import { resetAuthClient } from "@/utils/auth/resetUtils";
import { loginWithEmailPassword } from "@/utils/auth/loginUtils";
import { LoginFormValues } from "@/components/auth/LoginForm";

export const useLoginHandlers = (noAutoRedirect: boolean = false) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isProcessing = useRef(false);
  
  const { 
    loginProgress, 
    setLoginProgress, 
    loginTimedOut, 
    setLoginTimedOut,
    startLoginProgress 
  } = useLoginProgress();
  
  const { 
    connectionIssue, 
    setConnectionIssue, 
    checkSupabaseHealth 
  } = useConnectionCheck();

  const handleSubmit = async (data: LoginFormValues) => {
    if (isLoading || isProcessing.current) {
      console.log("Login in corso, richiesta ignorata");
      return;
    }
    
    console.log("Login richiesto per:", data.email);
    isProcessing.current = true;
    setIsLoading(true);
    setConnectionIssue(false);
    
    const { interval, timeoutId } = startLoginProgress();
    
    try {
      const { data: authData, error: signInError } = await loginWithEmailPassword(data.email, data.password);

      clearInterval(interval);
      clearTimeout(timeoutId);
      
      if (signInError) {
        console.error("Login error:", signInError);
        setLoginProgress(0);
        setIsLoading(false);
        isProcessing.current = false;
        
        if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Credenziali non valide')) {
          toast.error("Credenziali non valide");
        } else {
          toast.error("Errore durante il login");
        }
        return;
      }
      
      console.log("Login completato con successo");
      
      // Get admin status from localStorage (already set in loginUtils)
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const redirectTarget = isAdmin ? '/admin' : '/dashboard';
      
      console.log("Redirect a:", redirectTarget, "- isAdmin:", isAdmin);
      
      // Complete progress
      setLoginProgress(100);
      toast.success("Accesso effettuato!");
      
      // Navigate
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(redirectTarget, { replace: true });
      
    } catch (error: any) {
      clearInterval(interval);
      clearTimeout(timeoutId);
      
      console.error("Errore login:", error);
      setLoginProgress(0);
      setIsLoading(false);
      isProcessing.current = false;
      
      toast.error(error.message || "Errore durante il login");
    }
  };

  const handleReset = async () => {
    console.log("Resetting login state");
    setIsLoading(false);
    setLoginProgress(0);
    setLoginTimedOut(false);
    setConnectionIssue(false);
    isProcessing.current = false;
  };

  const handleForceReset = async () => {
    console.log("Force resetting authentication client");
    toast.info("Ripristino del client di autenticazione in corso...");
    
    try {
      await resetAuthClient();
      await handleReset();
      toast.success("Client ripristinato con successo. Prova ora a effettuare il login.");
    } catch (error) {
      console.error("Error during force reset:", error);
      toast.error("Errore durante il ripristino. Ricarica la pagina.");
    }
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
