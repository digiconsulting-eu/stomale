
import { useState } from "react";

export const useLoginProgress = () => {
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginTimedOut, setLoginTimedOut] = useState(false);

  // Function to simulate login progress
  const startLoginProgress = () => {
    setLoginProgress(0);
    setLoginTimedOut(false);
    
    // Update progress every 200ms (faster updates)
    const interval = setInterval(() => {
      setLoginProgress(prev => {
        // Slow down progress as it gets higher to simulate waiting for response
        if (prev < 60) {
          return prev + 7;
        } else if (prev < 85) {
          return prev + 3;
        } else if (prev < 95) {
          return prev + 0.5;
        } else {
          return 95;  // Cap at 95% until complete
        }
      });
    }, 200);
    
    // After 20 seconds, consider it timed out (increased from 15)
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      setLoginTimedOut(true);
      setLoginProgress(100);
    }, 20000);
    
    return { interval, timeoutId };
  };

  return {
    loginProgress,
    setLoginProgress,
    loginTimedOut,
    setLoginTimedOut,
    startLoginProgress
  };
};
