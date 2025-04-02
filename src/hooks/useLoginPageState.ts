
import { useState, useEffect } from "react";
import { useLoginState } from "@/hooks/useLoginState";
import { useLoginInitialization } from "@/hooks/useLoginInitialization";
import { useNavigate } from "react-router-dom";

export const useLoginPageState = () => {
  const [connectionIssue, setConnectionIssue] = useState(false);
  const navigate = useNavigate();
  
  // Initialize login page and check for issues, but don't check session
  useLoginInitialization(setConnectionIssue);
  
  // CRITICAL FIX: Check if already logged in on page load
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isLoggedIn) {
      console.log("useLoginPageState: User already logged in, preparing redirect");
      const redirectTarget = isAdmin ? '/admin' : '/dashboard';
      
      // Clear redirect prevention flags
      sessionStorage.removeItem('onLoginPage');
      localStorage.removeItem('preventRedirects');
      localStorage.removeItem('loginPageActive');
      
      // Navigate to appropriate destination immediately
      navigate(redirectTarget, { replace: true });
    }
    
    // Clear the wasLoggedIn flag to prevent showing incorrect logout messages
    localStorage.removeItem('wasLoggedIn');
  }, [navigate]);
  
  // Get login state and handlers, pass noAutoRedirect flag
  const {
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginState(true); // Pass true to indicate we're on the login page

  return {
    connectionIssue,
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  };
};
