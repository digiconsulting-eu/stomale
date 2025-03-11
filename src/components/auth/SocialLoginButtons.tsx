
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export const SocialLoginButtons = ({ isLoading: parentIsLoading }: { isLoading: boolean }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("Initiating Google login...");
      
      // Log additional information for debugging
      console.log("Origin URL:", window.location.origin);
      console.log("Redirect URL:", `${window.location.origin}/dashboard`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          }
        }
      });
      
      if (error) {
        console.error("Google login error:", error);
        // Log detailed error information
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error);
        
        toast.error("Errore durante il login con Google", {
          description: `${error.message} (Codice: ${error.code || 'N/A'})`
        });
      } else {
        console.log("Google login initiated successfully:", data);
      }
    } catch (error: any) {
      console.error("Unexpected error during Google login:", error);
      toast.error("Errore durante il login con Google", {
        description: error?.message || "Si è verificato un errore imprevisto"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="w-full max-w-[200px]"
          onClick={handleGoogleLogin}
          disabled={parentIsLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
          ) : (
            <FcGoogle className="h-5 w-5 mr-2" />
          )}
          <span>Google</span>
        </Button>
      </div>
      
      <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <InfoIcon className="h-3 w-3" />
        <span>
          Durante l'accesso verrai reindirizzato su un server sicuro per completare l'autenticazione.
        </span>
      </div>
    </div>
  );
};
