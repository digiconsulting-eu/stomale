
import { useState, useEffect } from "react";
import { useLoginState } from "@/hooks/useLoginState";
import { useLoginInitialization } from "@/hooks/useLoginInitialization";

export const useLoginPageState = () => {
  const [connectionIssue, setConnectionIssue] = useState(false);
  
  // Initialize login page and check for issues
  useLoginInitialization(setConnectionIssue);
  
  // Clear the wasLoggedIn flag to prevent showing incorrect logout messages
  useEffect(() => {
    localStorage.removeItem('wasLoggedIn');
  }, []);
  
  // Get login state and handlers
  const {
    isLoading,
    loginProgress,
    loginTimedOut,
    handleSubmit,
    handleReset,
    handleForceReset
  } = useLoginState();

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
