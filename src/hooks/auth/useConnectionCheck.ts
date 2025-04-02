
import { useState } from "react";
import { checkClientHealth } from "@/integrations/supabase/client";

export const useConnectionCheck = () => {
  const [connectionIssue, setConnectionIssue] = useState(false);

  const checkSupabaseHealth = async () => {
    try {
      return await checkClientHealth();
    } catch (error) {
      console.error('Error during Supabase health check:', error);
      return false;
    }
  };

  return {
    connectionIssue,
    setConnectionIssue,
    checkSupabaseHealth
  };
};
